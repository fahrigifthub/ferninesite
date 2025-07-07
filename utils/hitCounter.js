import fs from 'fs';
import path from 'path';

const filePath = path.resolve('hit.json');

export function incrementHit() {
  let data = { total: 0 };

  if (fs.existsSync(filePath)) {
    try {
      const file = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(file);
    } catch {
      data = { total: 0 };
    }
  }

  data.total += 1;
  fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
}

export function getTotalHit() {
  if (!fs.existsSync(filePath)) return 0;
  try {
    const file = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(file);
    return data.total || 0;
  } catch {
    return 0;
  }
}
