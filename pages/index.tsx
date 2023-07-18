"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { HfInference } from "@huggingface/inference";
import classnames from "classnames";
// import { useInterval } from "../utils/use-interval";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [modelLinks, setModelLinks] = useState<Array<string>>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const hf = new HfInference(process.env.HG_TOKEN);

  useEffect(() => {
    fetch("/api/modelLinks")
      .then(async (val) => {
        const valJson = await val.json();
        const { modelLinks: links } = valJson;
        setModelLinks(links);
      })
      .catch((e) => {
        toast.error(`Loading error ${e}`);
      });
  }, []);

  const blobToBase64 = (blob) => {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setLoading(true);
      toast("Generating your image...", { position: "top-center" });
      if (!selectedModel) throw "Please select model to generate";
      const output = await hf.textToImage({
        inputs: prompt as string,
        model: selectedModel,
        parameters: {
          negative_prompt: "blurry",
        },
      });
      const base64Img = await blobToBase64(output);
      setImage(base64Img);
    } catch (e) {
      toast.error(`Generate image have an error: ${e}`, {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }

    // setMessageId(json.id);
  }

  const showLoadingState = loading;

  return (
    <>
      <div className="antialiased mx-auto px-4 py-10 h-screen bg-gray-100">
        <Toaster />
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-5xl tracking-tighter pb-10 font-bold text-gray-800">
            Image generator
          </h1>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="shadow-sm text-gray-700 rounded-sm px-3 py-2 mb-4 sm:mb-0 sm:min-w-[600px]"
          >
            {modelLinks.map((link, index) => (
              <option key={index} value={link}>
                {link}
              </option>
            ))}
          </select>
          <form
            className="flex justify-center items-center w-full sm:w-auto flex-col  mb-10 mt-5"
            onSubmit={submitForm}
          >
            <textarea
              className="shadow-sm text-gray-700 rounded-sm px-3 py-2 mb-4 sm:mb-0 sm:min-w-[600px]"
              rows={4}
              placeholder="Prompt for DALL-E"
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="min-h-[40px] shadow-sm sm:w-[200px] py-2 inline-flex justify-center font-medium items-center px-4 bg-green-600 text-gray-100 sm:ml-2 rounded-md hover:bg-green-700 mt-5"
              type="submit"
            >
              {showLoadingState && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {!showLoadingState ? "Generate" : ""}
            </button>
          </form>
          {(image || loading) && (
            <div className="relative flex w-full items-center justify-center">
              <div className="w-full sm:w-[400px] h-[400px] rounded-md shadow-md relative flex items-center justify-center">
                {image ? (
                  <img
                    alt={`Dall-E representation of: ${prompt}`}
                    className={classnames(
                      "rounded-md shadow-md h-full object-cover",
                      {
                        "opacity-100": !!image,
                      }
                    )}
                    src={image}
                  />
                ) : (
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                )}
              </div>

              <div
                className={classnames(
                  "w-full sm:w-[400px] absolute top-0.5 overflow-hidden rounded-2xl bg-white/5 shadow-xl shadow-black/5",
                  {
                    "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-gray-500/10 before:to-transparent":
                      showLoadingState,
                    "opacity-0 shadow-none": !!image,
                  }
                )}
              ></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
