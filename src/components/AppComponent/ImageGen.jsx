import axios from "axios";
import { useFormik } from "formik";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { useRef, useState } from "react";
import { Image } from "primereact/image";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";

const SUGGESTIONS = [
  "An astronaut riding a horse on Mars, cinematic lighting",
  "A cozy reading nook with rain on the window, photorealistic",
  "Minimalist product shot of headphones on marble, studio light",
  "Isometric 3d render of a tiny city floating on a cloud",
];

const ImageGen = () => {
  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imagesResults, setImagesResults] = useState([]);

  const options = {
    method: "POST",
    url: "https://api.openai.com/v1/images/generations",
    headers: {
      "content-type": "application/json",
      "api-key": "85e540e6-08d7-4a11-896d-7dca49648f43",
    },
    data: { text: prompt },
  };

  const formik = useFormik({
    initialValues: { value: "" },
    validate: (data) => {
      let errors = {};
      if (!data.value) errors.value = "Prompt is required.";
      return errors;
    },
    onSubmit: async () => {
      try {
        setIsLoading(true);
        const response = await axios.request(options);
        setImagesResults(response?.data.results.images);
      } catch (error) {
        console.error(error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Something went wrong, please try again later.",
          life: 3000,
        });
      }
      setIsLoading(false);
    },
  });

  const isFormFieldInvalid = (name) =>
    !!(formik.touched[name] && formik.errors[name]);

  return (
    <div>
      <Toast ref={toast} />

      {/* Prompt card */}
      <div className="surface p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            formik.submitForm();
          }}
        >
          <span className="p-input-icon-left w-full block">
            <i className="pi pi-sparkles" />
            <InputText
              id="value"
              name="value"
              placeholder="Describe an image…"
              style={{ width: "100%" }}
              value={formik.values.value}
              onChange={(e) => {
                setPrompt(e.target.value);
                formik.setFieldValue("value", e.target.value);
              }}
              className={classNames({ "p-invalid": isFormFieldInvalid("value") })}
            />
          </span>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-fg-mute font-mono mr-1">
                Try
              </span>
              {SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => {
                    setPrompt(s);
                    formik.setFieldValue("value", s);
                  }}
                  className="px-2.5 py-1 rounded-md text-xs border border-line bg-bg-1 text-fg-dim hover:text-fg hover:bg-bg-2 transition truncate max-w-[260px]"
                  title={s}
                >
                  {s}
                </button>
              ))}
            </div>
            <Button
              type="submit"
              label="Generate"
              loading={isLoading}
              disabled={!formik.values.value}
              icon="pi pi-arrow-right"
              iconPos="right"
            />
          </div>
          {isFormFieldInvalid("value") && (
            <p className="mt-2 text-xs text-red-400">{formik.errors.value}</p>
          )}
        </form>
      </div>

      {/* Gallery */}
      <div className="surface mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-bg-1 px-4 py-2.5">
          <span className="text-[11px] uppercase tracking-wider text-fg-mute font-mono">
            Gallery
          </span>
          <span className="text-[11px] text-fg-mute font-mono">
            {imagesResults?.length || 0} results
          </span>
        </div>
        <div className="relative h-[64vh] overflow-y-auto">
          {isLoading && (
            <ProgressBar
              mode="indeterminate"
              style={{ height: 2, position: "absolute", top: 0, width: "100%" }}
            />
          )}

          {imagesResults.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="grid h-12 w-12 place-items-center rounded-md border border-line bg-bg-1 mb-4">
                <i className="pi pi-image text-fg-mute" style={{ fontSize: 16 }} />
              </div>
              <p className="text-sm text-fg">No images yet</p>
              <p className="mt-1 text-xs text-fg-mute max-w-sm">
                Write a prompt above and press Generate. Results will appear in
                this grid.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md border border-line bg-gradient-to-br from-bg-2 to-bg-1 animate-pulse"
                />
              ))}
            </div>
          )}

          {imagesResults.length > 0 && !isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4">
              {imagesResults.map((item, id) => (
                <div
                  key={id}
                  className="rounded-md overflow-hidden border border-line bg-bg-1 hover:border-line-strong transition"
                >
                  <Image src={item} alt="generated" preview loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGen;
