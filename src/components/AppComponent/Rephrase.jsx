import { useRef, useState } from "react";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import axios from "axios";
import { Toast } from "primereact/toast";

const Rephrase = () => {
  const toast = useRef(null);
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [RephraseResult, setRephraseResult] = useState("");

  const options = {
    method: "POST",
    url: "https://paraphraser1.p.rapidapi.com/",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "a244a76a06msh533558e4eb0c0e0p1a2050jsn84873ca3f3a9",
      "X-RapidAPI-Host": "paraphraser1.p.rapidapi.com",
    },
    data: {
      input: value,
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.request(options);
      setRephraseResult(response.data.output);
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Something went wrong, Please try again later",
        life: 3000,
      });
    }
    setIsLoading(false);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
    textareaRef.current.style.height = "auto"; // Reset height to recalculate
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };
  return (
    <div className="sm:mt-20 mt-10 max-w-5xl mx-auto container">
      <Toast ref={toast} />
      <div className=" mt-5">
        <div
          className={`border rounded-lg   pt-4 pb-10 relative transition-all duration-200 w-full ${
            isFocus ? "border-indigo-600" : "border-gray-300"
          } `}
        >
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              placeholder="Write something..."
              onBlur={() => setIsFocus(false)}
              onFocus={() => setIsFocus(true)}
              maxLength={1000}
              type="text"
              className={`${
                value.length > 135 ? "text-xl" : "text-2xl"
              } w-full resize-none px-4  text-black/70  focus:outline-none`}
            />
            <div>
              {value && (
                <i
                  onClick={() => {
                    setValue("");
                    setRephraseResult("");
                  }}
                  className="pi pi-times text-gray-500 hover:bg-slate-300/50 p-2 mx-2 rounded-full cursor-pointer"
                  style={{ color: "smoke", fontSize: 16 }}
                ></i>
              )}
            </div>
            <span
              className={`absolute ${
                value.length == 1000
                  ? "text-red-500 font-semibold"
                  : "text-gray-400"
              } bottom-2 right-3 text-xs`}
            >
              {value.length} / 1000
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5 text-gray-400 mt-10 justify-center">
          <p className="cabin-font uppercase  text-center">
            {isLoading ? "Rephrasing..." : "Rephrase"}
          </p>
          {isLoading ? (
            <div aria-label="Loading..." role="status">
              <svg className="h-6 w-6 animate-spin" viewBox="3 3 18 18">
                <path
                  className="fill-gray-200"
                  d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
                ></path>
                <path
                  className="fill-gray-500"
                  d="M16.9497 7.05015C14.2161 4.31648 9.78392 4.31648 7.05025 7.05015C6.65973 7.44067 6.02656 7.44067 5.63604 7.05015C5.24551 6.65962 5.24551 6.02646 5.63604 5.63593C9.15076 2.12121 14.8492 2.12121 18.364 5.63593C18.7545 6.02646 18.7545 6.65962 18.364 7.05015C17.9734 7.44067 17.3403 7.44067 16.9497 7.05015Z"
                ></path>
              </svg>
            </div>
          ) : (
            <i className="pi pi-arrow-down"></i>
          )}
        </div>
        <div
          className={`rounded-lg h-auto bg-gray-100 mt-10 pt-4 pb-10 relative transition-all duration-200 w-full `}
        >
          {isLoading && (
            <ProgressBar
              mode="indeterminate"
              style={{
                height: "3px",
                position: "absolute",
                width: "100%",
                top: 0,
              }}
            ></ProgressBar>
          )}

          <div className="flex gap-4">
            <textarea
              ref={textareaRef}
              value={RephraseResult}
              placeholder={isLoading ? "Rephrasing..." : "Result here..."}
              maxLength={500}
              type="text"
              disabled
              className={`${
                value.length > 135 ? "text-xl" : "text-2xl"
              } w-full resize-none bg-transparent px-4 text-black/70 focus:outline-none`}
            />

            <div className="absolute bottom-2 right-3 space-x-3">
              {RephraseResult.length > 0 && (
                <span
                  className={` cursor-pointer`}
                  onClick={() =>
                    navigator.clipboard.writeText(RephraseResult).then(() =>
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
      <div className="flex justify-center mt-10">
        <Button
          label="Rephrase"
          disabled={!value}
          onClick={handleSubmit}
          icon="pi pi-bolt"
          size="small"
        />
      </div>
    </div>
  );
};

export default Rephrase;
