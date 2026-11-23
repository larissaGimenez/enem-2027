const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');
const { saveExamWithQuestions } = require('../src/importer');

/**
 * Imports one local JSON exam file (e.g. ENEM 2024/2025) into MySQL.
 * Usage: node scripts/import-local.js [caminho/para/arquivo.json]
 */
async function main() {
  const argPath = process.argv[2];
  const defaultDir = path.join(__dirname, '..', 'data', 'local-imports');

  const files = argPath
    ? [path.resolve(argPath)]
    : fs
        .readdirSync(defaultDir)
        .filter((f) => f.endsWith('.json') && !f.startsWith('exemplo-'))
        .map((f) => path.join(defaultDir, f));

  if (files.length === 0) {
    console.log(
      'Nenhum arquivo JSON encontrado em data/local-imports/ (use exemplo-enem-local.json como modelo).'
    );
    await pool.end();
    return;
  }

  for (const filePath of files) {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!raw.year || !Array.isArray(raw.questions)) {
      throw new Error(`Formato inválido em ${filePath}. Esperado: { year, title, questions: [] }`);
    }

    const { importedCount } = await saveExamWithQuestions({
      year: Number(raw.year),
      title: raw.title || `ENEM ${raw.year}`,
      source: raw.source || 'local-json',
      questions: raw.questions,
    });

    console.log(`Arquivo ${path.basename(filePath)}: ${importedCount} questões importadas (ENEM ${raw.year}).`);
  }

  await pool.end();
}

main().catch(async (err) => {
  console.error('Erro na importação local:', err.message);
  await pool.end();
  process.exit(1);
});
