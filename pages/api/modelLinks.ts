import { NextApiRequest, NextApiResponse } from "next";
import crawler from "crawler";
export default async function handler(
  req: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const modelLinks = [];
    const crawlerI = new crawler({
      maxConnection: 10,
      callback: (error, res, done) => {
        if (error) {
          throw error;
        } else {
          const val = res.$;
          const selectedVal = val("h4");
          for (let key in selectedVal) {
            const children = selectedVal[key].children;
            let link = "";
            if (children && children.length > 0) {
              if (children[0]) {
                link = children[0].data;
                modelLinks.push(link);
              }
            }
          }

          modelLinks.pop();
          done();
          return response.status(200).json({
            modelLinks: modelLinks,
          });
        }
      },
    });
    crawlerI.queue(
      "https://huggingface.co/models?pipeline_tag=text-to-image&sort=likes"
    );
  } catch (error) {
    return response
      .status(500)
      .json({ message: error.message, type: "Internal server error" });
  }
}
