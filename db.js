import pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg;

dotenv.config();

const dbPassword = process.env.DATABASE_PASSWORD || 'postgres'

let localPoolConfig = {
  user: "postgres",
  password: dbPassword,
  host: "localhost",
  port: "5432",
  database: "carnadb",
};

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : localPoolConfig;

const pool = new Pool(poolConfig);

export default pool;
