
export default async function handler(req, res) {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({
      status: false,
      message: "Query parameter 'query' is required.",
      creator: "ferninesite"
    });
  }

  try {
    const apiUrl = `https://api.fasturl.link/downup/ytdown-v1?name=${encodeURIComponent(query)}&format=mp3&quality=320&server=auto`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // ubah creator-nya
    data.creator = "ferninesite";

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Gagal mengambil data.",
      error: err.message,
      creator: "ferninesite"
    });
  }
}
