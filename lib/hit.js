import fs from 'fs/promises';
const filePath = './hits.json';

export async function incrementHit() {
  try {
    let data = await fs.readFile(filePath, 'utf8');
    let parsed = JSON.parse(data);
    parsed.total += 1;
    await fs.writeFile(filePath, JSON.stringify(parsed));
    return parsed.total;
  } catch {
    const init = { total: 1 };
    await fs.writeFile(filePath, JSON.stringify(init));
    return init.total;
  }
}

export async function getHits() {
  try {
    let data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data).total;
  } catch {
    return 0;
  }
}
