import { IncomingForm } from 'formidable';
import { readFile } from 'fs/promises';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import fetch from 'node-fetch';
import { incrementHit, getTotalHit } from '@/utils/hitCounter'; // atau relative jika error
incrementHit(); // Hit bertambah setiap request berhasil masuk
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024 });

    const files = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });

    const file = files.fileToUpload;
    if (!file || !file[0] || !file[0].filepath) {
      throw new Error("No valid file uploaded.");
    }

    const buffer = await readFile(file[0].filepath);
    const { ext, mime } = (await fileTypeFromBuffer(buffer)) || {
      ext: 'bin',
      mime: 'application/octet-stream',
    };

    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", buffer, {
      filename: `file.${ext}`,
      contentType: mime,
    });

    const uploadRes = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error("Catbox Upload Failed: " + errText);
    }

    const url = await uploadRes.text();

    return res.status(200).json({
      status: true,
      result: {
        url,
        type: mime,
        size: buffer.length,
        ext
      },
      creator: "ferninesite",
    });

  } catch (e) {
    return res.status(500).json({
      status: false,
      error: "Upload failed",
      details: e.message || String(e),
      creator: "ferninesite"
    });
  }
}
