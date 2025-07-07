import { getTotalHit } from '@/utils/hitCounter';

export default function handler(req, res) {
  const total = getTotalHit();
  res.status(200).json({ total });
}
