import 'dotenv/config';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

const thuMuc = join(dirname(fileURLToPath(import.meta.url)), '..', 'sql');

const files = readdirSync(thuMuc).filter((f) => f.endsWith('.sql')).sort();

for (const f of files) {
  const sql = readFileSync(join(thuMuc, f), 'utf8');
  process.stdout.write(`Đang chạy ${f} ... `);
  await pool.query(sql);
  console.log('xong');
}

console.log(`\nĐã tạo xong lược đồ (${files.length} tệp).`);
await pool.end();
