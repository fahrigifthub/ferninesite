import { fileTypeFromBuffer } from 'file-type';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { base64 } = req.body;

    if (!base64) {
      return res.status(400).json({ error: 'base64 image required' });
    }

    const buffer = Buffer.from(base64.replace(/^data:.+;base64,/, ''), 'base64');

    const { ext, mime } = (await fileTypeFromBuffer(buffer)) || {
      ext: 'bin',
      mime: 'application/octet-stream',
    };

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', buffer, {
      filename: `file.${ext}`,
      contentType: mime,
    });

    const uploadRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    const result = await uploadRes.text();

    if (!result.startsWith('https://')) {
      return res.status(500).json({ error: 'Upload failed', detail: result });
    }

    return res.status(200).json({ url: result });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
