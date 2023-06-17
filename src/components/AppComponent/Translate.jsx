import { useRef, useState } from "react";

import { Dropdown } from "primereact/dropdown";
import { Languages } from "../../data/languages";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import axios from "axios";

const Translate = () => {
  const toast = useRef(null);
  const textareaRef = useRef(null);
  const [activeLanguage, setActiveLanguage] = useState("");
  const [activeLanguage2, setActiveLanguage2] = useState("");
  const [translateResult, setTranslationResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState("");
  const [sourcelang, setSourceLang] = useState("");
  const [targetlang, setTargetLang] = useState("");

  // Please translate from ${sourcelang} to ${targetlang}, this text - ${value}

  const options = {
    method: "POST",
    url: "https://rapid-translate-multi-traduction.p.rapidapi.com/t",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "a244a76a06msh533558e4eb0c0e0p1a2050jsn84873ca3f3a9",
      "X-RapidAPI-Host": "rapid-translate-multi-traduction.p.rapidapi.com",
    },
    data: {
      from: sourcelang,
      to: targetlang,
      q: value,
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.request(options);
      setTranslationResult(response.data[0]);
      console.log(response.data);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Something went wrong, Please try again later",
        life: 5000,
      });
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
    textareaRef.current.style.height = "auto"; // Reset height to recalculate
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="mt-10 grid sm:grid-cols-2 grid-cols-1 gap-5">
        <div>
          <div className="flex">
            <Dropdown
              value={activeLanguage}
              onChange={(e) => {
                setActiveLanguage(e.value);
                setSourceLang(e.value.code);
              }}
              options={Languages}
              optionLabel="name"
              placeholder="Select a Language"
              filter
              style={{ border: 0 }}
            />
          </div>
          <div className="flex mt-5">
            <div
              className={`border rounded-lg h-auto pt-4 pb-10 relative transition-all duration-200 w-full ${
                isFocus ? "border-indigo-600" : "border-gray-300"
              } `}
            >
              <div className="flex gap-4">
                <textarea
                  ref={textareaRef}
                  placeholder="Write something..."
                  value={value}
                  onChange={handleChange}
                  onBlur={() => setIsFocus(false)}
                  onFocus={() => setIsFocus(true)}
                  maxLength={500}
                  type="text"
                  className={`${
                    value.length > 135 ? "text-xl" : "text-2xl"
                  } w-full resize-none px-4 text-black/70  focus:outline-none`}
                />
                <div>
                  {value && (
                    <i
                      onClick={() => {
                        setValue("");
                        setTranslationResult("");
                      }}
                      className="pi pi-times text-gray-500 hover:bg-slate-300/50 p-2 mx-2 rounded-full cursor-pointer"
                      style={{ color: "smoke", fontSize: 16 }}
                    ></i>
                  )}
                </div>
                <span
                  className={`absolute ${
                    value.length == 500
                      ? "text-red-500 font-semibold"
                      : "text-gray-400"
                  } bottom-2 right-3 text-xs`}
                >
                  {value.length} / 500
                </span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex">
            <Dropdown
              value={activeLanguage2}
              onChange={(e) => {
                setActiveLanguage2(e.value);
                setTargetLang(e.value.code);
              }}
              options={Languages}
              optionLabel="name"
              placeholder="Select a Language"
              filter
              style={{ border: 0 }}
            />
          </div>
          <div className="flex mt-5">
            <div
              className={`rounded-lg h-auto bg-gray-100 pt-4 pb-10 relative transition-all duration-200 w-full `}
            >
              <div className="flex gap-4">
                <textarea
                  ref={textareaRef}
                  maxLength={500}
                  value={isLoading ? "Translating..." : translateResult}
                  type="text"
                  placeholder="Result here..."
                  disabled
                  className={`${
                    value.length > 135 ? "text-xl" : "text-2xl"
                  } w-full resize-none bg-transparent px-4 text-black/70 focus:outline-none`}
                />

                <div className="absolute bottom-2 right-3 space-x-3">
                  {translateResult.length > 0 && (
                    <span
                      className={` cursor-pointer`}
                      onClick={() =>
                        navigator.clipboard
                          .writeText(translateResult)
                          .then(() =>
                            toast.current.show({
                              severity: "success",
                              summary: "Success",
                              detail: "Successfully copied the text",
                              life: 3000,
                            })
                          )
                      }
                    >
                      <i className="pi pi-copy text-gray-500"></i>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-10">
        <Button
          label="Translate"
          disabled={!value || !targetlang || !sourcelang}
          onClick={handleSubmit}
          icon="pi pi-arrow-right-arrow-left"
          size="small"
        />
      </div>
    </>
  );
};

export default Translate;
