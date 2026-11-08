import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('Thiếu biến môi trường DATABASE_URL. Xem file .env.example.');
  process.exit(1);
}

/**
 * Dùng DATABASE_URL nên chạy được với Postgres cục bộ lẫn các dịch vụ
 * Postgres có sẵn trên mây — không phải sửa mã khi đổi nơi triển khai.
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
});

export function truyVan(sql, thamSo = []) {
  return pool.query(sql, thamSo);
}

/** Chạy nhiều câu lệnh trong một giao dịch */
export async function giaoDich(ham) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const kq = await ham(client);
    await client.query('COMMIT');
    return kq;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function kiemTraKetNoi() {
  const { rows } = await truyVan('SELECT now() AS bay_gio');
  return rows[0].bay_gio;
}
