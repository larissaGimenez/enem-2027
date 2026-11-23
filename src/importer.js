const { pool } = require('./db');

/**
 * Upserts one ENEM exam and all its questions/alternatives inside a transaction.
 * @param {object} params
 * @param {number} params.year Exam year (e.g. 2023)
 * @param {string} params.title Exam title (e.g. "ENEM 2023")
 * @param {string} params.source Source identifier
 * @param {Array<object>} params.questions Normalized question objects
 * @returns {Promise<{examId: number, importedCount: number}>}
 */
async function saveExamWithQuestions({ year, title, source, questions }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO exams (year, title, source, total_questions, imported_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         source = VALUES(source),
         total_questions = VALUES(total_questions),
         imported_at = NOW()`,
      [year, title, source, questions.length]
    );

    const [[examRow]] = await conn.execute('SELECT id FROM exams WHERE year = ?', [year]);
    const examId = examRow.id;

    for (const q of questions) {
      const language = q.language ? String(q.language).trim() : '';
      const discipline = q.discipline ? String(q.discipline).trim() : '';
      const filesJson = JSON.stringify(Array.isArray(q.files) ? q.files : []);

      await conn.execute(
        `INSERT INTO questions (
           exam_id, year, question_index, title, discipline, language,
           context, alternatives_intro, correct_alternative, files_json
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           discipline = VALUES(discipline),
           context = VALUES(context),
           alternatives_intro = VALUES(alternatives_intro),
           correct_alternative = VALUES(correct_alternative),
           files_json = VALUES(files_json)`,
        [
          examId,
          year,
          Number(q.index),
          q.title || `Questão ${q.index} - ENEM ${year}`,
          discipline,
          language,
          q.context ?? null,
          q.alternativesIntroduction ?? null,
          q.correctAlternative ? String(q.correctAlternative).charAt(0).toUpperCase() : null,
          filesJson,
        ]
      );

      const [[questionRow]] = await conn.execute(
        `SELECT id FROM questions
         WHERE exam_id = ? AND question_index = ? AND language = ?`,
        [examId, Number(q.index), language]
      );
      const questionId = questionRow.id;

      const alternatives = Array.isArray(q.alternatives) ? q.alternatives : [];
      for (const alt of alternatives) {
        const letter = String(alt.letter || '').trim().charAt(0).toUpperCase();
        if (!letter) continue;

        await conn.execute(
          `INSERT INTO alternatives (question_id, letter, text, file_url, is_correct)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             text = VALUES(text),
             file_url = VALUES(file_url),
             is_correct = VALUES(is_correct)`,
          [
            questionId,
            letter,
            alt.text ?? null,
            alt.file ?? null,
            alt.isCorrect ? 1 : 0,
          ]
        );
      }
    }

    await conn.commit();
    return { examId, importedCount: questions.length };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { saveExamWithQuestions };
