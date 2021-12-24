import pg from "pg";

const { Pool } = pg;

let localPoolConfig = {
  user: "postgres",
  password: "Db0oo0",
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
