export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ status: false, message: 'Missing url parameter' });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch audio');

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Disposition', 'inline; filename="audio.mp3"');

    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({ status: false, message: 'Gagal memuat audio', error: err.message });
  }
}
