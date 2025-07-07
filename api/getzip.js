// /pages/tool/getzip.js (Next.js API)
import axios from "axios";

export default async function handler(req, res) {
  const url = req.query.query;
  if (!url || !url.startsWith("http")) {
    return res.status(400).send("Invalid URL");
  }

  try {
    const fastApi = "https://api.fasturl.link/tool/getcode";
    const response = await axios.get(fastApi, {
      params: {
        url,
        renameAssets: "false",
        saveStructure: "false",
        simpleDownload: "false",
        mobileVersion: "false"
      },
      responseType: "arraybuffer",
      headers: {
        accept: "application/zip"
      }
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=source-${new URL(url).hostname}.zip`);
    res.send(response.data);
  } catch (err) {
    res.status(500).send("Failed to fetch source: " + err.message);
  }
}
