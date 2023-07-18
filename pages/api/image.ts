import { HfInference } from "@huggingface/inference";
import { NextApiRequest, NextApiResponse } from "next";

const hf = new HfInference(process.env.HG_TOKEN);
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt } = req.query;
  try {
    const output = await hf.textToImage({
      inputs: prompt as string,
      model: "stabilityai/stable-diffusion-2",
      parameters: {
        negative_prompt: "blurry",
      },
    });

    return res.status(200).send(output);
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, type: "Internal server error" });
  }
}
