// /api/tourl.js (FINAL FIX)
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { name, buffer64 } = req.body;
  if (!name || !buffer64) {
    return res.status(400).json({ error: 'Missing name or buffer64 (base64 data)' });
  }

  try {
    const base64Data = buffer64.replace(/^data:.*?base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const { ext, mime } = (await fileTypeFromBuffer(buffer)) || {
      ext: 'bin',
      mime: 'application/octet-stream',
    };

    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, {
      filename: name || `file.${ext}`,
      contentType: mime,
    });

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: 'Upload failed', details: text });
    }

    const url = await response.text();

    if (!url.startsWith('https://')) {
      return res.status(500).json({ error: 'Upload failed', response: url });
    }

    return res.status(200).json({
      url,
      creator: 'ferninesite',
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Exception occurred',
      message: err.message || err,
    });
  }
}
