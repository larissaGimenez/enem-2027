require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Creates a MySQL connection pool configured from environment variables.
 * @param {boolean} withDatabase Whether to bind directly to DB_NAME.
 * @param {boolean} multipleStatements Whether to allow multi-statement SQL execution.
 * @returns {mysql.Pool}
 */
function createPool(withDatabase = true, multipleStatements = false) {
  return mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: withDatabase ? (process.env.DB_NAME || 'enem_2027') : undefined,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements,
  });
}

const pool = createPool(true, false);

module.exports = { pool, createPool };
