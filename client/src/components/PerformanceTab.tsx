import { useMemo, useState } from "react";
import { CheckCircle2, Flame, Layers, Target, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/motion/card";
import type { ErrorEntry, QuestionAttempt } from "@/types/study";

interface PerformanceTabProps {
  attempts: Record<number, QuestionAttempt>;
  errors: ErrorEntry[];
  onGoToErrors: () => void;
  onGoToBank: () => void;
}

type PerfSubTab = "overview" | "accuracy" | "review";

const DISC_LABELS: Record<string, string> = {
  matematica: "Matemática",
  "ciencias-natureza": "Ciências da Natureza",
  "ciencias-humanas": "Ciências Humanas",
  linguagens: "Linguagens",
};

export function PerformanceTab({
  attempts,
  errors,
  onGoToErrors,
  onGoToBank,
}: PerformanceTabProps) {
  const [subTab, setSubTab] = useState<PerfSubTab>("overview");

  const stats = useMemo(() => {
    const list = Object.values(attempts);
    const total = list.length;
    const correct = list.filter((a) => a.isCorrect).length;
    const wrong = total - correct;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    const byArea = Object.entries(DISC_LABELS).map(([key, label]) => {
      const items = list.filter((a) => a.discipline === key);
      const areaCorrect = items.filter((a) => a.isCorrect).length;
      const areaPct =
        items.length > 0 ? Math.round((areaCorrect / items.length) * 100) : 0;
      return {
        key,
        label,
        total: items.length,
        correct: areaCorrect,
        wrong: items.length - areaCorrect,
        pct: areaPct,
      };
    });

    const pendingErrors = errors.filter((e) => e.status !== "mastered");

    return { total, correct, wrong, pct, byArea, pendingErrors };
  }, [attempts, errors]);

  return (
    <div className="space-y-5">
      {/* Sub-abas de Desempenho */}
      <div className="inline-flex rounded-full border border-border bg-white p-1">
        {(
          [
            { id: "overview", label: "Visão geral" },
            { id: "accuracy", label: "Acertos e erros" },
            { id: "review", label: `Revisão (${stats.pendingErrors.length})` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              subTab === t.id
                ? "bg-slate-900 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground">
                  Questões respondidas
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-foreground">
                  {stats.total}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Registradas no Banco
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground">
                  Taxa de acerto
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-primary">
                  {stats.pct}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats.correct} certas • {stats.wrong} erradas
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground">
                  Caderno de erros
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-amber-600">
                  {stats.pendingErrors.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pendentes para refazer
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground">
                  Meta recomendada
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-display text-3xl font-extrabold tabular-nums text-foreground">
                  <Flame className="size-6 text-primary" />
                  75%+
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Consistência por área
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-border bg-white shadow-none">
            <CardContent className="space-y-4 p-6">
              <h3 className="font-display text-base font-bold text-foreground">
                Acerto por área do ENEM
              </h3>
              <div className="space-y-4">
                {stats.byArea.map((a) => (
                  <div key={a.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground">{a.label}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {a.correct}/{a.total} ({a.pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${a.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {subTab === "accuracy" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {stats.byArea.map((a) => (
            <Card key={a.key} className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-base font-bold text-foreground">
                    {a.label}
                  </h4>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-primary tabular-nums">
                    {a.pct}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                    {a.correct} acertos
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                    <XCircle className="size-3.5" />
                    {a.wrong} erros
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${a.pct}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {subTab === "review" && (
        <Card className="rounded-2xl border-border bg-white shadow-none">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Precisam de revisão
                </h3>
                <p className="text-xs text-muted-foreground">
                  Erros pendentes no caderno que você ainda não marcou como dominados.
                </p>
              </div>
              <button
                type="button"
                onClick={onGoToErrors}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:opacity-95"
              >
                <Target className="size-3.5" />
                Ir para o Caderno de erros
              </button>
            </div>

            {stats.pendingErrors.length === 0 ? (
              <div className="rounded-xl bg-muted/40 py-8 text-center text-xs text-muted-foreground">
                <Layers className="mx-auto mb-2 size-6 text-primary" />
                Tudo em dia! Resolva mais questões no{" "}
                <button
                  type="button"
                  onClick={onGoToBank}
                  className="font-bold text-primary underline"
                >
                  Banco de questões
                </button>
                .
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {stats.pendingErrors.slice(0, 6).map((err) => (
                  <div
                    key={err.id}
                    className="rounded-xl border border-border bg-muted/20 p-3.5"
                  >
                    <p className="text-[11px] font-bold text-primary">
                      {err.area} • {err.type}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">
                      {err.topic}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {err.lesson}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
