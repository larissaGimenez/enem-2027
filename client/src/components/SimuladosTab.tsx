import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookmarkPlus,
  CheckCircle2,
  Clock,
  Play,
  Scissors,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/motion/button";
import { Card, CardContent } from "@/components/motion/card";
import type {
  ErrorEntry,
  QuestionAttempt,
  QuestionDetail,
  QuestionSummary,
  SimuladoAttempt,
} from "@/types/study";

interface SimuladosTabProps {
  dbQuestionCount: number | null;
  history: SimuladoAttempt[];
  onRecordSimulado: (attempt: SimuladoAttempt) => void;
  onRecordAttempt: (attempt: QuestionAttempt) => void;
  onSaveToErrorNotebook: (entry: Omit<ErrorEntry, "id" | "date">) => void;
}

const DISC_TO_AREA: Record<string, string> = {
  linguagens: "Linguagens / Redação",
  "ciencias-humanas": "Ciências Humanas",
  "ciencias-natureza": "Ciências da Natureza",
  matematica: "Matemática",
};

export function SimuladosTab({
  dbQuestionCount,
  history,
  onRecordSimulado,
  onRecordAttempt,
  onSaveToErrorNotebook,
}: SimuladosTabProps) {
  const [activeTitle, setActiveTitle] = useState("");
  const [activeDayType, setActiveDayType] =
    useState<SimuladoAttempt["dayType"]>("dia2");
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [crossedOut, setCrossedOut] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [savedErrorsDone, setSavedErrorsDone] = useState(false);

  useEffect(() => {
    if (questions.length === 0 || submitted) return;
    const id = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [questions.length, submitted]);

  async function startSimulado(
    dayType: SimuladoAttempt["dayType"],
    title: string,
  ) {
    setLoading(true);
    setActiveTitle(title);
    setActiveDayType(dayType);
    setAnswers({});
    setCrossedOut({});
    setSubmitted(false);
    setSavedErrorsDone(false);
    setElapsedSeconds(0);
    setCurrentIdx(0);

    try {
      let summaries: QuestionSummary[] = [];
      if (dayType === "dia1") {
        const [r1, r2] = await Promise.all([
          fetch("/api/questions/random?discipline=linguagens&limit=10").then(
            (r) => r.json(),
          ),
          fetch(
            "/api/questions/random?discipline=ciencias-humanas&limit=10",
          ).then((r) => r.json()),
        ]);
        summaries = [
          ...(r1.questions || []),
          ...(r2.questions || []),
        ];
      } else if (dayType === "dia2") {
        const [r1, r2] = await Promise.all([
          fetch("/api/questions/random?discipline=matematica&limit=10").then(
            (r) => r.json(),
          ),
          fetch(
            "/api/questions/random?discipline=ciencias-natureza&limit=10",
          ).then((r) => r.json()),
        ]);
        summaries = [
          ...(r1.questions || []),
          ...(r2.questions || []),
        ];
      } else {
        const r = await fetch(
          "/api/questions/random?discipline=matematica&limit=15",
        ).then((res) => res.json());
        summaries = r.questions || [];
      }

      const details = await Promise.all(
        summaries.map((s) =>
          fetch(`/api/questions/${s.id}`).then((r) =>
            r.ok ? (r.json() as Promise<QuestionDetail>) : null,
          ),
        ),
      );

      setQuestions(details.filter((d): d is QuestionDetail => Boolean(d)));
    } finally {
      setLoading(false);
    }
  }

  function handleFinishSimulado() {
    if (submitted) return;
    let correctCount = 0;
    for (const q of questions) {
      const chosen = answers[q.id];
      const isCorrect = Boolean(chosen && chosen === q.correct_alternative);
      if (isCorrect) correctCount += 1;
      if (chosen) {
        onRecordAttempt({
          questionId: q.id,
          selected: chosen,
          isCorrect,
          discipline: q.discipline,
          year: q.year,
          answeredAt: new Date().toISOString(),
        });
      }
    }

    onRecordSimulado({
      id: `sim-${Date.now()}`,
      title: activeTitle,
      dayType: activeDayType,
      date: new Date().toISOString().slice(0, 10),
      totalQuestions: questions.length,
      correctCount,
      elapsedMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
    });

    setSubmitted(true);
  }

  if (loading) {
    return (
      <Card className="rounded-2xl border-border bg-white shadow-none">
        <CardContent className="py-14 text-center text-sm text-muted-foreground">
          Montando caderno de prova com questões oficiais do MySQL...
        </CardContent>
      </Card>
    );
  }

  if (questions.length > 0) {
    const q = questions[currentIdx];
    const correctTotal = questions.filter(
      (item) => answers[item.id] === item.correct_alternative,
    ).length;
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;

    return (
      <div className="space-y-5">
        {/* Barra superior do simulado */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full"
              onClick={() => setQuestions([])}
            >
              <ArrowLeft className="size-4" />
              Sair
            </Button>
            <span className="text-xs font-bold text-foreground">
              {activeTitle} • Questão {currentIdx + 1}/{questions.length}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1 text-xs font-bold tabular-nums text-foreground">
            <Clock className="size-3.5 text-primary" />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
        </div>

        {submitted && (
          <Card className="surface-obsidian rounded-2xl border-0 shadow-none">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Simulado entregue
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold text-white tabular-nums">
                  {correctTotal}/{questions.length} acertos (
                  {Math.round((correctTotal / questions.length) * 100)}%)
                </p>
              </div>
              <Button
                className="rounded-full"
                disabled={savedErrorsDone}
                onClick={() => {
                  for (const item of questions) {
                    const ans = answers[item.id];
                    if (ans && ans !== item.correct_alternative) {
                      onSaveToErrorNotebook({
                        area:
                          DISC_TO_AREA[item.discipline] || "Matemática",
                        topic: `ENEM ${item.year} • ${
                          item.title || `Questão ${item.question_index}`
                        }`,
                        type: "Não sabia o conteúdo",
                        lesson: `Simulado (${activeTitle}): marcou ${ans}, gabarito ${item.correct_alternative}.`,
                        questionId: item.id,
                        year: item.year,
                        status: "pending",
                        lastResult: "none",
                      });
                    }
                  }
                  setSavedErrorsDone(true);
                }}
              >
                <BookmarkPlus className="size-4" />
                {savedErrorsDone
                  ? "Erros guardados no caderno!"
                  : "Guardar erros no caderno"}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
                    ENEM {q.year} • Q{q.question_index}
                  </span>
                  <span className="text-xs font-semibold text-primary">
                    {DISC_TO_AREA[q.discipline] || q.discipline}
                  </span>
                </div>

                {q.context && (
                  <div className="whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-slate-700">
                    {q.context}
                  </div>
                )}

                {q.alternatives_intro && (
                  <p className="text-sm font-semibold text-foreground">
                    {q.alternatives_intro}
                  </p>
                )}

                <div className="space-y-2">
                  {q.alternatives.map((alt) => {
                    const chosen = answers[q.id] === alt.letter;
                    const isCorrect = alt.letter === q.correct_alternative;
                    const crossKey = `${q.id}-${alt.letter}`;
                    const isCrossed = Boolean(crossedOut[crossKey]);

                    let cls = "border-border bg-white hover:bg-muted/30";
                    if (submitted) {
                      if (isCorrect)
                        cls =
                          "border-emerald-500 bg-emerald-50 text-emerald-950";
                      else if (chosen)
                        cls = "border-rose-500 bg-rose-50 text-rose-950";
                    } else if (chosen) {
                      cls = "border-slate-900 bg-slate-900 text-white";
                    }

                    return (
                      <div
                        key={alt.letter}
                        className={`flex items-start gap-2 rounded-xl border p-3 transition-colors ${cls}`}
                      >
                        <button
                          type="button"
                          disabled={submitted}
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: alt.letter,
                            }))
                          }
                          className={`flex flex-1 items-start gap-2.5 text-left text-sm ${
                            isCrossed ? "line-through opacity-45" : ""
                          }`}
                        >
                          <span className="font-bold">{alt.letter})</span>
                          <span className="flex-1">{alt.text}</span>
                        </button>
                        {!submitted && (
                          <button
                            type="button"
                            onClick={() =>
                              setCrossedOut((prev) => ({
                                ...prev,
                                [crossKey]: !prev[crossKey],
                              }))
                            }
                            className={`rounded-lg p-1.5 ${
                              isCrossed
                                ? "bg-slate-900 text-white"
                                : "text-slate-400 hover:bg-muted"
                            }`}
                          >
                            <Scissors className="size-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    disabled={currentIdx >= questions.length - 1}
                    onClick={() =>
                      setCurrentIdx((i) =>
                        Math.min(questions.length - 1, i + 1),
                      )
                    }
                  >
                    Próxima
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="sticky top-20 rounded-2xl border-border bg-white shadow-none">
              <CardContent className="space-y-4 p-5">
                <h3 className="font-display text-base font-bold text-foreground">
                  Cartão-Resposta
                </h3>
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((item, idx) => {
                    const ans = answers[item.id];
                    const isCurrent = idx === currentIdx;
                    let cls = "border-border bg-muted/40 text-foreground";
                    if (submitted) {
                      cls =
                        ans === item.correct_alternative
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-rose-500 bg-rose-500 text-white";
                    } else if (isCurrent) {
                      cls = "border-primary bg-secondary text-primary";
                    } else if (ans) {
                      cls = "border-slate-900 bg-slate-900 text-white";
                    }
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        className={`rounded-xl border py-2 text-xs font-bold tabular-nums ${cls}`}
                      >
                        {idx + 1}
                        {ans ? `·${ans}` : ""}
                      </button>
                    );
                  })}
                </div>

                {!submitted && (
                  <Button
                    className="w-full rounded-full"
                    onClick={handleFinishSimulado}
                  >
                    <CheckCircle2 className="size-4" />
                    Entregar simulado
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="surface-emerald-hero rounded-3xl p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Treino cronometrado com questões reais do ENEM
            </p>
            <h2 className="font-display text-2xl font-extrabold text-white">
              Simulados ENEM
            </h2>
            <p className="max-w-xl text-xs leading-relaxed text-emerald-50/90">
              Escolha entre o 1º Dia, 2º Dia ou Mini Simulado de Matemática. Todas as questões vêm direto do seu banco MySQL ({dbQuestionCount ?? 1790} questões oficiais).
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 px-4 py-3 text-center backdrop-blur-xs">
            <p className="font-display text-2xl font-extrabold tabular-nums text-white">
              {history.length}
            </p>
            <p className="text-[11px] font-medium text-emerald-100">
              simulados feitos
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border bg-white shadow-none">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                1º Dia • 20 questões
              </span>
              <h3 className="font-display text-lg font-bold text-foreground">
                Linguagens & Humanas
              </h3>
              <p className="text-xs text-muted-foreground">
                10 questões de Linguagens + 10 de Ciências Humanas sorteadas das provas oficiais.
              </p>
            </div>
            <Button
              className="w-full rounded-full"
              onClick={() => startSimulado("dia1", "Mini Simulado 1º Dia")}
            >
              <Play className="size-3.5 fill-current" />
              Iniciar 1º Dia
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-white shadow-none">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                2º Dia • 20 questões
              </span>
              <h3 className="font-display text-lg font-bold text-foreground">
                Matemática & Natureza
              </h3>
              <p className="text-xs text-muted-foreground">
                10 questões de Matemática + 10 de Ciências da Natureza com Cartão-Resposta.
              </p>
            </div>
            <Button
              className="w-full rounded-full"
              onClick={() => startSimulado("dia2", "Mini Simulado 2º Dia")}
            >
              <Play className="size-3.5 fill-current" />
              Iniciar 2º Dia
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-white shadow-none">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Foco Exatas • 15 questões
              </span>
              <h3 className="font-display text-lg font-bold text-foreground">
                Simulado de Matemática
              </h3>
              <p className="text-xs text-muted-foreground">
                Bloco exclusivo de 15 questões oficiais de Matemática para ganhar ritmo e TRI.
              </p>
            </div>
            <Button
              className="w-full rounded-full"
              onClick={() =>
                startSimulado("matematica", "Simulado Focado — Matemática")
              }
            >
              <Play className="size-3.5 fill-current" />
              Iniciar Matemática
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Simulados */}
      {history.length > 0 && (
        <Card className="rounded-2xl border-border bg-white shadow-none">
          <CardContent className="space-y-3 p-5">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
              <Trophy className="size-4 text-primary" />
              Histórico de Simulados
            </h3>
            <div className="divide-y divide-border">
              {history.map((h) => {
                const pct = Math.round(
                  (h.correctCount / Math.max(1, h.totalQuestions)) * 100,
                );
                return (
                  <div
                    key={h.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground">{h.title}</p>
                      <p className="text-muted-foreground">
                        {h.date} • {h.elapsedMinutes} min
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 font-bold text-primary tabular-nums">
                      {h.correctCount}/{h.totalQuestions} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
