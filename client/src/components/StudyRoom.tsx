import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  Lightbulb,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Video,
} from "lucide-react";
import { Button } from "@/components/motion/button";
import { Card, CardContent } from "@/components/motion/card";
import { DigitSwap } from "@/components/motion/digit-swap";
import {
  formatClock,
  POMODORO_PRESETS,
  type PomodoroMode,
} from "@/components/PomodoroSessionCard";
import { QuestionBankTab } from "@/components/QuestionBankTab";
import { CYCLES } from "@/data/enemData";
import {
  findFoundationCourse,
  FOUNDATION_COURSES,
  getFoundationCoursesBySubject,
} from "@/data/foundationCourses";
import { getCourseTier, MATH_CURRICULUM } from "@/data/mathCurriculum";
import { getLessonExercises } from "@/data/mathExercises";
import { getLessonTheory } from "@/data/mathLessonContent";
import type { ExamSummary, LessonVideo, TopicStatus } from "@/types/study";

type RoomTab = "theory" | "notes" | "practice" | "cards";

interface StudyRoomProps {
  courseId: string;
  topicStatus: Record<string, TopicStatus>;
  lessonVideos: Record<string, LessonVideo[]>;
  lessonNotes: Record<string, string>;
  exams: ExamSummary[];
  mode: PomodoroMode;
  secondsLeft: number;
  isRunning: boolean;
  completedSessions: number;
  onSelectCourse: (courseId: string) => void;
  onChangeStatus: (courseId: string, status: TopicStatus) => void;
  onAddVideo: (courseId: string, video: LessonVideo) => void;
  onRemoveVideo: (courseId: string, videoId: string) => void;
  onChangeNote: (courseId: string, note: string) => void;
  onSelectMode: (mode: PomodoroMode) => void;
  onToggleRun: () => void;
  onReset: () => void;
  onCompletePomodoro: () => void;
  onSendToErrors: (
    area: string,
    topic: string,
    suggestedType?: string,
    exerciseId?: string,
  ) => void;
  onBackToCatalog: () => void;
}

function extractYoutubeId(rawUrl: string): string | null {
  const url = rawUrl.trim();
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}

export function StudyRoom({
  courseId,
  topicStatus,
  lessonVideos,
  lessonNotes,
  exams,
  mode,
  secondsLeft,
  isRunning,
  completedSessions,
  onSelectCourse,
  onChangeStatus,
  onAddVideo,
  onRemoveVideo,
  onChangeNote,
  onSelectMode,
  onToggleRun,
  onReset,
  onCompletePomodoro,
  onSendToErrors,
  onBackToCatalog,
}: StudyRoomProps) {
  const [roomTab, setRoomTab] = useState<RoomTab>("theory");
  const [practiceMode, setPracticeMode] = useState<"fixation" | "enem">("fixation");
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoTitleInput, setVideoTitleInput] = useState("");
  const [videoError, setVideoError] = useState("");

  const foundationMatch = findFoundationCourse(courseId);
  const mathIndex = Math.max(
    0,
    MATH_CURRICULUM.findIndex((c) => c.id === courseId),
  );
  const mathCourse = MATH_CURRICULUM[mathIndex] || MATH_CURRICULUM[0];

  const course = foundationMatch
    ? {
        id: foundationMatch.id,
        code: foundationMatch.code,
        title: foundationMatch.title,
        axis: foundationMatch.axis,
        syllabus: foundationMatch.syllabus,
        estimatedHours: foundationMatch.estimatedHours,
        whatToStudy: foundationMatch.whatToStudy,
        enemTip: foundationMatch.enemTip,
        searchKeyword: foundationMatch.searchKeyword,
        period: "ciclo-1" as const,
        subjectName: foundationMatch.subjectName,
        disciplineApi: foundationMatch.disciplineApi,
        tierLabel: "Módulo 0 • Básico do Básico",
      }
    : {
        ...mathCourse,
        subjectName: "Matemática",
        disciplineApi: "matematica",
        tierLabel:
          getCourseTier(mathCourse.code) === "Core"
            ? "Core (80%)"
            : "Diferencial (20%)",
      };

  const foundationSiblings = foundationMatch
    ? getFoundationCoursesBySubject(foundationMatch.subject)
    : [];
  const nextCourse = foundationMatch
    ? (() => {
        const idx = foundationSiblings.findIndex((c) => c.id === foundationMatch.id);
        return idx >= 0 && idx + 1 < foundationSiblings.length
          ? foundationSiblings[idx + 1]
          : null;
      })()
    : MATH_CURRICULUM[mathIndex + 1] || null;

  const theory = foundationMatch
    ? foundationMatch.theory
    : getLessonTheory(mathCourse);
  const lessonExercises = foundationMatch
    ? foundationMatch.exercises
    : getLessonExercises(mathCourse);
  const status = topicStatus[course.id] || "todo";

  const videos = lessonVideos[course.id] || [];
  const currentVideo = videos[activeVideoIndex] || videos[0] || null;
  const noteValue = lessonNotes[course.id] || "";

  const sameCycleCourses = useMemo(
    () =>
      foundationMatch
        ? foundationSiblings
        : MATH_CURRICULUM.filter((c) => c.period === mathCourse.period),
    [foundationMatch, foundationSiblings, mathCourse.period],
  );
  const cycleInfo = foundationMatch
    ? { name: `${foundationMatch.subjectName} — Módulo 0` }
    : CYCLES.find((c) => c.id === mathCourse.period);

  useEffect(() => {
    setActiveVideoIndex(0);
    setShowAddVideoForm(false);
    setVideoError("");
  }, [course.id]);

  const preset = POMODORO_PRESETS[mode];
  const elapsedMinutes = Math.floor(
    Math.max(0, preset.minutes * 60 - secondsLeft) / 60,
  );

  function handleSaveVideo(e: React.FormEvent) {
    e.preventDefault();
    const ytId = extractYoutubeId(videoUrlInput);
    if (!ytId) {
      setVideoError(
        "Link do YouTube inválido. Cole uma URL como https://www.youtube.com/watch?v=... ou https://youtu.be/...",
      );
      return;
    }

    const nextIdx = videos.length + 1;
    const newVideo: LessonVideo = {
      id: `vid-${Date.now()}`,
      title: videoTitleInput.trim() || `Vídeo ${nextIdx} — ${course.title}`,
      url: videoUrlInput.trim(),
      youtubeId: ytId,
      addedAt: new Date().toISOString(),
    };

    onAddVideo(course.id, newVideo);
    setVideoUrlInput("");
    setVideoTitleInput("");
    setVideoError("");
    setShowAddVideoForm(false);
    setActiveVideoIndex(videos.length);
  }

  return (
    <div className="space-y-5">
      {/* Top Bar: Voltar para Aulas + Seletor + Mini Pomodoro */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={onBackToCatalog}
          >
            <ArrowLeft className="size-4" />
            Todas as aulas
          </Button>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <select
            aria-label="Selecionar aula do curso"
            value={course.id}
            onChange={(e) => {
              onSelectCourse(e.target.value);
              setRoomTab("theory");
            }}
            className="h-9 max-w-[260px] rounded-full border border-border bg-muted/40 px-3 text-xs font-bold text-foreground sm:max-w-sm"
          >
            <optgroup label="Matemática (26 aulas)">
              {MATH_CURRICULUM.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="Módulo 0 — Básico do Básico (Outras Matérias)">
              {FOUNDATION_COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} ({c.subjectName}) — {c.title}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Mini-Pomodoro Compacto */}
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5">
          <Timer
            className={`size-4 ${isRunning ? "text-primary" : "text-muted-foreground"}`}
          />
          <DigitSwap
            value={formatClock(secondsLeft)}
            direction="down"
            className="font-display text-sm font-extrabold tabular-nums text-foreground"
          />
          <select
            aria-label="Modo do Pomodoro"
            value={mode}
            onChange={(e) => onSelectMode(e.target.value as PomodoroMode)}
            className="h-7 rounded-full border border-border bg-white px-2 text-[11px] font-semibold"
          >
            {(Object.keys(POMODORO_PRESETS) as PomodoroMode[]).map((k) => (
              <option key={k} value={k}>
                {POMODORO_PRESETS[k].label}
              </option>
            ))}
          </select>
          <Button size="sm" className="h-7 rounded-full px-3 text-xs" onClick={onToggleRun}>
            {isRunning ? (
              <>
                <Pause className="size-3" />
                Pausar
              </>
            ) : (
              <>
                <Play className="size-3 fill-current" />
                Focar
              </>
            )}
          </Button>
          <button
            type="button"
            onClick={onReset}
            title="Reiniciar timer"
            className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-white hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
          </button>
          {elapsedMinutes >= 1 && preset.isFocus && (
            <Button
              size="sm"
              variant="secondary"
              className="h-7 rounded-full px-2.5 text-[11px]"
              onClick={onCompletePomodoro}
            >
              <Check className="size-3" />
              Salvar {elapsedMinutes}m
            </Button>
          )}
        </div>
      </div>

      {/* Layout 2 Colunas estilo Protocolo ENEM */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Coluna Esquerda: Player YouTube + Abas da Aula */}
        <div className="space-y-5 lg:col-span-8">
          {/* Player de Vídeo + Indexador de Múltiplos Vídeos do YouTube */}
          <Card className="overflow-hidden rounded-2xl border-border bg-white shadow-none">
            {currentVideo ? (
              <div className="space-y-3 p-4">
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
                  <iframe
                    key={currentVideo.youtubeId}
                    src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?rel=0`}
                    title={currentVideo.title}
                    className="size-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Playlist de múltiplos vídeos indexados pela usuária */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {videos.map((v, idx) => (
                      <div
                        key={v.id}
                        className={`inline-flex items-center gap-1 rounded-full border pl-3 pr-1.5 py-1 text-xs font-semibold transition-colors ${
                          idx === activeVideoIndex
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-border bg-muted/40 text-foreground hover:bg-muted"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveVideoIndex(idx)}
                          className="inline-flex items-center gap-1.5"
                        >
                          <Video className="size-3.5 text-rose-500" />
                          <span className="max-w-[180px] truncate">{v.title}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveVideo(course.id, v.id);
                            setActiveVideoIndex(0);
                          }}
                          title="Remover vídeo"
                          className={`ml-1 rounded-full p-0.5 transition-colors ${
                            idx === activeVideoIndex
                              ? "text-slate-300 hover:bg-white/15 hover:text-white"
                              : "text-muted-foreground hover:bg-rose-100 hover:text-rose-600"
                          }`}
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full text-xs"
                    onClick={() => setShowAddVideoForm((s) => !s)}
                  >
                    <Plus className="size-3.5" />
                    Adicionar vídeo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 bg-slate-900/95 px-6 py-10 text-center text-white">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                  <Video className="size-6" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="font-display text-base font-bold">
                    Indexe seus vídeos do YouTube nesta aula
                  </h3>
                  <p className="text-xs text-slate-300">
                    Cole quantos links do YouTube quiser (aula teórica, resolução de exercícios, revisão rápida). Tudo fica salvo no seu MySQL.
                  </p>
                </div>
                {!showAddVideoForm && (
                  <Button
                    className="mt-1 rounded-full"
                    onClick={() => setShowAddVideoForm(true)}
                  >
                    <Plus className="size-4" />
                    Adicionar vídeo do YouTube
                  </Button>
                )}
              </div>
            )}

            {/* Formulário de adição de vídeo do YouTube */}
            {showAddVideoForm && (
              <form
                onSubmit={handleSaveVideo}
                className="space-y-3 border-t border-border bg-muted/30 p-4"
              >
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                  <input
                    type="text"
                    required
                    value={videoUrlInput}
                    onChange={(e) => {
                      setVideoUrlInput(e.target.value);
                      if (videoError) setVideoError("");
                    }}
                    placeholder="Cole a URL do YouTube (ex.: https://youtu.be/...)"
                    className="h-9 rounded-xl border border-border bg-white px-3 text-xs text-foreground sm:col-span-7"
                  />
                  <input
                    type="text"
                    value={videoTitleInput}
                    onChange={(e) => setVideoTitleInput(e.target.value)}
                    placeholder="Título (ex.: Aula 1 - Teoria)"
                    className="h-9 rounded-xl border border-border bg-white px-3 text-xs text-foreground sm:col-span-3"
                  />
                  <Button type="submit" size="sm" className="h-9 rounded-xl sm:col-span-2">
                    Salvar
                  </Button>
                </div>
                {videoError && (
                  <p className="text-xs font-medium text-destructive">{videoError}</p>
                )}
              </form>
            )}
          </Card>

          {/* Cabeçalho da Aula */}
          <div className="space-y-2 px-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 font-bold text-secondary-foreground">
                {course.code}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 font-semibold text-muted-foreground">
                {course.tierLabel}
              </span>
              <span className="text-muted-foreground">
                {course.axis} • {course.estimatedHours}h estimadas
              </span>
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              {course.title}
            </h2>
            <p className="text-sm text-muted-foreground">{course.syllabus}</p>
          </div>

          {/* Abas de Conteúdo (Materiais, Anotações, Questões, Cartões) */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
            {(
              [
                { id: "theory", label: "Materiais e Teoria", icon: Sparkles },
                { id: "notes", label: "Anotações (Active Recall)", icon: Brain },
                { id: "practice", label: "Questões do Tema", icon: BookOpen },
                { id: "cards", label: "Cartões da Aula", icon: Layers },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              const active = roomTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRoomTab(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-white text-muted-foreground border border-border hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Conteúdo da Aba Ativa */}
          {roomTab === "theory" && (
            <div className="space-y-4">
              <Card className="rounded-2xl border-border bg-white shadow-none">
                <CardContent className="space-y-4 p-5">
                  <div className="space-y-2">
                    <h3 className="font-display text-base font-bold text-foreground">
                      Resumo Teórico (Base das Transcrições)
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {theory.intro}
                    </p>
                  </div>

                  {theory.sections.length > 0 && (
                    <div className="space-y-3">
                      {theory.sections.map((sec, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-border bg-white p-4"
                        >
                          <h4 className="text-xs font-bold text-foreground">
                            {sec.heading}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-slate-700">
                            {sec.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {theory.keyFormulas.length > 0 && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Ideias & Fórmulas-Chave
                      </p>
                      <ul className="space-y-1.5 text-sm font-semibold text-foreground">
                        {theory.keyFormulas.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      O que você deve dominar neste tema
                    </p>
                    <ul className="space-y-2">
                      {course.whatToStudy.map((w, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700"
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-primary">
                            {idx + 1}
                          </span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                      <Target className="size-3.5" />
                      Exemplo Resolvido
                    </p>
                    <p className="text-xs font-medium text-foreground">
                      {theory.example.prompt}
                    </p>
                    <ul className="space-y-1 text-xs leading-relaxed text-slate-700">
                      {theory.example.solution.map((step, i) => (
                        <li key={i}>• {step}</li>
                      ))}
                    </ul>
                    <p className="text-xs font-bold text-blue-800">
                      Resposta: {theory.example.answer}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                      <Lightbulb className="size-4" />
                      Como cai no ENEM & Dica Anti-Distrator
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
                      {course.enemTip}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {roomTab === "notes" && (
            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Folha em Branco & Anotações da Aula
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Escreva tudo o que você lembra antes ou depois de assistir ao vídeo (Técnica RAD / Feynman). Salvo automaticamente no MySQL.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const template = `[Treino 2ª Fase Unicamp — ${course.code}]\n1. Dados e incógnitas:\n- \n\n2. Desenvolvimento / Fórmulas:\n- \n\n3. Resposta final (com unidade):\n- `;
                        onChangeNote(
                          course.id,
                          noteValue ? `${noteValue}\n\n${template}` : template,
                        );
                      }}
                      className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                    >
                      + Roteiro 2ª Fase Unicamp
                    </button>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                      Auto-save
                    </span>
                  </div>
                </div>

                <textarea
                  rows={10}
                  value={noteValue}
                  onChange={(e) => onChangeNote(course.id, e.target.value)}
                  placeholder="Ex.: Pontos principais que entendi, fórmulas com minhas palavras, armadilhas comuns..."
                  className="w-full rounded-xl border border-border bg-muted/20 p-4 text-sm leading-relaxed text-foreground focus:bg-white"
                />
              </CardContent>
            </Card>
          )}

          {roomTab === "practice" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-white px-4 py-3">
                <div className="inline-flex rounded-full bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setPracticeMode("fixation")}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                      practiceMode === "fixation"
                        ? "bg-slate-900 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    1. Exercícios de Fixação ({lessonExercises.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPracticeMode("enem")}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                      practiceMode === "enem"
                        ? "bg-slate-900 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    2. Questões Reais do ENEM (MySQL)
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {practiceMode === "fixation"
                    ? "Treino progressivo 100% focado no tema desta aula"
                    : "Provas oficiais anteriores (2014–2023)"}
                </span>
              </div>

              {practiceMode === "fixation" ? (
                <div className="space-y-4">
                  {lessonExercises.map((ex, idx) => {
                    const chosen = exerciseAnswers[ex.id];
                    const isRight = chosen === ex.correct;
                    return (
                      <Card
                        key={ex.id}
                        className="rounded-2xl border-border bg-white shadow-none"
                      >
                        <CardContent className="space-y-3 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-primary">
                              Questão {idx + 1} • {ex.level}
                            </span>
                            {chosen && (
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                  isRight
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {isRight
                                  ? "Acertou!"
                                  : `Errou (Gabarito: ${ex.correct})`}
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-semibold leading-relaxed text-foreground">
                            {ex.prompt}
                          </p>

                          <div className="space-y-1.5">
                            {ex.alternatives.map((alt) => {
                              const isChosen = chosen === alt.letter;
                              const isCorrectAlt = alt.letter === ex.correct;
                              let cls =
                                "border-border bg-white hover:bg-muted/40";
                              if (chosen) {
                                if (isCorrectAlt)
                                  cls =
                                    "border-emerald-500 bg-emerald-50 text-emerald-950";
                                else if (isChosen)
                                  cls =
                                    "border-rose-500 bg-rose-50 text-rose-950";
                              }
                              return (
                                <button
                                  key={alt.letter}
                                  type="button"
                                  disabled={Boolean(chosen)}
                                  onClick={() =>
                                    setExerciseAnswers((prev) => ({
                                      ...prev,
                                      [ex.id]: alt.letter,
                                    }))
                                  }
                                  className={`flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-xs transition-colors ${cls}`}
                                >
                                  <span className="font-bold">
                                    {alt.letter})
                                  </span>
                                  <span>{alt.text}</span>
                                </button>
                              );
                            })}
                          </div>

                          {chosen && (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 text-xs space-y-2">
                              <p className="font-bold text-emerald-800">
                                Resolução comentada:
                              </p>
                              <p className="leading-relaxed text-slate-700">
                                {ex.explanation}
                              </p>
                              {!isRight && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSendToErrors(
                                      course.subjectName,
                                      `${course.code} — ${ex.prompt.slice(0, 60)}...`,
                                      "Não sabia o conteúdo",
                                      ex.id,
                                    )
                                  }
                                  className="font-bold text-primary hover:underline"
                                >
                                  Guardar este erro no Caderno de Erros →
                                </button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <QuestionBankTab
                  exams={exams}
                  initialDiscipline={course.disciplineApi}
                  initialSearch={course.searchKeyword || "soma"}
                  onSendToErrors={onSendToErrors}
                />
              )}
            </div>
          )}

          {roomTab === "cards" && (
            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="space-y-3 p-5">
                <h3 className="font-display text-base font-bold text-foreground">
                  Cartões revisionais desta aula ({theory.keyFormulas.length || 2})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ao concluir a aula, estes pontos entram automaticamente na sua coleção de revisão espaçada.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(theory.keyFormulas.length > 0
                    ? theory.keyFormulas
                    : course.whatToStudy.slice(0, 2)
                  ).map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        Cartão #{idx + 1} • {course.code}
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-foreground">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna Direita: Missão da aula + Neste conteúdo */}
        <div className="space-y-4 lg:col-span-4">
          {/* Card Missão da aula */}
          <Card className="rounded-2xl border-border bg-white shadow-none">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-foreground">
                  Missão da aula
                </h3>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-primary">
                  +45 XP
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status atual
                </label>
                <select
                  aria-label="Status da aula"
                  value={status}
                  onChange={(e) =>
                    onChangeStatus(course.id, e.target.value as TopicStatus)
                  }
                  className="h-9 w-full rounded-xl border border-border bg-muted/30 px-3 text-xs font-semibold text-foreground"
                >
                  <option value="todo">A fazer</option>
                  <option value="doing">Em andamento</option>
                  <option value="done">Concluída</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full rounded-full"
                  onClick={() => {
                    onChangeStatus(course.id, "done");
                    if (nextCourse) {
                      onSelectCourse(nextCourse.id);
                      setRoomTab("theory");
                    }
                  }}
                >
                  <CheckCircle2 className="size-4" />
                  {status === "done"
                    ? "Concluída • Ir para próxima"
                    : "Marcar como concluída"}
                </Button>

                {nextCourse && (
                  <Button
                    variant="secondary"
                    className="w-full rounded-full"
                    onClick={() => {
                      onSelectCourse(nextCourse.id);
                      setRoomTab("theory");
                    }}
                  >
                    Pular para {nextCourse.code}
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground">
                Sessões Pomodoro concluídas: <strong className="text-foreground">{completedSessions}</strong>
              </p>
            </CardContent>
          </Card>

          {/* Card Neste conteúdo */}
          <Card className="rounded-2xl border-border bg-white shadow-none">
            <CardContent className="space-y-3 p-5">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Neste conteúdo
                </h3>
                <p className="text-xs text-muted-foreground">
                  {cycleInfo?.name} • {sameCycleCourses.length} aulas
                </p>
              </div>

              <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
                {sameCycleCourses.map((c) => {
                  const isCurrent = c.id === course.id;
                  const isDone = topicStatus[c.id] === "done";
                  const vidCount = (lessonVideos[c.id] || []).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelectCourse(c.id);
                        setRoomTab("theory");
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors ${
                        isCurrent
                          ? "bg-secondary text-foreground"
                          : "hover:bg-muted/60"
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="size-4 text-primary" />
                        ) : (
                          <Circle
                            className={`size-4 ${
                              isCurrent ? "text-primary" : "text-slate-300"
                            }`}
                          />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-xs font-bold ${
                            isCurrent ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {c.code} — {c.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-0.5">
                            <Clock className="size-3" />
                            {c.estimatedHours}h
                          </span>
                          {vidCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-medium">
                              <Video className="size-3" />
                              {vidCount}
                            </span>
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
