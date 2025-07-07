import { IncomingForm } from 'formidable';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // ini penting!
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed', details: err.message });

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'Upload failed', details: 'No valid file uploaded.' });
    }

    const buffer = fs.readFileSync(file.filepath);
    const { ext, mime } = (await fileTypeFromBuffer(buffer)) || {
      ext: 'bin',
      mime: 'application/octet-stream',
    };

    const FormData = (await import('form-data')).default;
    const fetch = (await import('node-fetch')).default;

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', buffer, {
      filename: `file.${ext}`,
      contentType: mime,
    });

    try {
      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      const text = await response.text();
      if (!text.startsWith('https://')) {
        return res.status(500).json({ error: 'Upload failed', details: text });
      }

      return res.json({
        url: text,
        creator: 'ferninesite',
      });
    } catch (err) {
      return res.status(500).json({ error: 'Upload failed', details: err.message });
    }
  });
}
