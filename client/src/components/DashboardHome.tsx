import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Atom,
  BookOpen,
  Calculator,
  CheckCircle2,
  Circle,
  Dna,
  Flame,
  FlaskConical,
  Globe,
  PenTool,
  Play,
  Sparkles,
} from "lucide-react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Button } from "@/components/motion/button";
import { Card, CardContent } from "@/components/motion/card";
import { AREAS, CYCLES, TOPICS } from "@/data/enemData";
import { MATH_CURRICULUM } from "@/data/mathCurriculum";
import type { StudyLevel, StudyState, TabId } from "@/types/study";

interface DashboardHomeProps {
  state: StudyState;
  daysToEnem: number;
  pomodoroRunning: boolean;
  pomodoroClock: string;
  onNavigate: (tab: TabId) => void;
  onStartSession: (dayId: string, courseId?: string) => void;
  onOpenCourse: (courseId: string) => void;
  onToggleScheduleDay: (dayId: string) => void;
  onChangeStudyLevel: (level: StudyLevel) => void;
  onChangeCycle: (cycleId: string) => void;
}

type RhythmMetric = "xp" | "questions" | "time";

const WEEK_DAYS = [
  { id: "seg", short: "Seg", num: 16 },
  { id: "ter", short: "Ter", num: 17 },
  { id: "qua", short: "Qua", num: 18 },
  { id: "qui", short: "Qui", num: 19 },
  { id: "sex", short: "Sex", num: 20 },
  { id: "sab", short: "Sáb", num: 21 },
  { id: "dom", short: "Dom", num: 22 },
];

const LEVEL_GUIDANCE: Record<StudyLevel, { label: string; summary: string }> = {
  R1: {
    label: "R1 — Base Zero",
    summary: "Priorize Base Cognitiva + Core (80% da prova) antes de avançar.",
  },
  R2: {
    label: "R2 — Com Lacunas",
    summary: "Use Listas Globais para caçar lacunas e ataque só o que falta.",
  },
  R3: {
    label: "R3 — Avançado",
    summary: "Foco em Simulados, Diferencial (20%) e eliminação de erros bobos.",
  },
};

const AREA_META: Record<string, { short: string; color: string; dot: string }> = {
  "Matemática": { short: "Matemática", color: "bg-blue-500", dot: "bg-blue-500" },
  "Ciências da Natureza": { short: "Natureza", color: "bg-emerald-500", dot: "bg-emerald-500" },
  "Linguagens / Redação": { short: "Linguagens", color: "bg-rose-500", dot: "bg-rose-500" },
  "Ciências Humanas": { short: "Humanas", color: "bg-amber-500", dot: "bg-amber-500" },
};

const SUBJECT_CARDS = [
  {
    id: "mat",
    name: "Matemática",
    areaKey: "Matemática",
    icon: Calculator,
    bg: "bg-blue-50 text-blue-600",
    bar: "bg-blue-500",
    tab: "math-curriculum" as TabId,
    totalLessons: MATH_CURRICULUM.length,
  },
  {
    id: "bio",
    name: "Biologia",
    areaKey: "Biologia",
    icon: Dna,
    bg: "bg-emerald-50 text-emerald-600",
    bar: "bg-emerald-500",
    tab: "schedule" as TabId,
    totalLessons: 12,
  },
  {
    id: "fis",
    name: "Física",
    areaKey: "Física",
    icon: Atom,
    bg: "bg-sky-50 text-sky-600",
    bar: "bg-sky-500",
    tab: "schedule" as TabId,
    totalLessons: 10,
  },
  {
    id: "qui",
    name: "Química",
    areaKey: "Química",
    icon: FlaskConical,
    bg: "bg-teal-50 text-teal-600",
    bar: "bg-teal-500",
    tab: "schedule" as TabId,
    totalLessons: 10,
  },
  {
    id: "lin",
    name: "Linguagens",
    areaKey: "Linguagens",
    icon: BookOpen,
    bg: "bg-violet-50 text-violet-600",
    bar: "bg-violet-500",
    tab: "topics" as TabId,
    totalLessons: 8,
  },
  {
    id: "hum",
    name: "Humanas",
    areaKey: "Humanas",
    icon: Globe,
    bg: "bg-amber-50 text-amber-600",
    bar: "bg-amber-500",
    tab: "topics" as TabId,
    totalLessons: 10,
  },
  {
    id: "red",
    name: "Redação",
    areaKey: "Redação",
    icon: PenTool,
    bg: "bg-rose-50 text-rose-600",
    bar: "bg-rose-500",
    tab: "essays" as TabId,
    totalLessons: 6,
  },
];

export function DashboardHome({
  state,
  daysToEnem,
  pomodoroRunning,
  pomodoroClock,
  onNavigate,
  onStartSession,
  onOpenCourse,
  onToggleScheduleDay,
  onChangeStudyLevel,
  onChangeCycle,
}: DashboardHomeProps) {
  const [selectedDayId, setSelectedDayId] = useState<string>(
    () => state.schedule.find((d) => !d.done)?.id || state.schedule[0]?.id || "seg",
  );
  const [rhythmMetric, setRhythmMetric] = useState<RhythmMetric>("xp");

  // Metrics derived from real state
  const metrics = useMemo(() => {
    const questionsDone = state.weeklyPlan.reduce((acc, i) => acc + (i.questionsDone || 0), 0);
    const questionsCorrect = state.weeklyPlan.reduce(
      (acc, i) => acc + (i.questionsCorrect || 0),
      0,
    );
    const accuracyPct =
      questionsDone > 0 ? Math.round((questionsCorrect / questionsDone) * 100) : 0;

    const completedLessons = MATH_CURRICULUM.filter(
      (c) => state.topicStatus[c.id] === "done",
    ).length;
    const completedReviews = state.weeklyPlan.reduce(
      (acc, i) => acc + (i.rev1Done ? 1 : 0) + (i.rev2Done ? 1 : 0),
      0,
    );
    const completedScheduleDays = state.schedule.filter((d) => d.done).length;

    const xp =
      completedLessons * 45 +
      completedReviews * 20 +
      questionsDone * 5 +
      state.pomodoroSessions * 25 +
      completedScheduleDays * 30;

    const streakDays = Math.max(
      completedScheduleDays,
      state.pomodoroSessions > 0 || completedLessons > 0 ? 1 : 0,
    );

    const hours = Math.floor(state.totalMinutes / 60);
    const mins = state.totalMinutes % 60;

    return {
      questionsDone,
      questionsCorrect,
      accuracyPct,
      completedLessons,
      completedReviews,
      completedScheduleDays,
      xp,
      streakDays,
      hours,
      mins,
    };
  }, [state]);

  // Next active lesson for "Em andamento"
  const featuredCourse = useMemo(() => {
    const doing = MATH_CURRICULUM.find((c) => state.topicStatus[c.id] === "doing");
    if (doing) return doing;
    const todo = MATH_CURRICULUM.find((c) => state.topicStatus[c.id] !== "done");
    return todo || MATH_CURRICULUM[0];
  }, [state.topicStatus]);

  const upNextCourses = useMemo(() => {
    return MATH_CURRICULUM.filter((c) => c.id !== featuredCourse.id).slice(0, 3);
  }, [featuredCourse]);

  const mathDoneCount = useMemo(
    () => MATH_CURRICULUM.filter((c) => state.topicStatus[c.id] === "done").length,
    [state.topicStatus],
  );
  const mathPct = Math.round((mathDoneCount / MATH_CURRICULUM.length) * 100);

  // Selected day schedule + weekly items for Agenda
  const selectedDayItem =
    state.schedule.find((d) => d.id === selectedDayId) || state.schedule[0];

  const agendaTasks = useMemo(() => {
    const tasks: Array<{
      id: string;
      title: string;
      meta: string;
      tag: string;
      dot: string;
      done: boolean;
      courseId?: string;
      isScheduleDay?: boolean;
    }> = [];

    if (selectedDayItem) {
      tasks.push({
        id: selectedDayItem.id,
        title: selectedDayItem.subject,
        meta: `${selectedDayItem.minutes || 45} min • ${selectedDayItem.task || "Bloco principal"}`,
        tag: selectedDayItem.day,
        dot: "bg-emerald-500",
        done: selectedDayItem.done,
        courseId: selectedDayItem.courseId,
        isScheduleDay: true,
      });
    }

    const week1Pending = state.weeklyPlan
      .filter((w) => w.week === 1)
      .slice(0, 4);

    for (const item of week1Pending) {
      tasks.push({
        id: item.id,
        title: `${item.subjectLabel}: ${item.title}`,
        meta: item.aulaDone
          ? "Revisão espaçada (REV 1 / REV 2)"
          : "Aula teórica + questões",
        tag: item.area,
        dot:
          item.area === "Matemática"
            ? "bg-blue-500"
            : item.area === "Biologia"
              ? "bg-emerald-500"
              : item.area === "Química"
                ? "bg-teal-500"
                : "bg-violet-500",
        done: item.aulaDone && item.rev1Done,
        courseId: item.courseId,
      });
    }

    return tasks;
  }, [selectedDayItem, state.weeklyPlan]);

  // Weekly rhythm bars (derived cleanly from schedule completion & state)
  const rhythmBars = useMemo(() => {
    return WEEK_DAYS.map((wd, idx) => {
      const sched = state.schedule[idx];
      const baseMinutes = sched?.done ? Math.max(sched.minutes, 45) : idx === 0 ? Math.min(state.totalMinutes, 90) : 0;
      const xpVal = sched?.done ? 85 : idx === 0 ? Math.min(metrics.xp, 120) : 0;
      const qVal = sched?.done ? 12 : idx === 0 ? Math.min(metrics.questionsDone, 20) : 0;
      const value =
        rhythmMetric === "xp"
          ? xpVal
          : rhythmMetric === "questions"
            ? qVal
            : baseMinutes;
      return {
        label: wd.short,
        value,
      };
    });
  }, [state.schedule, state.totalMinutes, metrics.xp, metrics.questionsDone, rhythmMetric]);

  const maxBar = Math.max(10, ...rhythmBars.map((b) => b.value));

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Strip (Protocolo ENEM style) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border bg-card shadow-none">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">
              Questões na semana
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                <AnimatedNumber value={metrics.questionsDone} />
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.questionsDone > 0
                ? `${metrics.accuracyPct}% de acerto`
                : "Resolva questões no Banco"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-none">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Ofensiva</p>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                <AnimatedNumber value={metrics.streakDays} />
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {metrics.streakDays === 1 ? "dia" : "dias"}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {WEEK_DAYS.map((d, i) => (
                <span
                  key={d.id}
                  className={`size-2 rounded-full ${
                    i < metrics.streakDays ? "bg-amber-500" : "bg-slate-200"
                  }`}
                />
              ))}
              <span className="ml-1 text-[11px] text-muted-foreground">
                • ~{daysToEnem > 0 ? daysToEnem : 350}d p/ ENEM
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-none">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">
              XP na semana
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                <AnimatedNumber value={metrics.xp} />
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-emerald-600">
              +{metrics.completedLessons} aulas • +{metrics.completedReviews} revisões
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-none">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">
              Tempo de estudo
            </p>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="font-display text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                {metrics.hours > 0
                  ? `${metrics.hours}h ${String(metrics.mins).padStart(2, "0")}m`
                  : `${metrics.mins}min`}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {pomodoroRunning
                ? `Pomodoro ativo (${pomodoroClock})`
                : `${state.pomodoroSessions} sessões Pomodoro`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main 2-column Bento Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left Column: Agenda + Constância + Nivelamento */}
        <div className="space-y-5 lg:col-span-4">
          <Card className="rounded-2xl border-border bg-card shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">
                    Agenda
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Semana atual de estudos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate("schedule")}
                  className="inline-flex size-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Abrir Rotina completa"
                >
                  <ArrowUpRight className="size-4" />
                </button>
              </div>

              {/* 7-day selector strip */}
              <div className="mt-4 grid grid-cols-7 gap-1">
                {WEEK_DAYS.map((day, idx) => {
                  const schedId = state.schedule[idx]?.id || day.id;
                  const isSelected = selectedDayId === schedId;
                  const isDone = Boolean(state.schedule[idx]?.done);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setSelectedDayId(schedId)}
                      className={`flex flex-col items-center rounded-2xl py-2 text-center transition-all ${
                        isSelected
                          ? "bg-primary text-white shadow-sm"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-medium ${
                          isSelected ? "text-emerald-100" : "text-muted-foreground"
                        }`}
                      >
                        {day.short}
                      </span>
                      <span className="mt-0.5 text-sm font-bold tabular-nums">
                        {day.num}
                      </span>
                      <span
                        className={`mt-1 size-1.5 rounded-full ${
                          isDone
                            ? isSelected
                              ? "bg-white"
                              : "bg-emerald-500"
                            : "bg-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Tasks list */}
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Tarefas • {agendaTasks.length}
                </p>

                {agendaTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-white p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/30"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (task.isScheduleDay) {
                          onToggleScheduleDay(task.id);
                        } else if (task.courseId) {
                          onOpenCourse(task.courseId);
                        } else {
                          onNavigate("schedule");
                        }
                      }}
                      className="shrink-0 text-slate-300 transition-colors hover:text-primary"
                      aria-label={`Alternar ${task.title}`}
                    >
                      {task.done ? (
                        <CheckCircle2 className="size-5 text-primary" />
                      ) : (
                        <Circle className="size-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-semibold text-foreground ${
                          task.done ? "line-through opacity-60" : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <span className={`size-1.5 shrink-0 rounded-full ${task.dot}`} />
                        <span className="truncate">{task.meta}</span>
                      </p>
                    </div>

                    {task.courseId && (
                      <button
                        type="button"
                        onClick={() =>
                          task.isScheduleDay
                            ? onStartSession(task.id, task.courseId)
                            : onOpenCourse(task.courseId!)
                        }
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary opacity-80 transition-all hover:bg-primary hover:text-white group-hover:opacity-100"
                        title="Iniciar aula"
                      >
                        <Play className="size-3.5 fill-current" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Constância & Nivelamento */}
          <Card className="rounded-2xl border-border bg-card shadow-none">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-foreground">
                  Constância & Perfil
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                  <Flame className="size-3.5 text-primary" />
                  {state.studyLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Nivelamento
                  </label>
                  <select
                    aria-label="Nivelamento R1, R2 ou R3"
                    value={state.studyLevel}
                    onChange={(e) => onChangeStudyLevel(e.target.value as StudyLevel)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-muted/40 px-2.5 text-xs font-semibold text-foreground"
                  >
                    <option value="R1">R1 — Base Zero</option>
                    <option value="R2">R2 — Com Lacunas</option>
                    <option value="R3">R3 — Avançado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Ciclo Atual
                  </label>
                  <select
                    aria-label="Ciclo atual do plano"
                    value={state.currentCycle}
                    onChange={(e) => onChangeCycle(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-muted/40 px-2.5 text-xs font-semibold text-foreground"
                  >
                    {CYCLES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {LEVEL_GUIDANCE[state.studyLevel].summary}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Em andamento + Seu ritmo / Acerto por área + Suas matérias */}
        <div className="space-y-5 lg:col-span-8">
          {/* Em andamento */}
          <Card className="rounded-2xl border-border bg-card shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-foreground">
                  Em andamento
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate("math-curriculum")}
                  className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Ver aulas
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
                {/* Featured active course card */}
                <div className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 md:col-span-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                      <Calculator className="size-5" />
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-xs">
                      {mathDoneCount}/{MATH_CURRICULUM.length} aulas
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold text-emerald-700">
                      {featuredCourse.code} • {featuredCourse.axis}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold leading-snug text-foreground">
                      {featuredCourse.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {featuredCourse.syllabus}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-emerald-100">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.max(mathPct, 4)}%` }}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="rounded-full px-4"
                      onClick={() => onOpenCourse(featuredCourse.id)}
                    >
                      Continuar
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Next up modules */}
                <div className="flex flex-col justify-between divide-y divide-border md:col-span-6">
                  {upNextCourses.map((course) => {
                    const isDone = state.topicStatus[course.id] === "done";
                    const isDoing = state.topicStatus[course.id] === "doing";
                    const pct = isDone ? 100 : isDoing ? 50 : 0;
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => onOpenCourse(course.id)}
                        className="flex items-center justify-between gap-3 py-3 text-left transition-colors first:pt-1 last:pb-1 hover:bg-muted/40 rounded-xl px-2 -mx-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Sparkles className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {course.title}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {course.code} • {course.axis}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <span className="tabular-nums">{pct}%</span>
                          <ArrowRight className="size-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seu ritmo + Acerto por área */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Seu ritmo */}
            <Card className="rounded-2xl border-border bg-card shadow-none">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-base font-bold text-foreground">
                      Seu ritmo
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {rhythmMetric === "xp"
                        ? `${metrics.xp} XP acumulado na semana`
                        : rhythmMetric === "questions"
                          ? `${metrics.questionsDone} questões na semana`
                          : `${state.totalMinutes} min registrados`}
                    </p>
                  </div>
                </div>

                {/* Metric pills */}
                <div className="mt-3 inline-flex rounded-full bg-muted p-1">
                  {(
                    [
                      { id: "xp", label: "XP" },
                      { id: "questions", label: "Questões" },
                      { id: "time", label: "Tempo" },
                    ] as const
                  ).map((pill) => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setRhythmMetric(pill.id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                        rhythmMetric === pill.id
                          ? "bg-white text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                {/* Vertical emerald bar chart */}
                <div className="mt-5 grid h-36 grid-cols-7 items-end gap-2 pt-2">
                  {rhythmBars.map((bar) => {
                    const heightPct = Math.max(
                      bar.value > 0 ? Math.round((bar.value / maxBar) * 100) : 6,
                      6,
                    );
                    return (
                      <div
                        key={bar.label}
                        className="flex h-full flex-col items-center justify-end gap-1.5"
                      >
                        <div className="flex w-full flex-1 items-end justify-center">
                          <div
                            title={`${bar.label}: ${bar.value}`}
                            className={`w-5 rounded-t-lg transition-all duration-300 ${
                              bar.value > 0 ? "bg-primary" : "bg-slate-100"
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {bar.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Acerto / Progresso por área */}
            <Card className="rounded-2xl border-border bg-card shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-foreground">
                    Domínio por área
                  </h2>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    Edital ENEM
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {AREAS.map((area) => {
                    const items = TOPICS.filter((t) => t.area === area);
                    const done = items.filter(
                      (t) => state.topicStatus[t.id] === "done",
                    ).length;
                    const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
                    const meta = AREA_META[area] || {
                      short: area,
                      color: "bg-primary",
                      dot: "bg-primary",
                    };
                    return (
                      <div key={area} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-2 text-foreground">
                            <span className={`size-2 rounded-full ${meta.dot}`} />
                            {meta.short}
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            {done}/{items.length} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${meta.color} transition-all duration-300`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suas matérias */}
          <Card className="rounded-2xl border-border bg-card shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-foreground">
                  Suas matérias
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate("topics")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Mapa completo →
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {SUBJECT_CARDS.map((subj) => {
                  const Icon = subj.icon;
                  const done =
                    subj.id === "mat"
                      ? mathDoneCount
                      : subj.id === "red"
                        ? state.essays.length
                        : state.weeklyPlan.filter(
                            (w) => w.area === subj.areaKey && w.aulaDone,
                          ).length;
                  const pct = Math.min(
                    100,
                    Math.round((done / subj.totalLessons) * 100),
                  );
                  return (
                    <button
                      key={subj.id}
                      type="button"
                      onClick={() => onNavigate(subj.tab)}
                      className="group flex flex-col gap-3 rounded-2xl border border-border bg-white p-3.5 text-left transition-all hover:border-emerald-200 hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex size-9 items-center justify-center rounded-xl ${subj.bg}`}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {subj.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {done}/{subj.totalLessons} concluídas
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold tabular-nums text-muted-foreground group-hover:text-primary">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${subj.bar} transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
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
