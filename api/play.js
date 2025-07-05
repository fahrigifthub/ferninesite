import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ status: false, message: "Query parameter 'query' is required." });
  }

  try {
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const ytRes = await axios.get(ytSearchUrl);
    const videoId = ytRes.data.match(/"videoId":"(.*?)"/)?.[1];
    if (!videoId) {
      return res.status(404).json({ status: false, message: "Video tidak ditemukan." });
    }

    const videoLink = `https://youtube.com/watch?v=${videoId}`;

    const y2kidRes = await axios.post('https://y2kid.yogik.id/yt', `url=${encodeURIComponent(videoLink)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const $ = cheerio.load(y2kidRes.data);
    const title = $('h3').first().text().trim();
    const thumb = $('img').attr('src');
    const downloadLink = $('a[href$=".mp3"]').attr('href');

    if (!downloadLink) {
      return res.status(500).json({ status: false, message: "Gagal mendapatkan link MP3." });
    }

    const result = {
      msg: "Download link retrieved successfully!",
      title,
      metadata: {
        id: videoId,
        duration: "unknown",
        thumbnail: thumb,
        views: "unknown",
        description: "-",
        lengthSeconds: "-",
        uploadDate: "-"
      },
      author: {
        name: "-",
        url: "-",
        bio: "No bio available",
        image: "-",
        subCount: 0
      },
      url: videoLink,
      format: "mp3",
      quality: "320",
      media: downloadLink
    };

    return res.status(200).json({ status: 200, content: "Success", result, creator: "ferninesite" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Terjadi kesalahan server." });
  }
}
