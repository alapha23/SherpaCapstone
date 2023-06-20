import mysql, { FieldPacket, Pool, RowDataPacket } from 'mysql2/promise';

interface DBConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

const config: DBConfig = {
  host: 'localhost',
  user: 'zgao',
  password: 'admin',
  database: 'CEL',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool: Pool = mysql.createPool(config);

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows]: [RowDataPacket[], FieldPacket[]] = await pool.execute(sql, params || []);
  return rows as unknown as T;
}