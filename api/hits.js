import { getHits, incrementHit } from '@/lib/hit';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const total = await incrementHit();
    return res.status(200).json({ total });
  } else {
    const total = await getHits();
    return res.status(200).json({ total });
  }
}
