CREATE DATABASE IF NOT EXISTS enem_2027
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE enem_2027;

CREATE TABLE IF NOT EXISTS exams (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  year SMALLINT UNSIGNED NOT NULL,
  title VARCHAR(120) NOT NULL,
  source VARCHAR(64) NOT NULL DEFAULT 'api.enem.dev',
  total_questions INT UNSIGNED NOT NULL DEFAULT 0,
  imported_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_exams_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  exam_id INT UNSIGNED NOT NULL,
  year SMALLINT UNSIGNED NOT NULL,
  question_index SMALLINT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  discipline VARCHAR(64) NOT NULL DEFAULT '',
  language VARCHAR(32) NOT NULL DEFAULT '',
  context MEDIUMTEXT NULL,
  alternatives_intro MEDIUMTEXT NULL,
  correct_alternative CHAR(1) NULL,
  files_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_exam_question (exam_id, question_index, language),
  KEY idx_questions_year_discipline (year, discipline),
  KEY idx_questions_discipline (discipline),
  FULLTEXT KEY ft_questions_text (context, alternatives_intro),
  CONSTRAINT fk_questions_exam
    FOREIGN KEY (exam_id) REFERENCES exams (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alternatives (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  question_id BIGINT UNSIGNED NOT NULL,
  letter CHAR(1) NOT NULL,
  text TEXT NULL,
  file_url VARCHAR(512) NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_question_letter (question_id, letter),
  CONSTRAINT fk_alternatives_question
    FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS study_state (
  state_key VARCHAR(64) NOT NULL,
  payload JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (state_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS essays (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  theme VARCHAR(255) NOT NULL,
  essay_date DATE NOT NULL,
  score SMALLINT UNSIGNED NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_essays_date (essay_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS error_notebook (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  question_id BIGINT UNSIGNED NULL,
  area VARCHAR(64) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  error_reason TEXT NOT NULL,
  review_status ENUM('pendente', 'revisado') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_error_area (area),
  CONSTRAINT fk_error_question
    FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
