require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { pool } = require('./src/db');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const clientDist = path.join(__dirname, 'client', 'dist');

app.use(express.json({ limit: '5mb' }));
app.use(express.static(fs.existsSync(clientDist) ? clientDist : __dirname));

app.get('/api/health', async (_req, res) => {
  try {
    const [[examStats]] = await pool.query(
      'SELECT COUNT(*) AS totalExams FROM exams'
    );
    const [[questionStats]] = await pool.query(
      'SELECT COUNT(*) AS totalQuestions FROM questions'
    );
    res.json({
      ok: true,
      database: process.env.DB_NAME || 'enem_2027',
      totalExams: Number(examStats.totalExams),
      totalQuestions: Number(questionStats.totalQuestions),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/exams', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, year, title, source, total_questions, imported_at
       FROM exams
       ORDER BY year DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/questions', async (req, res) => {
  try {
    const { year, discipline, language, q } = req.query;
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);

    const where = [];
    const params = [];

    if (year) {
      where.push('year = ?');
      params.push(Number(year));
    }
    if (discipline) {
      where.push('discipline = ?');
      params.push(String(discipline));
    }
    if (language) {
      where.push('language = ?');
      params.push(String(language));
    }
    if (q) {
      where.push('(context LIKE ? OR alternatives_intro LIKE ? OR title LIKE ?)');
      const term = `%${String(q).trim()}%`;
      params.push(term, term, term);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT id, year, question_index, title, discipline, language,
              LEFT(COALESCE(context, alternatives_intro, ''), 240) AS preview,
              correct_alternative
       FROM questions
       ${whereClause}
       ORDER BY year DESC, question_index ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM questions ${whereClause}`,
      params
    );

    res.json({ total: Number(countRow.total), limit, offset, questions: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/questions/random', async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 30);
    const { discipline } = req.query;
    const where = discipline ? 'WHERE discipline = ?' : '';
    const params = discipline ? [String(discipline), limit] : [limit];

    const [rows] = await pool.query(
      `SELECT id, year, question_index, title, discipline, language,
              LEFT(COALESCE(context, alternatives_intro, ''), 240) AS preview,
              correct_alternative
       FROM questions
       ${where}
       ORDER BY RAND()
       LIMIT ?`,
      params
    );

    res.json({ total: rows.length, questions: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/questions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [[question]] = await pool.query('SELECT * FROM questions WHERE id = ?', [id]);
    if (!question) {
      return res.status(404).json({ error: 'Questão não encontrada.' });
    }

    const [alternatives] = await pool.query(
      'SELECT letter, text, file_url, is_correct FROM alternatives WHERE question_id = ? ORDER BY letter ASC',
      [id]
    );

    res.json({ ...question, alternatives });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/study-state/:key', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT payload, updated_at FROM study_state WHERE state_key = ?',
      [req.params.key]
    );
    if (!row) {
      return res.json({ exists: false, payload: null });
    }
    res.json({ exists: true, payload: row.payload, updatedAt: row.updated_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/study-state/:key', async (req, res) => {
  try {
    const payload = JSON.stringify(req.body ?? {});
    await pool.execute(
      `INSERT INTO study_state (state_key, payload)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE payload = VALUES(payload)`,
      [req.params.key, payload]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Guia ENEM 2027 rodando em http://localhost:${PORT}`);
});
