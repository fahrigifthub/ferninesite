// File: api/tourl.js (Final Fix)
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { fileTypeFromFile } from 'file-type';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Gunakan metode POST.' });
  }

  const form = new IncomingForm();
  form.uploadDir = '/tmp';
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw new Error('Gagal parsing form.');

      const file = files.file;
      if (!file) throw new Error('File tidak ditemukan dalam request.');

      const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;
      const buffer = fs.readFileSync(filePath);

      const url = await catboxUpload(buffer);

      res.status(200).json({ status: true, url });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  });
}

async function catboxUpload(buffer) {
  const fileType = await fileTypeFromFile(buffer);
  const ext = fileType?.ext || 'bin';

  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', buffer, `file.${ext}`);

  const response = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Gagal upload ke Catbox.');
  return await response.text();
}
