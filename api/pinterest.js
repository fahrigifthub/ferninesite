import { incrementHit, getTotalHit } from '@/utils/hitCounter';
incrementHit(); // Hit bertambah setiap request berhasil masuk// atau relative jika error
export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      status: false,
      message: "Query parameter 'query' is required.",
    });
  }

  try {
    const response = await fetch(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    return res.status(200).json({
      status: true,
      total: data.data?.length || 0,
      result: data.data,
    });
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: e.message,
    });
  }
}
