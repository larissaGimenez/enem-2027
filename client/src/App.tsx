import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Database,
  Download,
  GraduationCap,
  Home,
  Layers,
  Library,
  Map,
  PenLine,
  Timer,
  Upload,
} from "lucide-react";
import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarProvider,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { Button } from "@/components/motion/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/motion/card";
import { Input } from "@/components/motion/input";
import { CardsTab } from "@/components/CardsTab";
import { DashboardHome } from "@/components/DashboardHome";
import { ErrorNotebookTab } from "@/components/ErrorNotebookTab";
import { MathCurriculumTab } from "@/components/MathCurriculumTab";
import { PerformanceTab } from "@/components/PerformanceTab";
import {
  formatClock,
  POMODORO_PRESETS,
  type PomodoroMode,
} from "@/components/PomodoroSessionCard";
import { QuestionBankTab } from "@/components/QuestionBankTab";
import { RedacaoTab } from "@/components/RedacaoTab";
import { ScheduleTab } from "@/components/ScheduleTab";
import { SimuladosTab } from "@/components/SimuladosTab";
import { StudyRoom } from "@/components/StudyRoom";
import { AREAS, CYCLES, DEFAULT_SCHEDULE, TARGET_DATE, TOPICS } from "@/data/enemData";
import { DEFAULT_WEEKLY_PLAN } from "@/data/weeklyPlanData";
import type {
  ExamSummary,
  StudyState,
  TabId,
  TopicStatus,
} from "@/types/study";

const STORAGE_KEY = "guia_enem_2027_state_v1";

function normalizeState(raw: Partial<StudyState> | null | undefined): StudyState {
  const rawSchedule = Array.isArray(raw?.schedule) ? raw.schedule : DEFAULT_SCHEDULE;
  const schedule = rawSchedule.map((item, idx) => ({
    id: item.id || DEFAULT_SCHEDULE[idx]?.id || `day-${idx}`,
    day: item.day || `Dia ${idx + 1}`,
    subject: item.subject || "Estudo",
    task: item.task || "",
    minutes: Number(item.minutes) || 0,
    done: Boolean(item.done),
    courseId: item.courseId ?? DEFAULT_SCHEDULE[idx]?.courseId,
  }));

  return {
    currentCycle: raw?.currentCycle || "ciclo-1",
    studyLevel: raw?.studyLevel || "R1",
    totalMinutes: Number(raw?.totalMinutes) || 0,
    pomodoroSessions: Number(raw?.pomodoroSessions) || 0,
    weeklyTargets: Array.isArray(raw?.weeklyTargets) ? raw.weeklyTargets : [],
    weeklyPlan:
      Array.isArray(raw?.weeklyPlan) && raw.weeklyPlan.length > 0
        ? raw.weeklyPlan
        : DEFAULT_WEEKLY_PLAN,
    topicStatus: raw?.topicStatus || {},
    lessonVideos: raw?.lessonVideos || {},
    lessonNotes: raw?.lessonNotes || {},
    questionAttempts: raw?.questionAttempts || {},
    questionLists: Array.isArray(raw?.questionLists) ? raw.questionLists : [],
    cardReviews: raw?.cardReviews || {},
    simuladoHistory: Array.isArray(raw?.simuladoHistory) ? raw.simuladoHistory : [],
    routineConfig: raw?.routineConfig || {
      dreamCourse: "Ciência da Computação",
      university: "Unicamp",
      pace: "equilibrado",
      weeklyHoursByDay: { seg: 2, ter: 2, qua: 2, qui: 2, sex: 2, sab: 3, dom: 0 },
    },
    schedule,
    essays: Array.isArray(raw?.essays) ? raw.essays : [],
    errors: Array.isArray(raw?.errors) ? raw.errors : [],
  };
}

function loadLocalState(): StudyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch {
    // ignore corrupted localStorage
  }
  return normalizeState({});
}

const NAV_GROUPS: Array<{
  label: string;
  items: Array<{
    id: TabId;
    label: string;
    icon: typeof Home;
    matches?: TabId[];
  }>;
}> = [
  {
    label: "Aprender",
    items: [
      { id: "dashboard", label: "Início", icon: Home },
      { id: "math-curriculum", label: "Aulas", icon: Library, matches: ["math-curriculum", "session"] },
    ],
  },
  {
    label: "Praticar",
    items: [
      { id: "questions", label: "Questões", icon: BookOpen, matches: ["questions", "errors", "performance"] },
      { id: "simulados", label: "Simulados", icon: ClipboardCheck },
      { id: "cards", label: "Cartões", icon: Layers },
      { id: "essays", label: "Redação", icon: PenLine },
    ],
  },
  {
    label: "Organizar",
    items: [
      { id: "schedule", label: "Rotina", icon: CalendarDays },
      { id: "topics", label: "Mapa do Edital", icon: Map },
    ],
  },
];

const TAB_TITLES: Record<TabId, { bold: string; light?: string }> = {
  dashboard: { bold: "Início" },
  "math-curriculum": { bold: "Aulas", light: "do curso" },
  session: { bold: "Sala", light: "de aula" },
  questions: { bold: "Banco", light: "de questões" },
  errors: { bold: "Caderno", light: "de erros" },
  performance: { bold: "Seu", light: "desempenho" },
  simulados: { bold: "Simulados", light: "ENEM" },
  cards: { bold: "Cartões", light: "revisionais" },
  essays: { bold: "Redação", light: "ENEM" },
  schedule: { bold: "Sua", light: "rotina" },
  topics: { bold: "Mapa", light: "do edital" },
};

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [state, setState] = useState<StudyState>(() => loadLocalState());
  const [apiConnected, setApiConnected] = useState(false);
  const [dbQuestionCount, setDbQuestionCount] = useState<number | null>(null);
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const syncTimerRef = useRef<number | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  // Filtros do Mapa de Conteúdos
  const [filterCycle, setFilterCycle] = useState("all");
  const [filterArea, setFilterArea] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");

  // Filtro inicial para o Banco de Questões vindo da Grade de Matemática
  const [qbPreset, setQbPreset] = useState<{
    discipline: string;
    search: string;
  }>({ discipline: "", search: "" });

  // Sessão de Estudos (Sala de Aula + Pomodoro)
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>("focus-25");
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_PRESETS["focus-25"].minutes * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [sessionTopicId, setSessionTopicId] = useState("m1-0");

  useEffect(() => {
    if (!pomodoroRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setPomodoroRunning(false);
          const preset = POMODORO_PRESETS[pomodoroMode];
          if (preset.isFocus) {
            updateState((p) => ({
              ...p,
              totalMinutes: p.totalMinutes + preset.minutes,
              pomodoroSessions: p.pomodoroSessions + 1,
            }));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [pomodoroRunning, pomodoroMode]);

  function handleSelectPomodoroMode(nextMode: PomodoroMode) {
    setPomodoroRunning(false);
    setPomodoroMode(nextMode);
    setSecondsLeft(POMODORO_PRESETS[nextMode].minutes * 60);
  }

  function handleCompletePomodoroNow() {
    const preset = POMODORO_PRESETS[pomodoroMode];
    const elapsedMins = Math.floor((preset.minutes * 60 - secondsLeft) / 60);
    if (preset.isFocus && elapsedMins >= 1) {
      updateState((p) => ({
        ...p,
        totalMinutes: p.totalMinutes + elapsedMins,
        pomodoroSessions: p.pomodoroSessions + 1,
      }));
    }
    setPomodoroRunning(false);
    setSecondsLeft(preset.minutes * 60);
  }

  function handleStartSessionForDay(dayId: string, courseId?: string) {
    const dayObj = state.schedule.find((d) => d.id === dayId);
    const targetCourse = courseId || dayObj?.courseId || sessionTopicId || "m1-0";
    setSessionTopicId(targetCourse);
    setPomodoroMode("focus-25");
    setSecondsLeft(POMODORO_PRESETS["focus-25"].minutes * 60);
    setPomodoroRunning(true);
    setActiveTab("session");
  }

  function handleOpenCourseInRoom(courseId: string) {
    setSessionTopicId(courseId);
    setActiveTab("session");
  }

  useEffect(() => {
    let active = true;
    async function initSync() {
      try {
        const healthRes = await fetch("/api/health");
        if (!healthRes.ok) throw new Error("offline");
        const health = await healthRes.json();
        if (!active) return;
        setApiConnected(true);
        setDbQuestionCount(Number(health.totalQuestions) || 0);

        const stateRes = await fetch(`/api/study-state/${STORAGE_KEY}`);
        if (stateRes.ok) {
          const remote = await stateRes.json();
          if (remote.exists && remote.payload && active) {
            const next = normalizeState(remote.payload);
            setState(next);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } else if (localStorage.getItem(STORAGE_KEY)) {
            await fetch(`/api/study-state/${STORAGE_KEY}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(loadLocalState()),
            });
          }
        }

        const examsRes = await fetch("/api/exams");
        if (examsRes.ok && active) {
          setExams(await examsRes.json());
        }
      } catch {
        if (!active) return;
        setApiConnected(false);
      }
    }
    initSync();
    return () => {
      active = false;
    };
  }, []);

  function updateState(updater: (prev: StudyState) => StudyState) {
    setState((prev) => {
      const next = updater(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (apiConnected) {
        if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = window.setTimeout(() => {
          fetch(`/api/study-state/${STORAGE_KEY}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          }).catch(() => {});
        }, 300);
      }
      return next;
    });
  }

  const daysToEnem = useMemo(() => {
    const today = new Date();
    const target = new Date(`${TARGET_DATE}T09:00:00`);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  const filteredTopics = useMemo(() => {
    const term = filterSearch.trim().toLowerCase();
    return TOPICS.filter((t) => {
      const st = state.topicStatus[t.id] || "todo";
      if (filterCycle !== "all" && t.cycle !== filterCycle) return false;
      if (filterArea !== "all" && t.area !== filterArea) return false;
      if (filterStatus !== "all" && st !== filterStatus) return false;
      if (
        term &&
        !t.title.toLowerCase().includes(term) &&
        !t.sub.toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [state.topicStatus, filterCycle, filterArea, filterStatus, filterSearch]);

  function handleExport() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guia-enem-2027-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        updateState(() => normalizeState(parsed));
      } catch {
        alert("Arquivo de backup inválido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const activeTitle = TAB_TITLES[activeTab] || { bold: "Guia ENEM 2027" };

  return (
    <AnimatedSidebarProvider>
      <AnimatedSidebar collapsible="icon" variant="sidebar" className="protocol-sidebar border-r border-border">
        <AnimatedSidebarHeader className="px-3 py-3.5">
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <GraduationCap className="size-4.5" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-sm font-extrabold tracking-tight text-foreground">
                Guia<span className="font-semibold text-primary">ENEM</span>
              </p>
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                Edição 2027
              </p>
            </div>
          </div>
        </AnimatedSidebarHeader>

        <AnimatedSidebarContent className="px-2">
          {NAV_GROUPS.map((group) => (
            <AnimatedSidebarGroup key={group.label} className="py-1.5">
              <AnimatedSidebarGroupLabel className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.label}
              </AnimatedSidebarGroupLabel>
              <AnimatedSidebarGroupContent>
                <AnimatedSidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isItemActive = item.matches
                      ? item.matches.includes(activeTab)
                      : activeTab === item.id;
                    return (
                      <AnimatedSidebarMenuItem key={item.id}>
                        <AnimatedSidebarMenuButton
                          isActive={isItemActive}
                          icon={
                            <span
                              className={`flex size-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                isItemActive
                                  ? "bg-primary text-white"
                                  : "text-slate-500"
                              }`}
                            >
                              <Icon className="size-3.5" />
                            </span>
                          }
                          onSelect={() => setActiveTab(item.id)}
                        >
                          {item.label}
                        </AnimatedSidebarMenuButton>
                      </AnimatedSidebarMenuItem>
                    );
                  })}
                </AnimatedSidebarMenu>
              </AnimatedSidebarGroupContent>
            </AnimatedSidebarGroup>
          ))}
        </AnimatedSidebarContent>

        <AnimatedSidebarFooter className="border-t border-border p-2.5">
          <div className="flex items-center justify-between gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("session")}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-muted hover:text-foreground"
              title="Abrir Sala de Aula / Pomodoro"
            >
              <Clock className="size-3.5 shrink-0 text-primary" />
              <span className="truncate tabular-nums">
                {pomodoroRunning ? formatClock(secondsLeft) : "Tempo"}
              </span>
            </button>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleExport}
                title="Exportar backup JSON"
                className="inline-flex size-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Download className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                title="Importar backup JSON"
                className="inline-flex size-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Upload className="size-3.5" />
              </button>
            </div>
          </div>

          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            hidden
            onChange={handleImportFile}
          />

          <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-muted/70 px-2.5 py-1.5 text-[11px]">
            <Database
              className={`size-3.5 shrink-0 ${
                apiConnected ? "text-emerald-600" : "text-amber-600"
              }`}
            />
            <span className="truncate font-medium text-muted-foreground">
              {apiConnected
                ? `MySQL • ${dbQuestionCount ?? 0} questões`
                : "Modo Offline"}
            </span>
          </div>
        </AnimatedSidebarFooter>

        <AnimatedSidebarRail />
      </AnimatedSidebar>

      <AnimatedSidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <AnimatedSidebarTrigger />
            <h1 className="font-display text-lg tracking-tight text-foreground sm:text-xl">
              <span className="font-extrabold">{activeTitle.bold}</span>
              {activeTitle.light && (
                <span className="font-normal text-slate-600">
                  {" "}
                  {activeTitle.light}
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {(activeTab === "questions" ||
              activeTab === "errors" ||
              activeTab === "performance") && (
              <div className="mr-1 inline-flex rounded-full border border-border bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("questions")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    activeTab === "questions"
                      ? "bg-slate-900 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Banco de questões
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("errors")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    activeTab === "errors"
                      ? "bg-slate-900 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Caderno de erros ({state.errors.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("performance")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    activeTab === "performance"
                      ? "bg-slate-900 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Desempenho
                </button>
              </div>
            )}

            {pomodoroRunning && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setActiveTab("session")}
              >
                <Timer className="size-3.5 text-primary" />
                <span className="tabular-nums font-bold">
                  {formatClock(secondsLeft)}
                </span>
              </Button>
            )}
            <AnimatedBadge status="success">
              {daysToEnem > 0
                ? `${daysToEnem} dias para o ENEM`
                : "Ciclo ENEM 2027"}
            </AnimatedBadge>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
          {activeTab === "dashboard" && (
            <DashboardHome
              state={state}
              daysToEnem={daysToEnem}
              pomodoroRunning={pomodoroRunning}
              pomodoroClock={formatClock(secondsLeft)}
              onNavigate={setActiveTab}
              onStartSession={handleStartSessionForDay}
              onOpenCourse={handleOpenCourseInRoom}
              onToggleScheduleDay={(dayId) =>
                updateState((p) => ({
                  ...p,
                  schedule: p.schedule.map((d) =>
                    d.id === dayId ? { ...d, done: !d.done } : d,
                  ),
                }))
              }
              onChangeStudyLevel={(level) =>
                updateState((p) => ({ ...p, studyLevel: level }))
              }
              onChangeCycle={(cycleId) =>
                updateState((p) => ({ ...p, currentCycle: cycleId }))
              }
            />
          )}

          {activeTab === "session" && (
            <StudyRoom
              courseId={sessionTopicId}
              topicStatus={state.topicStatus}
              lessonVideos={state.lessonVideos}
              lessonNotes={state.lessonNotes}
              exams={exams}
              mode={pomodoroMode}
              secondsLeft={secondsLeft}
              isRunning={pomodoroRunning}
              completedSessions={state.pomodoroSessions}
              onSelectCourse={setSessionTopicId}
              onChangeStatus={(id, val) =>
                updateState((p) => ({
                  ...p,
                  topicStatus: { ...p.topicStatus, [id]: val },
                }))
              }
              onAddVideo={(cId, video) =>
                updateState((p) => ({
                  ...p,
                  lessonVideos: {
                    ...p.lessonVideos,
                    [cId]: [...(p.lessonVideos[cId] || []), video],
                  },
                }))
              }
              onRemoveVideo={(cId, videoId) =>
                updateState((p) => ({
                  ...p,
                  lessonVideos: {
                    ...p.lessonVideos,
                    [cId]: (p.lessonVideos[cId] || []).filter(
                      (v) => v.id !== videoId,
                    ),
                  },
                }))
              }
              onChangeNote={(cId, note) =>
                updateState((p) => ({
                  ...p,
                  lessonNotes: { ...p.lessonNotes, [cId]: note },
                }))
              }
              onSelectMode={handleSelectPomodoroMode}
              onToggleRun={() => setPomodoroRunning((r) => !r)}
              onReset={() => {
                setPomodoroRunning(false);
                setSecondsLeft(POMODORO_PRESETS[pomodoroMode].minutes * 60);
              }}
              onCompletePomodoro={handleCompletePomodoroNow}
              onSendToErrors={(area, topic, suggestedType, exerciseId) => {
                updateState((p) => ({
                  ...p,
                  errors: [
                    {
                      id: `err-${Date.now()}`,
                      area,
                      topic,
                      type: suggestedType || "Não sabia o conteúdo",
                      lesson: "Registrada a partir da Sala de Aula.",
                      date: new Date().toISOString().slice(0, 10),
                      exerciseId,
                      status: "pending",
                      lastResult: "none",
                    },
                    ...p.errors,
                  ],
                }));
                setActiveTab("errors");
              }}
              onBackToCatalog={() => setActiveTab("math-curriculum")}
            />
          )}

          {activeTab === "schedule" && (
            <ScheduleTab
              weeklyPlan={state.weeklyPlan}
              weeklyTargets={state.weeklyTargets}
              daysToEnem={daysToEnem}
              routineConfig={state.routineConfig}
              scheduleDays={state.schedule}
              onUpdateTargets={(weeklyTargets) =>
                updateState((p) => ({ ...p, weeklyTargets }))
              }
              onUpdateWeeklyPlan={(weeklyPlan) =>
                updateState((p) => ({ ...p, weeklyPlan }))
              }
              onUpdateRoutineConfig={(routineConfig) =>
                updateState((p) => ({
                  ...p,
                  routineConfig,
                  schedule: p.schedule.map((d) => {
                    const hrs = routineConfig.weeklyHoursByDay[d.id];
                    return typeof hrs === "number"
                      ? { ...d, minutes: Math.round(hrs * 60) }
                      : d;
                  }),
                }))
              }
              onToggleScheduleDay={(dayId) =>
                updateState((p) => ({
                  ...p,
                  schedule: p.schedule.map((d) =>
                    d.id === dayId ? { ...d, done: !d.done } : d,
                  ),
                }))
              }
              onStartLesson={(courseId) => {
                if (courseId) setSessionTopicId(courseId);
                setPomodoroMode("focus-25");
                setSecondsLeft(POMODORO_PRESETS["focus-25"].minutes * 60);
                setPomodoroRunning(true);
                setActiveTab("session");
              }}
            />
          )}

          {activeTab === "math-curriculum" && (
            <MathCurriculumTab
              topicStatus={state.topicStatus}
              lessonVideos={state.lessonVideos}
              onChangeStatus={(id, val) =>
                updateState((p) => ({
                  ...p,
                  topicStatus: { ...p.topicStatus, [id]: val },
                }))
              }
              onPracticeQuestions={(searchKeyword) => {
                setQbPreset({ discipline: "matematica", search: searchKeyword });
                setActiveTab("questions");
              }}
              onOpenStudyRoom={handleOpenCourseInRoom}
            />
          )}

          {activeTab === "topics" && (
            <Card className="bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Mapa de Conteúdos</CardTitle>
                <CardDescription>
                  Filtre por ciclo, área ou status e acompanhe sua evolução.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <select
                    value={filterCycle}
                    onChange={(e) => setFilterCycle(e.target.value)}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">Todos os ciclos</option>
                    {CYCLES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">Todas as áreas</option>
                    {AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">Todos os status</option>
                    <option value="todo">A fazer</option>
                    <option value="doing">Estudando</option>
                    <option value="done">Concluído</option>
                  </select>
                  <Input
                    value={filterSearch}
                    onChange={setFilterSearch}
                    placeholder="Buscar tópico..."
                  />
                </div>

                <div className="space-y-2.5">
                  {filteredTopics.map((t) => {
                    const st = state.topicStatus[t.id] || "todo";
                    return (
                      <div
                        key={t.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 p-3.5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-foreground">
                              {t.title}
                            </span>
                            <AnimatedBadge status="neutral">
                              {t.area}
                            </AnimatedBadge>
                          </div>
                          <p className="text-xs text-muted-foreground">{t.sub}</p>
                        </div>

                        <select
                          value={st}
                          onChange={(e) => {
                            const val = e.target.value as TopicStatus;
                            updateState((p) => ({
                              ...p,
                              topicStatus: { ...p.topicStatus, [t.id]: val },
                            }));
                          }}
                          className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-bold"
                        >
                          <option value="todo">A fazer</option>
                          <option value="doing">Estudando</option>
                          <option value="done">Concluído</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "essays" && (
            <RedacaoTab
              essays={state.essays}
              onAddEssay={(entry) =>
                updateState((p) => ({ ...p, essays: [entry, ...p.essays] }))
              }
              onDeleteEssay={(id) =>
                updateState((p) => ({
                  ...p,
                  essays: p.essays.filter((x) => x.id !== id),
                }))
              }
            />
          )}

          {activeTab === "errors" && (
            <ErrorNotebookTab
              errors={state.errors}
              attempts={state.questionAttempts}
              onAddError={(entry) =>
                updateState((p) => ({
                  ...p,
                  errors: [
                    {
                      ...entry,
                      id: `err-${Date.now()}`,
                      date: new Date().toISOString().slice(0, 10),
                    },
                    ...p.errors,
                  ],
                }))
              }
              onUpdateError={(id, patch) =>
                updateState((p) => ({
                  ...p,
                  errors: p.errors.map((e) => (e.id === id ? { ...e, ...patch } : e)),
                }))
              }
              onDeleteError={(id) =>
                updateState((p) => ({
                  ...p,
                  errors: p.errors.filter((e) => e.id !== id),
                }))
              }
            />
          )}

          {activeTab === "questions" && (
            <QuestionBankTab
              exams={exams}
              initialDiscipline={qbPreset.discipline}
              initialSearch={qbPreset.search}
              attempts={state.questionAttempts}
              lists={state.questionLists}
              onRecordAttempt={(attempt) =>
                updateState((p) => ({
                  ...p,
                  questionAttempts: {
                    ...p.questionAttempts,
                    [attempt.questionId]: attempt,
                  },
                }))
              }
              onSaveToErrorNotebook={(entry) =>
                updateState((p) => ({
                  ...p,
                  errors: [
                    {
                      ...entry,
                      id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      date: new Date().toISOString().slice(0, 10),
                    },
                    ...p.errors,
                  ],
                }))
              }
              onUpdateLists={(questionLists) =>
                updateState((p) => ({ ...p, questionLists }))
              }
              onSendToErrors={() => setActiveTab("errors")}
            />
          )}

          {activeTab === "performance" && (
            <PerformanceTab
              attempts={state.questionAttempts}
              errors={state.errors}
              onGoToErrors={() => setActiveTab("errors")}
              onGoToBank={() => setActiveTab("questions")}
            />
          )}

          {activeTab === "simulados" && (
            <SimuladosTab
              dbQuestionCount={dbQuestionCount}
              history={state.simuladoHistory}
              onRecordSimulado={(sim) =>
                updateState((p) => ({
                  ...p,
                  simuladoHistory: [sim, ...p.simuladoHistory],
                  totalMinutes: p.totalMinutes + sim.elapsedMinutes,
                }))
              }
              onRecordAttempt={(attempt) =>
                updateState((p) => ({
                  ...p,
                  questionAttempts: {
                    ...p.questionAttempts,
                    [attempt.questionId]: attempt,
                  },
                }))
              }
              onSaveToErrorNotebook={(entry) =>
                updateState((p) => ({
                  ...p,
                  errors: [
                    {
                      ...entry,
                      id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      date: new Date().toISOString().slice(0, 10),
                    },
                    ...p.errors,
                  ],
                }))
              }
            />
          )}

          {activeTab === "cards" && (
            <CardsTab
              topicStatus={state.topicStatus}
              cardReviews={state.cardReviews}
              onRecordReview={(rev) =>
                updateState((p) => ({
                  ...p,
                  cardReviews: { ...p.cardReviews, [rev.cardId]: rev },
                }))
              }
              onGoToLessons={() => setActiveTab("math-curriculum")}
            />
          )}
        </main>
      </AnimatedSidebarInset>
    </AnimatedSidebarProvider>
  );
}

export default App;
