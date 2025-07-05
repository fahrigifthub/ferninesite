export default async function handler(req, res) {
  const { query } = req;
  const name = query.name;

  if (!name) {
    return res.status(400).json({ status: false, message: "Query parameter 'name' is required." });
  }

  try {
    const fetchRes = await fetch(
      `https://api.fasturl.link/downup/ytdown-v1?name=${encodeURIComponent(name)}&format=mp3&quality=320&server=auto`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );

    const data = await fetchRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Internal server error." });
  }
}  
