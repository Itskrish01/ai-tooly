import { useEffect, useRef, useState } from "react";

import { Dropdown } from "primereact/dropdown";
import { Languages } from "../../data/languages";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Sidebar } from "primereact/sidebar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { TabMenu } from "primereact/tabmenu";
import { useContext } from "react";
import { AppContext } from "../../context";

const Translate = () => {
  const toast = useRef(null);

  const [fromLanguage, setFromLanguage] = useState([
    { label: "Hindi", langcode: "hi" },
    { label: "English", langcode: "en" },
    { label: "Japanese", langcode: "ja" },
  ]);
  const [toLanguage, setToLanguage] = useState([
    { label: "English", langcode: "en" },
    { label: "Hindi", langcode: "hi" },
    { label: "Japanese", langcode: "ja" },
  ]);
  const [visibleLeft, setVisibleLeft] = useState(false);
  const [activeIndex, setActiveIndex] = useState("null");
  const [activeIndex2, setActiveIndex2] = useState("null");
  const [filterWord, setFilterWord] = useState("");
  const textareaRef = useRef(null);

  const [fromLanguageShow, setFromLanguageShow] = useState(false);
  const [toLanguageShow, setToLanguageShow] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState("");
  const [activeLanguage2, setActiveLanguage2] = useState("");
  const [translationss, setTranslations] = useState([]);
  const [translateResult, setTranslationResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const storedTranslations = localStorage.getItem("translations");
    if (storedTranslations) {
      const translations = JSON.parse(storedTranslations);
      setTranslations(translations);
    }
  }, [translateResult]);

  const clearLocalStorage = () => {
    localStorage.removeItem("translations");
  };

  const accept = () => {
    toast.current.show({
      severity: "success",
      summary: "Deleted",
      detail: "The history has been cleared!",
      life: 3000,
    });
  };

  // Function to handle clearing of localStorage
  const handleClearLocalStorage = () => {
    clearLocalStorage();

    accept();
    // Optionally, update the translations state or perform any other necessary operations
  };

  const saveTranslationToLocalStorage = (translation) => {
    const storedTranslations = localStorage.getItem("translations");
    let translations = storedTranslations ? JSON.parse(storedTranslations) : [];

    // Check if the translation already exists in the array
    const existingTranslation = translations.find(
      (t) =>
        t.id === translation.id &&
        t.sourcelang === translation.sourcelang &&
        t.targetlang === translation.targetlang
    );

    if (!existingTranslation) {
      translations.push(translation);
      localStorage.setItem("translations", JSON.stringify(translations));
    }
  };
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
      from: activeLanguage.langcode,
      to: activeLanguage2.langcode,
      q: value,
    },
  };

  const deleteTranslationFromLocalStorage = (id) => {
    const storedTranslations = localStorage.getItem("translations");
    if (storedTranslations) {
      let translations = JSON.parse(storedTranslations);
      translations = translations.filter((t) => t.id !== id);
      localStorage.setItem("translations", JSON.stringify(translations));
    }
  };

  const handleDelete = (id) => {
    deleteTranslationFromLocalStorage(id);
    // Optionally, update the translations state or perform any other necessary operations
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.request(options);
      console.log(response);
      const translationObject = {
        id: uuidv4(),
        translation: response.data[0],
        value: value,
        sourcelang: activeLanguage.label,
        targetlang: activeLanguage2.label,
      };
      setTranslationResult(translationObject.translation);

      saveTranslationToLocalStorage(translationObject);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          "Something went wrong, please try again later or the language is not supported.",
        life: 5000,
      });
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  const handleLanguageClick = (language) => {
    // Create a new array with the clicked language at the beginning
    const updatedFromLanguage = [
      language,
      ...fromLanguage.slice(0, fromLanguage.length - 1),
    ];

    // Update the fromLanguage state with the modified array
    setFromLanguage(updatedFromLanguage);

    // Update the active index and language
    setActiveIndex(0);
    setActiveLanguage(language);
  };

  const handleLanguage2Click = (language) => {
    // Create a new array with the clicked language at the beginning
    const updatedFromLanguage = [
      language,
      ...toLanguage.slice(0, toLanguage.length - 1),
    ];

    // Update the fromLanguage state with the modified array
    setToLanguage(updatedFromLanguage);

    // Update the active index and language
    setActiveIndex2(0);
    setActiveLanguage2(language);
  };

  return (
    <>
      <Sidebar
        visible={fromLanguageShow}
        fullScreen
        onHide={() => setFromLanguageShow(false)}
      >
        <input
          type="text"
          placeholder="Search Language..."
          value={filterWord}
          onChange={(e) => setFilterWord(e.target.value)}
          className="border border-gray-200 w-full px-6 py-5 focus:outline-none shadow-sm text-gray-500"
        />
        <div className="px-6">
          <div className="mt-4 grid-cols-1 grid gap-2 md:grid-cols-4 lg:grid-cols-6">
            {Languages.filter((item) =>
              item.label.includes(
                filterWord.charAt(0).toUpperCase() + filterWord.slice(1)
              )
            ).map((language) => {
              return (
                <div
                  key={language.langcode}
                  onClick={() => {
                    handleLanguageClick(language);
                    setTimeout(() => {
                      setFromLanguageShow(false);
                      setFilterWord("");
                    }, 200);
                  }}
                  className={`${
                    language.label === activeLanguage.label
                      ? "bg-indigo-500/70 text-white"
                      : "hover:bg-gray-200"
                  } cursor-pointer px-4 py-2 rounded-md `}
                >
                  {language.label}
                </div>
              );
            })}
          </div>
        </div>
      </Sidebar>
      <Sidebar
        visible={toLanguageShow}
        fullScreen
        onHide={() => setToLanguageShow(false)}
      >
        <input
          type="text"
          placeholder="Search Language..."
          value={filterWord}
          onChange={(e) => setFilterWord(e.target.value)}
          className="border border-gray-200 w-full px-6 py-5 focus:outline-none shadow-sm text-gray-500"
        />
        <div className="px-6">
          <div className="mt-4 grid-cols-1 grid gap-2 md:grid-cols-4 lg:grid-cols-6">
            {Languages.filter((item) =>
              item.label.includes(
                filterWord.charAt(0).toUpperCase() + filterWord.slice(1)
              )
            ).map((language) => {
              return (
                <div
                  key={language.langcode}
                  onClick={() => {
                    handleLanguage2Click(language);
                    setTimeout(() => {
                      setToLanguageShow(false);
                      setFilterWord("");
                    }, 200);
                  }}
                  className={`${
                    language.label === activeLanguage2.label
                      ? "bg-indigo-500/70 text-white"
                      : "hover:bg-gray-200"
                  } cursor-pointer px-4 py-2 rounded-md `}
                >
                  {language.label}
                </div>
              );
            })}
          </div>
        </div>
      </Sidebar>

      <Sidebar
        visible={visibleLeft}
        position="right"
        title="History"
        style={{ width: 500 }}
        onHide={() => setVisibleLeft(false)}
      >
        <h4 className="text-2xl px-4 font-semibold text-black/80 py-4 border-b ">
          History
        </h4>
        <div className="py-3 flex justify-end">
          <span
            onClick={handleClearLocalStorage}
            className=" mx-2 text-indigo-500 font-semibold cursor-pointer bg-indigo-200/20 active:bg-indigo-400/20 select-none rounded py-1 px-2"
          >
            Clear all history
          </span>
        </div>
        <div className="border-t overflow-y-auto ">
          {translationss.length === 0 && (
            <div className="mt-10">
              <h4 className="text-center text-2xl">
                No translations are found
              </h4>
            </div>
          )}
        </div>
        {translationss.length !== 0 && (
          <div className="border-t overflow-y-auto h-[70vh]">
            {translationss.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setValue(item.value);
                    setTranslationResult(item.translation);
                    setActiveLanguage(item.sourcelang);
                    setActiveLanguage2(item.targetlang);
                  }}
                  className="hover:bg-gray-200 border-b  cursor-pointer"
                >
                  <div className="p-5 ">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <span className="text-xs">{item.sourcelang}</span>{" "}
                        <i
                          className="pi pi-arrow-right"
                          style={{ fontSize: 10 }}
                        ></i>
                        <span className="text-xs">{item.targetlang}</span>
                      </div>
                      <div onClick={() => handleDelete(item.id)}>
                        <i className="pi pi-trash text-red-500 cursor-pointer"></i>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p>{item.value}</p>
                      <p className="text-gray-500/80">{item.translation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Sidebar>
      <Toast ref={toast} />
      <div className="mt-10 grid sm:grid-cols-2 grid-cols-1 gap-5">
        <div>
          <div className="flex gap-5">
            <TabMenu
              model={fromLanguage}
              className="ml-2"
              activeIndex={activeIndex}
              onTabChange={(e) => {
                setActiveLanguage(e.value);
                setActiveIndex(e.index);
              }}
            />
            <Button
              icon="pi pi-ellipsis-h"
              text
              aria-label="Filter"
              onClick={() => setFromLanguageShow(true)}
              tooltip="More languages"
              tooltipOptions={{
                position: "bottom",
                mouseTrack: true,
                mouseTrackTop: 15,
              }}
            />
          </div>
          <div className="flex">
            <div
              className={`border rounded-lg pt-4 pb-10 relative transition-all duration-200 w-full ${
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
                  } w-full resize-none px-4 h-auto text-black/70  focus:outline-none`}
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
            <TabMenu
              model={toLanguage}
              className="ml-2"
              activeIndex={activeIndex2}
              onTabChange={(e) => {
                setActiveLanguage2(e.value);
                setActiveIndex2(e.index);
              }}
            />
            <Button
              icon="pi pi-ellipsis-h"
              text
              aria-label="Filter"
              onClick={() => setToLanguageShow(true)}
              tooltip="More languages"
              tooltipOptions={{
                position: "bottom",
                mouseTrack: true,
                mouseTrackTop: 15,
              }}
            />
          </div>
          <div className="flex">
            <div
              className={`rounded-lg h-auto bg-gray-100 pt-4 pb-10 relative transition-all duration-200 w-full `}
            >
              <div className="flex gap-4">
                <textarea
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
      <div className="flex justify-center gap-5 mt-10">
        <Button
          label="Translate"
          loading={isLoading}
          disabled={!value || !activeLanguage || !activeLanguage2}
          onClick={handleSubmit}
          icon="pi pi-arrow-right-arrow-left"
          size="small"
        />
        <Button
          label="History"
          severity="secondary"
          onClick={() => setVisibleLeft(true)}
          icon="pi pi-history"
          size="small"
          outlined
        />
      </div>
    </>
  );
};

export default Translate;
