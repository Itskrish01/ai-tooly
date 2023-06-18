import axios from "axios";
import { useFormik } from "formik";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { useState } from "react";
import { Image } from "primereact/image";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { useRef } from "react";

const ImageGen = () => {
  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imagesResults, setImagesResults] = useState([]);

  const options = {
    method: "POST",
    url: "https://ai-image-generator3.p.rapidapi.com/generate",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "9f7697b11dmsh392737e66bf0befp13cfafjsn205dbfa5888c",
      "X-RapidAPI-Host": "ai-image-generator3.p.rapidapi.com",
    },
    data: {
      prompt: prompt,
      page: 1,
    },
  };

  const formik = useFormik({
    initialValues: {
      value: "",
    },
    validate: (data) => {
      let errors = {};

      if (!data.value) {
        errors.value = "Prompt is required.";
      }

      return errors;
    },
    onSubmit: async (data) => {
      try {
        setIsLoading(true);
        const response = await axios.request(options);
        setImagesResults(response?.data.results.images);
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
    },
  });

  const isFormFieldInvalid = (name) =>
    !!(formik.touched[name] && formik.errors[name]);

  const getFormErrorMessage = (name) => {
    return isFormFieldInvalid(name) ? (
      <small className="text-red-500">{formik.errors[name]}</small>
    ) : (
      <small className="text-red-500">&nbsp;</small>
    );
  };

  return (
    <div className="mt-10 ">
      <Toast ref={toast} />
      <div>
        <span className=" w-full">
          <form
            className="p-input-icon-left w-full"
            onSubmit={(e) => {
              e.preventDefault();
              formik.submitForm();
            }}
          >
            <i className="pi pi-search" />
            <InputText
              id="value"
              name="value"
              placeholder="Write a prompt to generate a image, i.e. A boy running in ground with a dog."
              style={{ width: "100%" }}
              value={formik.values.value}
              onChange={(e) => {
                setPrompt(e.target.value);
                formik.setFieldValue("value", e.target.value);
              }}
              className={classNames({
                "p-invalid": isFormFieldInvalid("value"),
              })}
            />
          </form>
        </span>
        {getFormErrorMessage("value")}
      </div>
      <div className="mt-5 mb-20 cabin-font w-full">
        <p className="text-right px-2 pb-1 text-gray-600 w-full">
          Total results - {imagesResults ? imagesResults.length : 0}
        </p>
        <div className="border overflow-y-auto relative rounded-md border-gray-300  h-[80vh]">
          {isLoading ? (
            <ProgressBar
              mode="indeterminate"
              style={{
                height: "5px",
                position: "absolute",
                width: "100%",
                top: 0,
              }}
            ></ProgressBar>
          ) : (
            ""
          )}

          {imagesResults.length === 0 && !isLoading && (
            <div className="flex gap-4 robot-slab items-center h-full justify-center text-gray-500">
              <span>Images loads here</span>
              <i className="pi pi-image"></i>
            </div>
          )}
          {imagesResults.length > 0 && !isLoading && (
            <div className="grid sm:grid-cols-5 grid-cols-1 px-4 py-4 gap-4">
              {imagesResults.map((item, id) => {
                return (
                  <div key={id} className="rounded-md overflow-hidden">
                    <Image src={item} alt="Image" preview loading="lazy" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGen;
