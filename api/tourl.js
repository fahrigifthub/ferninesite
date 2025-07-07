import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method Not Allowed' });
  }

  try {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      const { ext, mime } = (await fileTypeFromBuffer(buffer)) || {
        ext: 'bin',
        mime: 'application/octet-stream',
      };

      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', buffer, {
        filename: `file.${ext}`,
        contentType: mime,
      });

      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: form,
      });

      const result = await response.text();
      if (!result.startsWith('https://')) {
        return res.status(500).json({ status: false, message: 'Upload failed', raw: result });
      }

      return res.status(200).json({
        status: true,
        url: result.trim(),
        size: buffer.length,
        filename: `file.${ext}`,
      });
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
}
