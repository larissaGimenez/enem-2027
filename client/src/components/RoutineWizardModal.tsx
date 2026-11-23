import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/motion/button";
import type { RoutineConfig } from "@/types/study";

interface RoutineWizardModalProps {
  open: boolean;
  daysToEnem: number;
  initialConfig: RoutineConfig;
  onClose: () => void;
  onApply: (config: RoutineConfig) => void;
}

const DAYS = [
  { id: "seg", label: "SEG" },
  { id: "ter", label: "TER" },
  { id: "qua", label: "QUA" },
  { id: "qui", label: "QUI" },
  { id: "sex", label: "SEX" },
  { id: "sab", label: "SÁB" },
  { id: "dom", label: "DOM" },
];

export function RoutineWizardModal({
  open,
  daysToEnem,
  initialConfig,
  onClose,
  onApply,
}: RoutineWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dreamCourse, setDreamCourse] = useState(initialConfig.dreamCourse);
  const [university, setUniversity] = useState(initialConfig.university);
  const [pace, setPace] = useState<RoutineConfig["pace"]>(initialConfig.pace);
  const [hoursByDay, setHoursByDay] = useState<Record<string, number>>(
    initialConfig.weeklyHoursByDay,
  );

  const totalWeeklyHours = useMemo(() => {
    const raw = DAYS.reduce((acc, d) => acc + (hoursByDay[d.id] || 0), 0);
    const factor = pace === "leve" ? 0.65 : pace === "equilibrado" ? 0.85 : 1;
    return Math.round(raw * factor);
  }, [hoursByDay, pace]);

  const maxDayHours = Math.max(
    1,
    ...DAYS.map((d) => hoursByDay[d.id] || 0),
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-white shadow-2xl">
        {/* Topo */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Passo {step} de 3
            </p>
            <h2 className="font-display text-lg font-extrabold text-foreground">
              Montar cronograma personalizado
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Corpo 2 colunas: Formulário à esquerda + Prévia Obsidian à direita */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-12">
          <div className="space-y-5 md:col-span-7">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Aonde você quer chegar?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Defina seu objetivo e o ritmo que consegue manter com constância.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">
                      Curso dos sonhos
                    </label>
                    <input
                      type="text"
                      value={dreamCourse}
                      onChange={(e) => setDreamCourse(e.target.value)}
                      placeholder="Ex.: Medicina, Direito..."
                      className="h-10 w-full rounded-xl border border-border bg-muted/20 px-3 text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">
                      Universidade (opcional)
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="Ex.: USP, UFRJ, UFMG..."
                      className="h-10 w-full rounded-xl border border-border bg-muted/20 px-3 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">
                    Que ritmo você consegue manter?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        {
                          id: "leve",
                          title: "Leve",
                          desc: "65% do tempo livre. Sobra respiro.",
                        },
                        {
                          id: "equilibrado",
                          title: "Equilibrado",
                          desc: "85% dos horários. Constância.",
                        },
                        {
                          id: "intenso",
                          title: "Intenso",
                          desc: "100% do horário livre.",
                        },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPace(opt.id)}
                        className={`rounded-2xl border p-3 text-left transition-all ${
                          pace === opt.id
                            ? "border-primary bg-emerald-50/50"
                            : "border-border bg-white hover:bg-muted/30"
                        }`}
                      >
                        <p className="text-xs font-bold text-foreground">
                          {opt.title}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Quantas horas por dia você tem livres?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ajuste cada dia da semana (0h = dia de descanso).
                  </p>
                </div>

                <div className="space-y-2.5">
                  {DAYS.map((d) => {
                    const hrs = hoursByDay[d.id] || 0;
                    return (
                      <div
                        key={d.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3.5 py-2"
                      >
                        <span className="w-10 text-xs font-bold text-foreground">
                          {d.label}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={6}
                          step={0.5}
                          value={hrs}
                          onChange={(e) =>
                            setHoursByDay((prev) => ({
                              ...prev,
                              [d.id]: Number(e.target.value),
                            }))
                          }
                          className="flex-1 accent-emerald-600"
                        />
                        <span className="w-12 text-right text-xs font-bold tabular-nums text-primary">
                          {hrs}h
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Tudo pronto para atualizar sua rotina!
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ao confirmar, seus blocos diários serão ajustados para{" "}
                    <strong className="text-foreground">
                      {totalWeeklyHours}h semanais
                    </strong>{" "}
                    no ritmo{" "}
                    <strong className="text-foreground">{pace}</strong>.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs text-emerald-900 space-y-1.5">
                  <p className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="size-4 text-primary" />
                    Distribuição automática ativada
                  </p>
                  <p>
                    Priorizamos Matemática, Biologia e Química no início da semana, mantendo revisões espaçadas e Redação semanal.
                  </p>
                </div>
              </div>
            )}

            {/* Navegação do Wizard */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                disabled={step === 1}
                onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
              >
                <ArrowLeft className="size-3.5" />
                Voltar
              </Button>

              {step < 3 ? (
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => setStep((s) => ((s + 1) as 1 | 2 | 3))}
                >
                  Continuar
                  <ArrowRight className="size-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    onApply({
                      dreamCourse: dreamCourse.trim() || "Medicina",
                      university: university.trim(),
                      pace,
                      weeklyHoursByDay: hoursByDay,
                    });
                    onClose();
                  }}
                >
                  <Sparkles className="size-3.5" />
                  Gerar cronograma
                </Button>
              )}
            </div>
          </div>

          {/* Prévia escura ao vivo */}
          <div className="surface-obsidian flex flex-col justify-between gap-4 rounded-2xl p-5 md:col-span-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Seu cronograma
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold tabular-nums text-white">
                  {daysToEnem > 0 ? daysToEnem : 350}
                </span>
                <span className="text-xs text-slate-300">dias até o ENEM</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {dreamCourse || "ENEM 2027"}
                {university ? ` • ${university}` : ""}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Sua semana</span>
                <span className="font-bold text-emerald-300 tabular-nums">
                  {totalWeeklyHours}h / sem
                </span>
              </div>

              <div className="grid h-24 grid-cols-7 items-end gap-1.5">
                {DAYS.map((d) => {
                  const val = hoursByDay[d.id] || 0;
                  const pct = val > 0 ? Math.max(12, Math.round((val / maxDayHours) * 100)) : 6;
                  return (
                    <div
                      key={d.id}
                      className="flex h-full flex-col items-center justify-end gap-1"
                    >
                      <div className="flex w-full flex-1 items-end justify-center">
                        <div
                          className={`w-full rounded-t-md ${
                            val > 0 ? "bg-emerald-500" : "bg-white/10"
                          }`}
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5 border-t border-white/10 pt-3 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Começa por
              </p>
              <p className="text-slate-200">1. Matemática (Core 80%)</p>
              <p className="text-slate-200">2. Biologia & Química</p>
              <p className="text-slate-200">3. Linguagens & Redação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
