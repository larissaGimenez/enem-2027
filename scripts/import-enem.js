const { pool } = require('../src/db');
const { saveExamWithQuestions } = require('../src/importer');

const BASE_URL = 'https://api.enem.dev/v1';
const PAGE_LIMIT = 50;

/**
 * Fetches JSON with retry/backoff for transient HTTP or rate-limit responses.
 * @param {string} url
 * @param {number} retries
 */
async function fetchJson(url, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    }

    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const waitMs = 800 * attempt;
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    throw new Error(`HTTP ${res.status} ao acessar ${url}`);
  }
}

/**
 * Downloads all questions for a single ENEM edition via pagination.
 * @param {number} year
 */
async function fetchAllQuestionsForYear(year) {
  const all = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${BASE_URL}/exams/${year}/questions?limit=${PAGE_LIMIT}&offset=${offset}`;
    const data = await fetchJson(url);
    const batch = Array.isArray(data.questions) ? data.questions : [];
    all.push(...batch);

    hasMore = Boolean(data.metadata && data.metadata.hasMore);
    offset += PAGE_LIMIT;

    if (hasMore) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return all;
}

/**
 * Imports the latest 10 ENEM editions (or all if --all is passed) into MySQL.
 */
async function main() {
  const importAll = process.argv.includes('--all');
  const exams = await fetchJson(`${BASE_URL}/exams`);
  const sorted = [...exams].sort((a, b) => b.year - a.year);
  const targets = importAll ? sorted : sorted.slice(0, 10);

  console.log(
    `Iniciando importação de ${targets.length} edições (${targets.map((e) => e.year).join(', ')})...`
  );

  let totalQuestions = 0;
  for (const exam of targets) {
    const questions = await fetchAllQuestionsForYear(exam.year);
    const { importedCount } = await saveExamWithQuestions({
      year: exam.year,
      title: exam.title || `ENEM ${exam.year}`,
      source: 'api.enem.dev',
      questions,
    });
    totalQuestions += importedCount;
    console.log(`- ENEM ${exam.year}: ${importedCount} questões salvas no MySQL.`);
  }

  console.log(`Importação concluída: ${targets.length} provas, ${totalQuestions} questões no total.`);
  await pool.end();
}

main().catch(async (err) => {
  console.error('Erro na importação ENEM:', err.message);
  await pool.end();
  process.exit(1);
});
