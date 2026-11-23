import { useMemo, useState } from "react";
import {
  Atom,
  BookText,
  Check,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Dna,
  FlaskConical,
  Globe,
  Percent,
  Play,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { RoutineWizardModal } from "@/components/RoutineWizardModal";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Button } from "@/components/motion/button";
import { Card, CardContent } from "@/components/motion/card";
import { Input } from "@/components/motion/input";
import {
  SortableListGroup,
  SortableListHandle,
  SortableListItem,
  SortableListItemContent,
  SortableListUndo,
  SortableStack,
} from "@/components/motion/sortable-stack";
import { MATH_CURRICULUM } from "@/data/mathCurriculum";
import type {
  RoutineConfig,
  ScheduleDay,
  SubjectArea,
  WeeklyPlanItem,
} from "@/types/study";

interface ScheduleTabProps {
  weeklyPlan: WeeklyPlanItem[];
  weeklyTargets: string[];
  daysToEnem?: number;
  routineConfig?: RoutineConfig;
  scheduleDays?: ScheduleDay[];
  onUpdateTargets: (targets: string[]) => void;
  onUpdateWeeklyPlan: (nextPlan: WeeklyPlanItem[]) => void;
  onUpdateRoutineConfig?: (cfg: RoutineConfig) => void;
  onToggleScheduleDay?: (dayId: string) => void;
  onStartLesson: (courseId?: string) => void;
}

const AREA_META: Record<
  SubjectArea,
  { bg: string; text: string; icon: typeof Percent }
> = {
  Matemática: { bg: "bg-indigo-600", text: "text-indigo-700", icon: Percent },
  Biologia: { bg: "bg-emerald-500", text: "text-emerald-700", icon: Dna },
  Física: { bg: "bg-sky-500", text: "text-sky-700", icon: Atom },
  Química: { bg: "bg-teal-600", text: "text-teal-700", icon: FlaskConical },
  Linguagens: { bg: "bg-rose-500", text: "text-rose-700", icon: BookText },
  Humanas: { bg: "bg-amber-500", text: "text-amber-700", icon: Globe },
  Redação: { bg: "bg-violet-600", text: "text-violet-700", icon: BookText },
};

const IMPORTANCE_CLASS = {
  Alta: "bg-orange-400 text-white",
  Média: "bg-amber-400 text-amber-950",
  Base: "bg-slate-200 text-slate-800",
} as const;

export function ScheduleTab({
  weeklyPlan,
  weeklyTargets,
  daysToEnem = 350,
  routineConfig,
  scheduleDays = [],
  onUpdateTargets,
  onUpdateWeeklyPlan,
  onUpdateRoutineConfig,
  onToggleScheduleDay,
  onStartLesson,
}: ScheduleTabProps) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [newTarget, setNewTarget] = useState("");
  const [addingRow, setAddingRow] = useState(false);
  const [draftArea, setDraftArea] = useState<SubjectArea>("Matemática");
  const [draftCourseId, setDraftCourseId] = useState("m1-0");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftImportance, setDraftImportance] = useState<
    "Alta" | "Média" | "Base"
  >("Alta");

  const maxWeek = useMemo(
    () => Math.max(4, ...weeklyPlan.map((i) => i.week)),
    [weeklyPlan],
  );

  const weekItems = useMemo(
    () => weeklyPlan.filter((i) => i.week === selectedWeek),
    [weeklyPlan, selectedWeek],
  );

  const weekCompleted =
    weekItems.length > 0 && weekItems.every((i) => i.aulaDone);

  // Conclusão geral do cronograma (considerando AULA + REV 1 + REV 2)
  const overallProgress = useMemo(() => {
    if (weeklyPlan.length === 0) return 0;
    const totalChecks = weeklyPlan.length * 3;
    const doneChecks = weeklyPlan.reduce(
      (acc, i) =>
        acc + (i.aulaDone ? 1 : 0) + (i.rev1Done ? 1 : 0) + (i.rev2Done ? 1 : 0),
      0,
    );
    return Math.round((doneChecks / totalChecks) * 100);
  }, [weeklyPlan]);

  function updateItem(id: string, patch: Partial<WeeklyPlanItem>) {
    onUpdateWeeklyPlan(
      weeklyPlan.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function handleReorderWeek(reorderedWeekItems: WeeklyPlanItem[]) {
    const others = weeklyPlan.filter((i) => i.week !== selectedWeek);
    onUpdateWeeklyPlan([...others, ...reorderedWeekItems]);
  }

  function handleAddRow(e: React.FormEvent) {
    e.preventDefault();
    const chosenCourse =
      draftArea === "Matemática"
        ? MATH_CURRICULUM.find((c) => c.id === draftCourseId)
        : undefined;
    const finalTitle = draftTitle.trim() || chosenCourse?.title || "";
    if (!finalTitle) return;

    const countSameArea =
      weekItems.filter((i) => i.area === draftArea).length + 1;
    const newItem: WeeklyPlanItem = {
      id: `w${selectedWeek}-${Date.now()}`,
      week: selectedWeek,
      subjectLabel: `${draftArea.toUpperCase()} ${countSameArea}`,
      area: draftArea,
      title: finalTitle,
      importance: draftImportance,
      courseId: chosenCourse?.id,
      aulaDone: false,
      rev1Done: false,
      rev2Done: false,
      questionsDone: 0,
      questionsCorrect: 0,
    };

    onUpdateWeeklyPlan([...weeklyPlan, newItem]);
    setDraftTitle("");
    setAddingRow(false);
  }

  const nextPendingItem = useMemo(
    () => weeklyPlan.find((i) => !i.aulaDone) || weeklyPlan[0],
    [weeklyPlan],
  );
  const doneTodayCount = scheduleDays.filter((d) => d.done).length;

  return (
    <div className="space-y-5">
      {/* Banner Verde Esmeralda "Sua rotina" */}
      <div className="surface-emerald-hero rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-100">
              <span>
                {routineConfig?.dreamCourse
                  ? `Meta: ${routineConfig.dreamCourse}${
                      routineConfig.university ? ` • ${routineConfig.university}` : ""
                    }`
                  : "Organização semanal de estudos"}
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white">
                Alvo: ~755+ ENEM • ~56/72 COMVEST
              </span>
            </div>
            <h2 className="mt-0.5 font-display text-2xl font-extrabold text-white">
              Sua rotina
            </h2>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="rounded-full bg-white text-emerald-900 hover:bg-emerald-50"
            onClick={() => setWizardOpen(true)}
          >
            <Sparkles className="size-3.5" />
            Montar cronograma
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-xs md:col-span-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                Próxima atividade
              </p>
              <p className="mt-0.5 font-display text-base font-bold text-white">
                {nextPendingItem
                  ? `${nextPendingItem.subjectLabel}: ${nextPendingItem.title}`
                  : "Semana concluída!"}
              </p>
            </div>
            {nextPendingItem && (
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full bg-white text-emerald-900 hover:bg-emerald-50"
                onClick={() => onStartLesson(nextPendingItem.courseId)}
              >
                <Play className="size-3.5 fill-current" />
                Iniciar agora
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:col-span-4">
            <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-xs">
              <p className="font-display text-2xl font-extrabold tabular-nums text-white">
                {doneTodayCount}/{Math.max(1, scheduleDays.length)}
              </p>
              <p className="text-[11px] text-emerald-100">blocos da semana</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-xs">
              <p className="font-display text-2xl font-extrabold tabular-nums text-white">
                {daysToEnem > 0 ? daysToEnem : 350}
              </p>
              <p className="text-[11px] text-emerald-100">dias p/ o ENEM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dias da semana (Agenda rápida) */}
      {scheduleDays.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {scheduleDays.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => onToggleScheduleDay?.(day.id)}
              className={`rounded-2xl border p-3 text-left transition-all ${
                day.done
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-border bg-white hover:border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">{day.day}</span>
                <span
                  className={`size-2 rounded-full ${
                    day.done ? "bg-primary" : "bg-slate-200"
                  }`}
                />
              </div>
              <p
                className={`mt-1 line-clamp-2 text-xs font-semibold ${
                  day.done
                    ? "text-emerald-800 line-through"
                    : "text-slate-700"
                }`}
              >
                {day.subject}
              </p>
              <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                {day.minutes} min
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Cabeçalho estilo Cronograma Dominando ENEM */}
      <Card className="bg-card shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-3">
            <AnimatedBadge status={weekCompleted ? "success" : "warning"}>
              {weekCompleted ? "Semana Concluída" : "Semana Pendente"}
            </AnimatedBadge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Semana anterior"
              disabled={selectedWeek <= 1}
              onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Planejamento
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                SEMANA {selectedWeek}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Próxima semana"
              onClick={() => setSelectedWeek((w) => Math.min(maxWeek + 1, w + 1))}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>

          <div className="min-w-[200px] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>Conclusão do cronograma</span>
              <span className="text-emerald-600">
                <AnimatedNumber value={overallProgress} />%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alvos de Ataque da Semana */}
      <div className="rounded-2xl border border-indigo-200 bg-secondary/40 p-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-foreground">
            <Crosshair className="size-4 text-primary" />
            Alvos de Ataque da Semana (1–2 matérias fortes/dia)
          </h3>
          <div className="flex items-center gap-2">
            <AnimatedBadge status="info" size="sm">
              {weeklyTargets.length}/4
            </AnimatedBadge>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setAddingRow((v) => !v)}
            >
              <Plus className="size-3.5" />
              Adicionar tema na Semana {selectedWeek}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {weeklyTargets.map((target, idx) => (
            <span
              key={`${target}-${idx}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-card px-3 py-1 text-xs font-bold text-foreground"
            >
              {target}
              <button
                type="button"
                aria-label={`Remover alvo ${target}`}
                onClick={() =>
                  onUpdateTargets(weeklyTargets.filter((_, i) => i !== idx))
                }
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          {weeklyTargets.length < 4 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = newTarget.trim();
                if (!val) return;
                onUpdateTargets([...weeklyTargets, val]);
                setNewTarget("");
              }}
              className="flex items-center gap-1.5"
            >
              <Input
                value={newTarget}
                onChange={setNewTarget}
                placeholder="Novo alvo da semana..."
                className="h-8 w-48 text-xs"
              />
              <Button type="submit" size="sm">
                <Plus className="size-3.5" />
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Formulário rápido para adicionar tema na semana */}
      {addingRow && (
        <Card className="border-primary/30 bg-card shadow-sm">
          <CardContent className="py-4">
            <form
              onSubmit={handleAddRow}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
            >
              <select
                value={draftArea}
                onChange={(e) => setDraftArea(e.target.value as SubjectArea)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold"
              >
                {(Object.keys(AREA_META) as SubjectArea[]).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              {draftArea === "Matemática" ? (
                <select
                  value={draftCourseId}
                  onChange={(e) => setDraftCourseId(e.target.value)}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold lg:col-span-2"
                >
                  {MATH_CURRICULUM.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  value={draftTitle}
                  onChange={setDraftTitle}
                  placeholder="Título do tema..."
                  className="lg:col-span-2"
                />
              )}

              <select
                value={draftImportance}
                onChange={(e) =>
                  setDraftImportance(
                    e.target.value as "Alta" | "Média" | "Base",
                  )
                }
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold"
              >
                <option value="Alta">Importância: Alta</option>
                <option value="Média">Importância: Média</option>
                <option value="Base">Importância: Base</option>
              </select>

              <Button type="submit">Salvar Tema</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabela / Pílulas da Semana com AULAS, IMPORTÂNCIA, AULA, REV 1, REV 2 e QUESTÕES */}
      <Card className="bg-card shadow-sm">
        <CardContent className="py-5">
          {/* Cabeçalho das colunas (desktop) */}
          <div className="mb-3 hidden grid-cols-[24px_1fr_64px_92px_48px_48px_48px_124px_32px] items-center gap-2 px-3 text-center text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground lg:grid">
            <span />
            <span className="text-left">Tema da Semana</span>
            <span>Aulas</span>
            <span>Importância</span>
            <span>Aula</span>
            <span>Rev 1</span>
            <span>Rev 2</span>
            <span>Questões F / C</span>
            <span />
          </div>

          {weekItems.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nenhum tema cadastrado na Semana {selectedWeek}. Clique em
              &ldquo;Adicionar tema&rdquo; acima para montar esta semana.
            </div>
          ) : (
            <SortableStack
              items={weekItems}
              getItemLabel={(item) => `${item.subjectLabel} — ${item.title}`}
              onItemsChange={handleReorderWeek}
              label={`Temas da Semana ${selectedWeek}`}
              className="w-full max-w-none space-y-2.5"
            >
              <div className="flex justify-end">
                <SortableListUndo />
              </div>

              <SortableListGroup className="w-full space-y-2.5">
                {weekItems.map((item) => {
                  const meta = AREA_META[item.area] || AREA_META.Matemática;
                  const AreaIcon = meta.icon;
                  const accuracy =
                    item.questionsDone > 0
                      ? Math.round(
                          (item.questionsCorrect / item.questionsDone) * 100,
                        )
                      : null;

                  return (
                    <SortableListItem
                      key={item.id}
                      id={item.id}
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 transition-colors hover:border-emerald-300"
                    >
                      <SortableListItemContent className="grid w-full grid-cols-1 items-center gap-3 lg:grid-cols-[24px_minmax(0,1fr)_64px_92px_48px_48px_48px_124px_32px] lg:gap-2">
                        <div className="flex items-center">
                          <SortableListHandle />
                        </div>

                        {/* Ícone + Matéria + Título */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${meta.bg}`}
                          >
                            <AreaIcon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-[11px] font-extrabold uppercase tracking-wide ${meta.text}`}
                            >
                              {item.subjectLabel}
                            </p>
                            <p className="truncate text-sm font-semibold text-foreground">
                              {item.title}
                            </p>
                          </div>
                        </div>

                        {/* Botão Play (Aulas -> Sala de Aula) */}
                        <div className="flex items-center justify-start lg:justify-center">
                          <button
                            type="button"
                            title="Abrir na Sala de Aula"
                            aria-label={`Iniciar aula de ${item.title}`}
                            onClick={() => onStartLesson(item.courseId)}
                            className="flex size-8 items-center justify-center rounded-full bg-red-500 text-white shadow-xs transition-transform hover:scale-105 hover:bg-red-600 active:scale-95"
                          >
                            <Play className="ml-0.5 size-3.5 fill-current" />
                          </button>
                        </div>

                        {/* Importância */}
                        <div className="flex items-center lg:justify-center">
                          <span
                            className={`inline-flex min-w-[72px] items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${IMPORTANCE_CLASS[item.importance]}`}
                          >
                            {item.importance}
                          </span>
                        </div>

                        {/* Checks circulares: AULA, REV 1, REV 2 */}
                        {(
                          [
                            { key: "aulaDone", label: "Aula" },
                            { key: "rev1Done", label: "Rev 1" },
                            { key: "rev2Done", label: "Rev 2" },
                          ] as const
                        ).map(({ key, label }) => {
                          const checked = item[key];
                          return (
                            <div
                              key={key}
                              className="flex items-center gap-2 lg:justify-center"
                            >
                              <span className="text-xs font-bold text-muted-foreground lg:hidden">
                                {label}:
                              </span>
                              <button
                                type="button"
                                aria-label={`Marcar ${label} de ${item.title}`}
                                aria-pressed={checked}
                                onClick={() =>
                                  updateItem(item.id, { [key]: !checked })
                                }
                                className={`flex size-7 items-center justify-center rounded-full border-2 transition-colors ${
                                  checked
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-slate-300 bg-card text-transparent hover:border-primary"
                                }`}
                              >
                                <Check className="size-4 stroke-[3]" />
                              </button>
                            </div>
                          );
                        })}

                        {/* Questões Feitas / Certas */}
                        <div className="flex items-center justify-start gap-1 rounded-full border border-input bg-card px-2 py-1 lg:justify-center">
                          <input
                            type="number"
                            min={0}
                            max={999}
                            aria-label={`Questões feitas de ${item.title}`}
                            value={item.questionsDone}
                            onChange={(e) =>
                              updateItem(item.id, {
                                questionsDone: Math.max(
                                  0,
                                  Number(e.target.value) || 0,
                                ),
                              })
                            }
                            className="w-10 bg-transparent text-center text-xs font-bold text-foreground outline-none"
                          />
                          <span className="text-xs font-bold text-muted-foreground">
                            /
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={999}
                            aria-label={`Questões certas de ${item.title}`}
                            value={item.questionsCorrect}
                            onChange={(e) =>
                              updateItem(item.id, {
                                questionsCorrect: Math.max(
                                  0,
                                  Number(e.target.value) || 0,
                                ),
                              })
                            }
                            className="w-10 bg-transparent text-center text-xs font-bold text-emerald-700 outline-none"
                          />
                          {accuracy !== null && (
                            <span className="hidden text-[10px] font-bold text-muted-foreground xl:inline">
                              {accuracy}%
                            </span>
                          )}
                        </div>

                        {/* Remover item */}
                        <div className="flex items-center justify-end lg:justify-center">
                          <button
                            type="button"
                            aria-label={`Remover ${item.title}`}
                            onClick={() =>
                              onUpdateWeeklyPlan(
                                weeklyPlan.filter((x) => x.id !== item.id),
                              )
                            }
                            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </SortableListItemContent>
                    </SortableListItem>
                  );
                })}
              </SortableListGroup>
            </SortableStack>
          )}
        </CardContent>
      </Card>

      {routineConfig && onUpdateRoutineConfig && (
        <RoutineWizardModal
          open={wizardOpen}
          daysToEnem={daysToEnem}
          initialConfig={routineConfig}
          onClose={() => setWizardOpen(false)}
          onApply={onUpdateRoutineConfig}
        />
      )}
    </div>
  );
}
