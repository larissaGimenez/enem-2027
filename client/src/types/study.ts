export type TabId =
  | "dashboard"
  | "session"
  | "schedule"
  | "math-curriculum"
  | "topics"
  | "essays"
  | "errors"
  | "questions"
  | "performance"
  | "simulados"
  | "cards";

export type TopicStatus = "todo" | "doing" | "done";

export type StudyLevel = "R1" | "R2" | "R3";

export type ConfidenceLevel = "certeza" | "duvida" | "nao-sei";

export interface CycleInfo {
  id: string;
  name: string;
  period: string;
  goal: string;
}

export interface TopicItem {
  id: string;
  cycle: string;
  area: string;
  title: string;
  sub: string;
}

export interface ScheduleDay {
  id: string;
  day: string;
  subject: string;
  task: string;
  minutes: number;
  done: boolean;
  courseId?: string;
}

export interface EssayEntry {
  id: string;
  theme: string;
  stage: string;
  date: string;
  notes: string;
  examModel?: "enem" | "unicamp";
  genre?: string;
  text?: string;
  c1?: number;
  c2?: number;
  c3?: number;
  c4?: number;
  c5?: number;
  totalScore?: number;
}

export type ErrorReason =
  | "Não sabia o conteúdo"
  | "Interpretei errado"
  | "Errei a conta"
  | "Falta de atenção"
  | "Faltou tempo"
  | "Chutei";

export interface ErrorEntry {
  id: string;
  area: string;
  topic: string;
  type: string;
  lesson: string;
  date: string;
  questionId?: number;
  exerciseId?: string;
  year?: number;
  status?: "pending" | "mastered";
  lastResult?: "none" | "correct" | "wrong";
}

export interface QuestionAttempt {
  questionId: number;
  selected: string;
  isCorrect: boolean;
  discipline: string;
  year: number;
  confidence?: ConfidenceLevel;
  answeredAt: string;
}

export interface QuestionListEntry {
  id: string;
  title: string;
  createdAt: string;
  questionIds: number[];
  answers: Record<number, string>;
  submitted: boolean;
  score?: number;
}

export type SubjectArea =
  | "Matemática"
  | "Biologia"
  | "Física"
  | "Química"
  | "Linguagens"
  | "Humanas"
  | "Redação";

export interface WeeklyPlanItem {
  id: string;
  week: number;
  subjectLabel: string;
  area: SubjectArea;
  title: string;
  importance: "Alta" | "Média" | "Base";
  courseId?: string;
  aulaDone: boolean;
  rev1Done: boolean;
  rev2Done: boolean;
  questionsDone: number;
  questionsCorrect: number;
}

export interface LessonVideo {
  id: string;
  title: string;
  url: string;
  youtubeId: string;
  addedAt: string;
}

export interface CardReviewState {
  cardId: string;
  intervalDays: number;
  nextReviewDate: string;
  lastResult: "again" | "hard" | "good" | "easy";
  reviewCount: number;
}

export interface SimuladoAttempt {
  id: string;
  title: string;
  dayType: "dia1" | "dia2" | "matematica";
  date: string;
  totalQuestions: number;
  correctCount: number;
  elapsedMinutes: number;
}

export interface RoutineConfig {
  dreamCourse: string;
  university: string;
  pace: "leve" | "equilibrado" | "intenso";
  weeklyHoursByDay: Record<string, number>;
}

export interface StudyState {
  currentCycle: string;
  studyLevel: StudyLevel;
  totalMinutes: number;
  pomodoroSessions: number;
  weeklyTargets: string[];
  weeklyPlan: WeeklyPlanItem[];
  topicStatus: Record<string, TopicStatus>;
  lessonVideos: Record<string, LessonVideo[]>;
  lessonNotes: Record<string, string>;
  questionAttempts: Record<number, QuestionAttempt>;
  questionLists: QuestionListEntry[];
  cardReviews: Record<string, CardReviewState>;
  simuladoHistory: SimuladoAttempt[];
  routineConfig: RoutineConfig;
  schedule: ScheduleDay[];
  essays: EssayEntry[];
  errors: ErrorEntry[];
}

export interface ExamSummary {
  id: number;
  year: number;
  title: string;
  source: string;
  total_questions: number;
}

export interface QuestionSummary {
  id: number;
  year: number;
  question_index: number;
  title: string;
  discipline: string;
  language: string;
  preview: string;
  correct_alternative: string | null;
}

export interface QuestionAlternative {
  letter: string;
  text: string | null;
  file_url: string | null;
  is_correct: number | boolean;
}

export interface QuestionDetail extends QuestionSummary {
  context: string | null;
  alternatives_intro: string | null;
  alternatives: QuestionAlternative[];
}
