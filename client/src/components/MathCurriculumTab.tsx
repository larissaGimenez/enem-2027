import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Dna,
  FlaskConical,
  Globe,
  Lock,
  PenTool,
  Play,
  Search,
  Sparkles,
  Video,
} from "lucide-react";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { Button } from "@/components/motion/button";
import { Card, CardContent } from "@/components/motion/card";
import { Input } from "@/components/motion/input";
import { CYCLES } from "@/data/enemData";
import {
  type FoundationSubjectId,
  getFoundationCoursesBySubject,
} from "@/data/foundationCourses";
import {
  getCourseTier,
  MATH_CURRICULUM,
  type CurriculumTier,
  type MathCourseItem,
} from "@/data/mathCurriculum";
import type { LessonVideo, TopicStatus } from "@/types/study";

interface MathCurriculumTabProps {
  topicStatus: Record<string, TopicStatus>;
  lessonVideos: Record<string, LessonVideo[]>;
  onChangeStatus: (id: string, status: TopicStatus) => void;
  onPracticeQuestions: (searchKeyword: string) => void;
  onOpenStudyRoom: (courseId: string) => void;
}

const WEIGHT_BADGE: Record<
  MathCourseItem["enemWeight"],
  { label: string; cls: string }
> = {
  Alta: { label: "Cai muito", cls: "bg-amber-50 text-amber-700" },
  Média: { label: "Cai às vezes", cls: "bg-blue-50 text-blue-700" },
  Base: { label: "Base essencial", cls: "bg-emerald-50 text-emerald-700" },
};

type SubjectKey =
  | "matematica"
  | "biologia"
  | "fisica"
  | "quimica"
  | "linguagens"
  | "humanas"
  | "redacao";

const SUBJECT_CATALOG: Array<{
  id: SubjectKey;
  name: string;
  areaTag: string;
  description: string;
  icon: typeof Calculator;
  iconBg: string;
  barColor: string;
  ready: boolean;
  plannedLessons: number;
}> = [
  {
    id: "matematica",
    name: "Matemática",
    areaTag: "Matemática e suas Tecnologias",
    description:
      "26 aulas completas do zero ao avançado (Core 80% + Diferencial 20%), baseadas nas suas transcrições.",
    icon: Calculator,
    iconBg: "bg-blue-50 text-blue-600",
    barColor: "bg-blue-500",
    ready: true,
    plannedLessons: MATH_CURRICULUM.length,
  },
  {
    id: "biologia",
    name: "Biologia",
    areaTag: "Ciências da Natureza",
    description:
      "Ecologia, Citologia, Genética, Fisiologia Humana e Evolução no modelo ENEM.",
    icon: Dna,
    iconBg: "bg-emerald-50 text-emerald-600",
    barColor: "bg-emerald-500",
    ready: false,
    plannedLessons: 0,
  },
  {
    id: "fisica",
    name: "Física",
    areaTag: "Ciências da Natureza",
    description:
      "Cinemática, Dinâmica, Termologia, Óptica, Ondulatória e Eletrodinâmica.",
    icon: Atom,
    iconBg: "bg-sky-50 text-sky-600",
    barColor: "bg-sky-500",
    ready: false,
    plannedLessons: 0,
  },
  {
    id: "quimica",
    name: "Química",
    areaTag: "Ciências da Natureza",
    description:
      "Atomística, Estequiometria, Físico-Química, Eletroquímica e Química Orgânica.",
    icon: FlaskConical,
    iconBg: "bg-teal-50 text-teal-600",
    barColor: "bg-teal-500",
    ready: false,
    plannedLessons: 0,
  },
  {
    id: "linguagens",
    name: "Linguagens",
    areaTag: "Linguagens, Códigos e suas Tecnologias",
    description:
      "Interpretação de textos, Funções da Linguagem, Gêneros Textuais e Literatura.",
    icon: BookOpen,
    iconBg: "bg-violet-50 text-violet-600",
    barColor: "bg-violet-500",
    ready: false,
    plannedLessons: 0,
  },
  {
    id: "humanas",
    name: "Ciências Humanas",
    areaTag: "História, Geografia, Filosofia e Sociologia",
    description:
      "Brasil Colônia a República, Geopolítica, Clima, Filosofia Moderna e Sociologia.",
    icon: Globe,
    iconBg: "bg-amber-50 text-amber-600",
    barColor: "bg-amber-500",
    ready: false,
    plannedLessons: 0,
  },
  {
    id: "redacao",
    name: "Redação",
    areaTag: "Produção Textual ENEM",
    description:
      "Estrutura dissertativa-argumentativa, Competências 1 a 5, repertórios e proposta de intervenção.",
    icon: PenTool,
    iconBg: "bg-rose-50 text-rose-600",
    barColor: "bg-rose-500",
    ready: false,
    plannedLessons: 0,
  },
];

export function MathCurriculumTab({
  topicStatus,
  lessonVideos,
  onChangeStatus,
  onPracticeQuestions,
  onOpenStudyRoom,
}: MathCurriculumTabProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | null>(null);
  const [tierFilter, setTierFilter] = useState<"all" | CurriculumTier>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TopicStatus>("all");
  const [search, setSearch] = useState("");
  const [openCycles, setOpenCycles] = useState<Record<string, boolean>>({
    "ciclo-1": true,
    "ciclo-2": true,
    "ciclo-3": false,
    "ciclo-4": false,
  });

  const codeToStatus = useMemo(() => {
    const map = new Map<string, TopicStatus>();
    for (const c of MATH_CURRICULUM) {
      map.set(c.code, topicStatus[c.id] || "todo");
    }
    return map;
  }, [topicStatus]);

  const stats = useMemo(() => {
    const total = MATH_CURRICULUM.length;
    const done = MATH_CURRICULUM.filter(
      (c) => (topicStatus[c.id] || "todo") === "done",
    ).length;
    const totalVideos = Object.values(lessonVideos).reduce(
      (acc, list) => acc + list.length,
      0,
    );
    const totalHours = MATH_CURRICULUM.reduce((acc, c) => acc + c.estimatedHours, 0);
    const pct = Math.round((done / total) * 100);
    return { total, done, totalVideos, totalHours, pct };
  }, [topicStatus, lessonVideos]);

  const resumeCourse = useMemo(() => {
    return (
      MATH_CURRICULUM.find((c) => topicStatus[c.id] === "doing") ||
      MATH_CURRICULUM.find((c) => topicStatus[c.id] !== "done") ||
      MATH_CURRICULUM[0]
    );
  }, [topicStatus]);

  function isUnlocked(course: MathCourseItem) {
    return course.prerequisites.every(
      (reqCode) => codeToStatus.get(reqCode) === "done",
    );
  }

  function toggleCycle(cycleId: string) {
    setOpenCycles((prev) => ({ ...prev, [cycleId]: !prev[cycleId] }));
  }

  const term = search.trim().toLowerCase();

  // 1. ÍNDICE PRINCIPAL DE MATÉRIAS (Catálogo de Aulas)
  if (selectedSubject === null) {
    return (
      <div className="space-y-6">
        {/* Card de destaque "De onde você parou" */}
        <Card className="rounded-2xl border-emerald-200/80 bg-white shadow-none">
          <CardContent className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                  <Sparkles className="size-3.5" />
                  De onde você parou
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Matemática • {resumeCourse.code}
                </span>
              </div>
              <h2 className="font-display text-xl font-extrabold text-foreground">
                {resumeCourse.title}
              </h2>
              <p className="max-w-2xl text-xs text-muted-foreground">
                {resumeCourse.syllabus}
              </p>
            </div>

            <Button
              className="shrink-0 rounded-full px-5"
              onClick={() => onOpenStudyRoom(resumeCourse.id)}
            >
              <Play className="size-4 fill-current" />
              Continuar aula
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Grid de todas as matérias do curso */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-extrabold text-foreground">
                Matérias do curso
              </h3>
              <p className="text-xs text-muted-foreground">
                Escolha uma matéria para acessar as aulas, teoria e indexar seus vídeos do YouTube.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECT_CATALOG.map((subj) => {
              const Icon = subj.icon;
              const isMath = subj.id === "matematica";
              const isRed = subj.id === "redacao";
              const foundationList =
                !isMath && !isRed
                  ? getFoundationCoursesBySubject(subj.id as FoundationSubjectId)
                  : [];
              const totalCount = isMath ? stats.total : foundationList.length;
              const doneCount = isMath
                ? stats.done
                : foundationList.filter((c) => topicStatus[c.id] === "done")
                    .length;
              const pct =
                totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSelectedSubject(subj.id)}
                  className="group flex flex-col justify-between gap-4 rounded-2xl border border-border bg-white p-5 text-left transition-all hover:border-emerald-300 hover:shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`flex size-11 items-center justify-center rounded-2xl ${subj.iconBg}`}
                      >
                        <Icon className="size-5" />
                      </div>
                      {isMath ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          {stats.total} aulas prontas
                        </span>
                      ) : totalCount > 0 ? (
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-primary">
                          Módulo 0 • {totalCount} aulas base
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          Prática na aba Redação
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        {subj.areaTag}
                      </p>
                      <h4 className="mt-0.5 font-display text-lg font-extrabold text-foreground group-hover:text-primary">
                        {subj.name}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {subj.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">
                        {totalCount > 0
                          ? `${doneCount}/${totalCount} concluídas`
                          : "Use a aba Redação no menu"}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-primary">
                        {totalCount > 0 ? `${pct}%` : "Abrir"}
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${subj.barColor} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. OUTRAS MATÉRIAS (Módulo 0: O Básico do Básico)
  if (selectedSubject !== "matematica") {
    const subj =
      SUBJECT_CATALOG.find((s) => s.id === selectedSubject) || SUBJECT_CATALOG[1];
    const Icon = subj.icon;
    const foundationCourses =
      selectedSubject !== "redacao"
        ? getFoundationCoursesBySubject(selectedSubject as FoundationSubjectId)
        : [];
    const doneFoundation = foundationCourses.filter(
      (c) => topicStatus[c.id] === "done",
    ).length;

    return (
      <div className="space-y-5">
        <Button
          size="sm"
          variant="secondary"
          className="rounded-full"
          onClick={() => setSelectedSubject(null)}
        >
          <ArrowLeft className="size-4" />
          Voltar para todas as matérias
        </Button>

        <Card className="rounded-2xl border-border bg-white shadow-none">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${subj.iconBg}`}
              >
                <Icon className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary">
                  {subj.areaTag}
                </p>
                <h2 className="font-display text-xl font-extrabold text-foreground">
                  {subj.name} — Módulo 0 (Do Zero Absoluto)
                </h2>
                <p className="text-xs text-muted-foreground">
                  {foundationCourses.length > 0
                    ? `${doneFoundation}/${foundationCourses.length} aulas base concluídas • Você pode adicionar seus vídeos do YouTube em cada aula!`
                    : subj.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {foundationCourses.length > 0 ? (
          <Card className="overflow-hidden rounded-2xl border-border bg-white shadow-none">
            <div className="divide-y divide-border">
              {foundationCourses.map((course) => {
                const status = topicStatus[course.id] || "todo";
                const videos = lessonVideos[course.id] || [];
                return (
                  <div
                    key={course.id}
                    className="flex flex-col justify-between gap-3 px-5 py-4 transition-colors hover:bg-emerald-50/25 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          onChangeStatus(
                            course.id,
                            status === "done" ? "todo" : "done",
                          )
                        }
                        className="mt-0.5 shrink-0 text-slate-300 transition-colors hover:text-primary"
                      >
                        {status === "done" ? (
                          <CheckCircle2 className="size-5 text-primary" />
                        ) : (
                          <Circle className="size-5" />
                        )}
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-primary">
                            {course.code}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Básico do Básico
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenStudyRoom(course.id)}
                          className="block text-left font-display text-sm font-bold text-foreground hover:text-primary"
                        >
                          {course.title}
                        </button>
                        <p className="text-xs text-muted-foreground">
                          {course.axis} • {course.estimatedHours}h •{" "}
                          {course.syllabus}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 pl-8 sm:pl-0">
                      {videos.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <Video className="size-3" />
                          {videos.length}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant={status === "done" ? "secondary" : "primary"}
                        className="rounded-full"
                        onClick={() => onOpenStudyRoom(course.id)}
                      >
                        <Play className="size-3.5 fill-current" />
                        Abrir aula
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card className="rounded-2xl border-border bg-white shadow-none">
            <CardContent className="py-10 text-center text-xs text-muted-foreground">
              Para praticar Redação (ENEM e Unicamp COMVEST), acesse a aba <strong>Redação</strong> no menu lateral!
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // 3. GRADE COMPLETA DE MATEMÁTICA
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="secondary"
          className="rounded-full"
          onClick={() => setSelectedSubject(null)}
        >
          <ArrowLeft className="size-4" />
          Todas as matérias
        </Button>
      </div>

      {/* Banner "De onde você parou" + Resumo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="rounded-2xl border-emerald-200/80 bg-white shadow-none lg:col-span-8">
          <CardContent className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                  <Calculator className="size-3.5" />
                  De onde você parou
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {resumeCourse.code} • {resumeCourse.axis}
                </span>
              </div>
              <h2 className="font-display text-xl font-extrabold text-foreground">
                {resumeCourse.title}
              </h2>
              <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                {resumeCourse.syllabus}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
              <Button
                className="rounded-full px-5"
                onClick={() => onOpenStudyRoom(resumeCourse.id)}
              >
                <Play className="size-4 fill-current" />
                Continuar aula
                <ArrowRight className="size-4" />
              </Button>
              <button
                type="button"
                onClick={() => onPracticeQuestions(resumeCourse.searchKeyword)}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                <BookOpen className="size-3.5" />
                Praticar questões no banco
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-obsidian rounded-2xl border-0 shadow-none lg:col-span-4">
          <CardContent className="flex h-full flex-col justify-between gap-3 p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Matemática ENEM
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white tabular-nums">
                {stats.pct}%
              </span>
            </div>
            <div>
              <p className="font-display text-3xl font-extrabold tabular-nums text-white">
                {stats.done}/{stats.total} aulas
              </p>
              <p className="mt-1 text-xs text-slate-300">
                {stats.totalHours}h estimadas • {stats.totalVideos} vídeo(s) do YouTube indexados
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${Math.max(stats.pct, 3)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros */}
      <Card className="rounded-2xl border-border bg-white shadow-none">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full bg-muted p-1">
              {(
                [
                  { id: "all", label: "Todas (26)" },
                  { id: "Core", label: "Core (80%)" },
                  { id: "Diferencial", label: "Diferencial (20%)" },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setTierFilter(pill.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    tierFilter === pill.id
                      ? "bg-slate-900 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <select
              aria-label="Filtrar por status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | TopicStatus)}
              className="h-8 rounded-full border border-border bg-white px-3 text-xs font-semibold text-foreground"
            >
              <option value="all">Todos os status</option>
              <option value="todo">A fazer</option>
              <option value="doing">Em andamento</option>
              <option value="done">Concluídas</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={setSearch}
              placeholder="Buscar aula (ex.: Porcentagem, Funções)..."
              className="h-9 rounded-full pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sumário em Acordeão por Ciclos */}
      <div className="space-y-3">
        {CYCLES.map((cycle) => {
          const cycleCourses = MATH_CURRICULUM.filter((c) => c.period === cycle.id);
          const visibleCourses = cycleCourses.filter((c) => {
            const st = topicStatus[c.id] || "todo";
            if (tierFilter !== "all" && getCourseTier(c.code) !== tierFilter) {
              return false;
            }
            if (statusFilter !== "all" && st !== statusFilter) {
              return false;
            }
            if (
              term &&
              !c.title.toLowerCase().includes(term) &&
              !c.syllabus.toLowerCase().includes(term) &&
              !c.axis.toLowerCase().includes(term)
            ) {
              return false;
            }
            return true;
          });

          if (visibleCourses.length === 0) return null;

          const cycleDone = cycleCourses.filter(
            (c) => topicStatus[c.id] === "done",
          ).length;
          const cyclePct = Math.round((cycleDone / cycleCourses.length) * 100);
          const isOpen = term.length > 0 ? true : Boolean(openCycles[cycle.id]);

          return (
            <Card
              key={cycle.id}
              className="overflow-hidden rounded-2xl border-border bg-white shadow-none"
            >
              {/* Cabeçalho do Módulo / Ciclo */}
              <button
                type="button"
                onClick={() => toggleCycle(cycle.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    {isOpen ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-foreground">
                        {cycle.name}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground">
                        • {cycle.period}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {cycle.goal}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${cyclePct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold tabular-nums text-muted-foreground">
                      {cycleDone}/{cycleCourses.length}
                    </span>
                  </div>
                </div>
              </button>

              {/* Lista de Aulas do Módulo */}
              {isOpen && (
                <div className="divide-y divide-border border-t border-border">
                  {visibleCourses.map((course) => {
                    const status = topicStatus[course.id] || "todo";
                    const unlocked = isUnlocked(course);
                    const videos = lessonVideos[course.id] || [];
                    const tier = getCourseTier(course.code);
                    const weightMeta = WEIGHT_BADGE[course.enemWeight];

                    return (
                      <div
                        key={course.id}
                        className="flex flex-col justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-emerald-50/25 sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              onChangeStatus(
                                course.id,
                                status === "done" ? "todo" : "done",
                              )
                            }
                            className="mt-0.5 shrink-0 text-slate-300 transition-colors hover:text-primary"
                            title={
                              status === "done"
                                ? "Marcar como pendente"
                                : "Marcar aula como concluída"
                            }
                          >
                            {status === "done" ? (
                              <CheckCircle2 className="size-5 text-primary" />
                            ) : (
                              <Circle className="size-5" />
                            )}
                          </button>

                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-primary">
                                {course.code}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${weightMeta.cls}`}
                              >
                                {weightMeta.label}
                              </span>
                              {tier === "Diferencial" && (
                                <AnimatedBadge status="warning" size="sm">
                                  Diferencial 20%
                                </AnimatedBadge>
                              )}
                              {!unlocked && (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                                  title={`Pré-requisitos: ${course.prerequisites.join(", ")}`}
                                >
                                  <Lock className="size-2.5" />
                                  Req: {course.prerequisites.join(", ")}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenStudyRoom(course.id)}
                              className={`block text-left font-display text-sm font-bold text-foreground transition-colors hover:text-primary ${
                                status === "done" ? "opacity-70" : ""
                              }`}
                            >
                              {course.title}
                            </button>

                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {course.axis} • <Clock className="inline size-3" />{" "}
                              {course.estimatedHours}h • {course.syllabus}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 pl-8 sm:pl-0">
                          {videos.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              <Video className="size-3" />
                              {videos.length} {videos.length === 1 ? "vídeo" : "vídeos"}
                            </span>
                          )}

                          <Button
                            size="sm"
                            variant={status === "done" ? "secondary" : "primary"}
                            className="rounded-full"
                            onClick={() => onOpenStudyRoom(course.id)}
                          >
                            <Play className="size-3.5 fill-current" />
                            {videos.length > 0 ? "Assistir" : "Abrir aula"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
