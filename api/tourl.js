import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import { fileTypeFromFile } from "file-type";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw err;
      const file = files.fileToUpload;
      if (!file) throw new Error("No file uploaded");

      const buffer = fs.readFileSync(file.filepath);
      const { ext, mime } = (await fileTypeFromFile(file.filepath)) || {
        ext: "bin",
        mime: "application/octet-stream",
      };

      const formData = new FormData();
      formData.append("reqtype", "fileupload");
      formData.append("fileToUpload", buffer, {
        filename: `file.${ext}`,
        contentType: mime,
      });

      const fetch = (await import("node-fetch")).default;
      const uploadRes = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(`Catbox upload failed: ${text}`);
      }

      const url = await uploadRes.text();
      return res.status(200).json({ url, creator: "ferninesite" });
    } catch (e) {
      return res
        .status(500)
        .json({ error: "Upload failed", details: e.message || String(e) });
    }
  });
}
