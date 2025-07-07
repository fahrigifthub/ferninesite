import { IncomingForm } from 'formidable';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const form = new IncomingForm();
  form.uploadDir = '/tmp';
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Parsing error' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ status: false, message: 'No file uploaded' });
    }

    const buffer = fs.readFileSync(file[0].filepath);

    try {
      const url = await catboxUpload(buffer);
      return res.status(200).json({
        status: true,
        url,
        filename: file[0].originalFilename,
        size: file[0].size
      });
    } catch (e) {
      return res.status(500).json({ status: false, message: e.message });
    }
  });
}

async function catboxUpload(buffer) {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || {
    ext: "bin",
    mime: "application/octet-stream",
  };
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", new Blob([buffer]), `file.${ext}`);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData
  });

  if (!response.ok) throw new Error("Gagal menghubungi Catbox.");
  return await response.text();
}
