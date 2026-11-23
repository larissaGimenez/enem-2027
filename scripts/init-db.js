const fs = require('fs');
const path = require('path');
const { createPool } = require('../src/db');

/**
 * Executes database/schema.sql against the local MySQL instance.
 */
async function initDatabase() {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const pool = createPool(false, true);

  try {
    await pool.query(sql);
    console.log('Banco de dados e tabelas criados/verificados com sucesso (enem_2027).');
  } finally {
    await pool.end();
  }
}

initDatabase().catch((err) => {
  console.error('Erro ao inicializar banco de dados:', err.message);
  process.exit(1);
});
