import { useEffect, useMemo, useState } from "react";
import {
  BookmarkPlus,
  Check,
  CheckCircle2,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { ERROR_REASONS, ErrorReasonModal } from "@/components/ErrorReasonModal";
import { Button } from "@/components/motion/button";
import { Card, CardContent } from "@/components/motion/card";
import { findExerciseByIdOrTopic } from "@/data/mathExercises";
import type {
  ErrorEntry,
  ErrorReason,
  QuestionAttempt,
  QuestionDetail,
} from "@/types/study";

interface ErrorNotebookTabProps {
  errors: ErrorEntry[];
  attempts?: Record<number, QuestionAttempt>;
  onAddError: (entry: Omit<ErrorEntry, "id" | "date">) => void;
  onUpdateError: (id: string, patch: Partial<ErrorEntry>) => void;
  onDeleteError: (id: string) => void;
}

const DISC_TO_AREA: Record<string, string> = {
  linguagens: "Linguagens / Redação",
  "ciencias-humanas": "Ciências Humanas",
  "ciencias-natureza": "Ciências da Natureza",
  matematica: "Matemática",
};

export function ErrorNotebookTab({
  errors,
  attempts = {},
  onAddError,
  onUpdateError,
  onDeleteError,
}: ErrorNotebookTabProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "mastered">("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [showManualForm, setShowManualForm] = useState(false);

  // Quantas questões refazer em sequência
  const [redoLimit, setRedoLimit] = useState<number>(10);

  // Manual form
  const [area, setArea] = useState("Matemática");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<ErrorReason>("Não sabia o conteúdo");
  const [lesson, setLesson] = useState("");

  // Edição inline de observação
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState("");

  // Modal de 6 motivos para "Erros recentes fora do caderno"
  const [saveModalAttempt, setSaveModalAttempt] = useState<QuestionAttempt | null>(null);

  // Refazer em sequência mode (carrega questão real do MySQL se tiver questionId)
  const [redoQueueIds, setRedoQueueIds] = useState<string[] | null>(null);
  const [redoIndex, setRedoIndex] = useState(0);
  const [redoQuestion, setRedoQuestion] = useState<QuestionDetail | null>(null);
  const [loadingRedoQ, setLoadingRedoQ] = useState(false);
  const [redoChosenLetter, setRedoChosenLetter] = useState<string | null>(null);

  const stats = useMemo(() => {
    const pending = errors.filter((e) => e.status !== "mastered");
    const mastered = errors.filter((e) => e.status === "mastered");
    const lastCorrect = pending.filter((e) => e.lastResult === "correct").length;
    const lastWrong = pending.filter((e) => e.lastResult === "wrong").length;
    const neverRedone = pending.length - lastCorrect - lastWrong;

    const reasonCounts = ERROR_REASONS.map((r) => ({
      ...r,
      count: errors.filter((e) => e.type === r.id).length,
    }));
    const maxReason = Math.max(1, ...reasonCounts.map((r) => r.count));

    const areas = Array.from(new Set(errors.map((e) => e.area)));

    return {
      total: errors.length,
      pendingCount: pending.length,
      masteredCount: mastered.length,
      lastCorrect,
      lastWrong,
      neverRedone,
      reasonCounts,
      maxReason,
      areas,
    };
  }, [errors]);

  // Erros recentes feitos no Banco/Simulados que ainda não estão no Caderno
  const recentUnsavedErrors = useMemo(() => {
    const savedQIds = new Set(
      errors.map((e) => e.questionId).filter((id): id is number => Boolean(id)),
    );
    return Object.values(attempts)
      .filter((a) => !a.isCorrect && !savedQIds.has(a.questionId))
      .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
      .slice(0, 6);
  }, [attempts, errors]);

  const filteredErrors = useMemo(() => {
    return errors.filter((err) => {
      const st = err.status === "mastered" ? "mastered" : "pending";
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if (areaFilter !== "all" && err.area !== areaFilter) return false;
      if (reasonFilter !== "all" && err.type !== reasonFilter) return false;
      return true;
    });
  }, [errors, statusFilter, areaFilter, reasonFilter]);

  const activeRedoItem = useMemo(() => {
    if (!redoQueueIds || redoQueueIds.length === 0) return null;
    return errors.find((e) => e.id === redoQueueIds[redoIndex]) || null;
  }, [redoQueueIds, redoIndex, errors]);

  useEffect(() => {
    let active = true;
    async function loadQ() {
      setRedoChosenLetter(null);
      if (!activeRedoItem?.questionId) {
        setRedoQuestion(null);
        return;
      }
      setLoadingRedoQ(true);
      try {
        const res = await fetch(`/api/questions/${activeRedoItem.questionId}`);
        if (!res.ok) throw new Error("not found");
        const data: QuestionDetail = await res.json();
        if (active) setRedoQuestion(data);
      } catch {
        if (active) setRedoQuestion(null);
      } finally {
        if (active) setLoadingRedoQ(false);
      }
    }
    loadQ();
    return () => {
      active = false;
    };
  }, [activeRedoItem?.id, activeRedoItem?.questionId]);

  function handleStartRedoSequence() {
    const pending = errors.filter((e) => e.status !== "mastered");
    const slice = redoLimit === 0 ? pending : pending.slice(0, redoLimit);
    if (slice.length === 0) return;
    setRedoQueueIds(slice.map((e) => e.id));
    setRedoIndex(0);
  }

  function advanceRedo() {
    if (redoQueueIds && redoIndex + 1 < redoQueueIds.length) {
      setRedoIndex((i) => i + 1);
    } else {
      setRedoQueueIds(null);
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || !lesson.trim()) return;
    onAddError({
      area,
      topic: topic.trim(),
      type,
      lesson: lesson.trim(),
      status: "pending",
      lastResult: "none",
    });
    setTopic("");
    setLesson("");
    setShowManualForm(false);
  }

  // Modo "Refazer em sequência"
  if (redoQueueIds && activeRedoItem) {
    const redoExercise = !redoQuestion
      ? findExerciseByIdOrTopic(activeRedoItem.exerciseId, activeRedoItem.topic)
      : null;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-5 py-3.5">
          <div>
            <p className="text-xs font-semibold text-primary">
              Refazendo caderno de erros • {redoIndex + 1} de {redoQueueIds.length}
            </p>
            <h2 className="font-display text-base font-bold text-foreground">
              {activeRedoItem.area} — {activeRedoItem.topic}
            </h2>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={() => setRedoQueueIds(null)}
          >
            Encerrar revisão
          </Button>
        </div>

        <Card className="rounded-2xl border-border bg-white shadow-none">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {activeRedoItem.year && (
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 font-bold text-white">
                  ENEM {activeRedoItem.year}
                </span>
              )}
              {redoExercise && (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 font-bold text-primary">
                  {redoExercise.level}
                </span>
              )}
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-bold text-amber-700">
                Motivo anterior: {activeRedoItem.type}
              </span>
              <span className="text-muted-foreground">{activeRedoItem.date}</span>
            </div>

            {loadingRedoQ ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Carregando questão original do MySQL...
              </p>
            ) : redoQuestion ? (
              <div className="space-y-3">
                {redoQuestion.context && (
                  <div className="whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-slate-700">
                    {redoQuestion.context}
                  </div>
                )}
                {redoQuestion.alternatives_intro && (
                  <p className="text-sm font-semibold text-foreground">
                    {redoQuestion.alternatives_intro}
                  </p>
                )}
                <div className="space-y-2">
                  {redoQuestion.alternatives.map((alt) => {
                    const isChosen = redoChosenLetter === alt.letter;
                    const isCorrect =
                      alt.letter === redoQuestion.correct_alternative ||
                      Boolean(alt.is_correct);
                    let cls = "border-border bg-white hover:bg-muted/40";
                    if (redoChosenLetter) {
                      if (isCorrect)
                        cls = "border-emerald-500 bg-emerald-50 text-emerald-950";
                      else if (isChosen)
                        cls = "border-rose-500 bg-rose-50 text-rose-950";
                    }
                    return (
                      <button
                        key={alt.letter}
                        type="button"
                        disabled={Boolean(redoChosenLetter)}
                        onClick={() => {
                          setRedoChosenLetter(alt.letter);
                          onUpdateError(activeRedoItem.id, {
                            lastResult: isCorrect ? "correct" : "wrong",
                            status: isCorrect ? "mastered" : "pending",
                          });
                        }}
                        className={`flex w-full items-start gap-2.5 rounded-xl border p-3 text-left text-sm transition-colors ${cls}`}
                      >
                        <span className="font-bold">{alt.letter})</span>
                        <span>{alt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : redoExercise ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold leading-relaxed text-foreground">
                  {redoExercise.prompt}
                </p>
                <div className="space-y-2">
                  {redoExercise.alternatives.map((alt) => {
                    const isChosen = redoChosenLetter === alt.letter;
                    const isCorrect = alt.letter === redoExercise.correct;
                    let cls = "border-border bg-white hover:bg-muted/40";
                    if (redoChosenLetter) {
                      if (isCorrect)
                        cls = "border-emerald-500 bg-emerald-50 text-emerald-950";
                      else if (isChosen)
                        cls = "border-rose-500 bg-rose-50 text-rose-950";
                    }
                    return (
                      <button
                        key={alt.letter}
                        type="button"
                        disabled={Boolean(redoChosenLetter)}
                        onClick={() => {
                          setRedoChosenLetter(alt.letter);
                          onUpdateError(activeRedoItem.id, {
                            lastResult: isCorrect ? "correct" : "wrong",
                            status: isCorrect ? "mastered" : "pending",
                          });
                        }}
                        className={`flex w-full items-start gap-2.5 rounded-xl border p-3 text-left text-sm transition-colors ${cls}`}
                      >
                        <span className="font-bold">{alt.letter})</span>
                        <span>{alt.text}</span>
                      </button>
                    );
                  })}
                </div>
                {redoChosenLetter && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-xs">
                    <p className="font-bold text-emerald-800">
                      {redoChosenLetter === redoExercise.correct
                        ? "Acertou! Questão marcada como Dominada."
                        : `Errou novamente (Gabarito: ${redoExercise.correct}).`}
                    </p>
                    <p className="mt-1 leading-relaxed text-slate-700">
                      {redoExercise.explanation}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Sua anotação / lição aprendida
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                {activeRedoItem.lesson || "Sem observação registrada."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {redoQuestion || redoExercise ? (
                <Button
                  className="rounded-full"
                  disabled={!redoChosenLetter}
                  onClick={advanceRedo}
                >
                  {redoIndex + 1 < redoQueueIds.length
                    ? "Próxima questão →"
                    : "Concluir revisão"}
                </Button>
              ) : (
                <>
                  <Button
                    className="rounded-full"
                    onClick={() => {
                      onUpdateError(activeRedoItem.id, {
                        lastResult: "correct",
                        status: "mastered",
                      });
                      advanceRedo();
                    }}
                  >
                    <CheckCircle2 className="size-4" />
                    Acertei agora (Dominada)
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => {
                      onUpdateError(activeRedoItem.id, {
                        lastResult: "wrong",
                        status: "pending",
                      });
                      advanceRedo();
                    }}
                  >
                    Errei de novo (Manter pendente)
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Cabeçalho com contador e botão de novo registro manual */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {stats.total}{" "}
          {stats.total === 1 ? "questão guardada" : "questões guardadas"} •{" "}
          {stats.masteredCount}{" "}
          {stats.masteredCount === 1 ? "dominada" : "dominadas"}
        </p>

        <Button
          size="sm"
          variant="secondary"
          className="rounded-full"
          onClick={() => setShowManualForm((s) => !s)}
        >
          <Plus className="size-3.5" />
          Registrar erro manual
        </Button>
      </div>

      {/* Formulário manual opcional */}
      {showManualForm && (
        <Card className="rounded-2xl border-border bg-white shadow-none">
          <CardContent className="p-5">
            <form
              onSubmit={handleManualSubmit}
              className="grid grid-cols-1 gap-3 sm:grid-cols-12"
            >
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="h-10 rounded-xl border border-border bg-muted/30 px-3 text-xs font-semibold sm:col-span-3"
              >
                <option value="Matemática">Matemática</option>
                <option value="Ciências da Natureza">Ciências da Natureza</option>
                <option value="Ciências Humanas">Ciências Humanas</option>
                <option value="Linguagens / Redação">Linguagens / Redação</option>
              </select>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Tema / Questão (ex.: Função Afim - ENEM 2022)"
                className="h-10 rounded-xl border border-border bg-white px-3 text-xs sm:col-span-5"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ErrorReason)}
                className="h-10 rounded-xl border border-border bg-muted/30 px-3 text-xs font-semibold sm:col-span-4"
              >
                {ERROR_REASONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id}
                  </option>
                ))}
              </select>
              <textarea
                rows={2}
                required
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                placeholder="O que aprendi para não repetir esse erro..."
                className="rounded-xl border border-border bg-white p-3 text-xs sm:col-span-10"
              />
              <Button type="submit" className="h-auto rounded-xl sm:col-span-2">
                Salvar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Layout 2 colunas: Conteúdo à esquerda + Organizar à direita */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          {/* Topo: Card Obsidian "Refazer em sequência" + Card "Por que você erra" */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <Card className="surface-obsidian rounded-2xl border-0 shadow-none md:col-span-6">
              <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Todo o caderno
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-extrabold tabular-nums text-white">
                      {stats.pendingCount}
                    </span>
                    <span className="text-sm text-slate-300">
                      questões para refazer
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Quantas questões refazer"
                    value={redoLimit}
                    onChange={(e) => setRedoLimit(Number(e.target.value))}
                    className="h-9 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-bold text-white"
                  >
                    <option value={5} className="text-slate-900">
                      Quantas: 5
                    </option>
                    <option value={10} className="text-slate-900">
                      Quantas: 10
                    </option>
                    <option value={20} className="text-slate-900">
                      Quantas: 20
                    </option>
                    <option value={0} className="text-slate-900">
                      Todas
                    </option>
                  </select>

                  <Button
                    className="rounded-full"
                    disabled={stats.pendingCount === 0}
                    onClick={handleStartRedoSequence}
                  >
                    <RefreshCw className="size-3.5" />
                    Refazer em sequência
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-xs">
                  <div>
                    <p className="text-[11px] text-slate-400">Acertou na última</p>
                    <p className="font-bold tabular-nums text-white">
                      {stats.lastCorrect}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Errou de novo</p>
                    <p className="font-bold tabular-nums text-white">
                      {stats.lastWrong}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Ainda não refez</p>
                    <p className="font-bold tabular-nums text-white">
                      {stats.neverRedone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-white shadow-none md:col-span-6">
              <CardContent className="space-y-3 p-5">
                <h3 className="font-display text-base font-bold text-foreground">
                  Por que você erra
                </h3>

                <div className="space-y-2.5">
                  {stats.reasonCounts.map((r) => {
                    const Icon = r.icon;
                    const pct =
                      r.count > 0
                        ? Math.round((r.count / stats.maxReason) * 100)
                        : 0;
                    return (
                      <div
                        key={r.id}
                        className="grid grid-cols-12 items-center gap-2 text-xs"
                      >
                        <span className="col-span-6 flex items-center gap-1.5 truncate text-slate-600">
                          <Icon className="size-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{r.id}</span>
                        </span>
                        <div className="col-span-5 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="col-span-1 text-right font-bold tabular-nums text-foreground">
                          {r.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Faixa "Erros recentes fora do caderno" */}
          {recentUnsavedErrors.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-foreground">
                <Sparkles className="size-4 text-primary" />
                Erros recentes fora do caderno ({recentUnsavedErrors.length})
              </h3>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                {recentUnsavedErrors.map((att) => (
                  <div
                    key={att.questionId}
                    className="flex flex-col justify-between gap-2 rounded-2xl border border-border bg-white p-3.5"
                  >
                    <div>
                      <p className="text-[11px] font-bold text-primary">
                        ENEM {att.year}
                      </p>
                      <p className="text-xs font-bold text-foreground">
                        {DISC_TO_AREA[att.discipline] || att.discipline}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Questão #{att.questionId} • marcou {att.selected}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSaveModalAttempt(att)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-primary"
                    >
                      <BookmarkPlus className="size-3.5" />
                      Guardar no caderno
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de erros filtrada com edição inline */}
          <div className="space-y-3">
            {filteredErrors.length === 0 ? (
              <Card className="rounded-2xl border-border bg-white shadow-none">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma questão encontrada para os filtros selecionados.
                </CardContent>
              </Card>
            ) : (
              filteredErrors.map((err) => {
                const isMastered = err.status === "mastered";
                const isEditing = editingId === err.id;
                return (
                  <Card
                    key={err.id}
                    className="rounded-2xl border-border bg-white shadow-none"
                  >
                    <CardContent className="space-y-3 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {err.year && (
                            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                              ENEM {err.year}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              isMastered
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isMastered ? "Dominada" : "Para refazer"}
                          </span>

                          {/* Trocar motivo direto */}
                          <select
                            aria-label="Motivo do erro"
                            value={err.type}
                            onChange={(e) =>
                              onUpdateError(err.id, { type: e.target.value })
                            }
                            className="h-6 rounded-full border border-amber-200 bg-amber-50 px-2.5 text-[11px] font-semibold text-amber-800"
                          >
                            {ERROR_REASONS.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.id}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateError(err.id, {
                                status: isMastered ? "pending" : "mastered",
                              })
                            }
                            className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                          >
                            {isMastered ? "Reabrir" : "Marcar dominada"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteError(err.id)}
                            title="Remover do caderno"
                            className="inline-flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-primary">
                          {err.area} • {err.date}
                        </p>
                        <h4 className="mt-0.5 font-display text-sm font-bold text-foreground">
                          {err.topic}
                        </h4>
                      </div>

                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/35 px-3.5 py-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            Minha observação
                          </p>
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(err.id);
                                setEditingNote(err.lesson);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                            >
                              <Pencil className="size-3" />
                              Editar
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              rows={2}
                              value={editingNote}
                              onChange={(e) => setEditingNote(e.target.value)}
                              className="w-full rounded-xl border border-emerald-200 bg-white p-2.5 text-xs text-foreground"
                            />
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 rounded-full px-3 text-[11px]"
                                onClick={() => setEditingId(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 rounded-full px-3 text-[11px]"
                                onClick={() => {
                                  onUpdateError(err.id, {
                                    lesson: editingNote.trim(),
                                  });
                                  setEditingId(null);
                                }}
                              >
                                <Check className="size-3" />
                                Salvar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-0.5 whitespace-pre-wrap text-xs text-slate-700">
                            {err.lesson}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Painel Direito: Organizar (Filtros) */}
        <div className="lg:col-span-4">
          <Card className="sticky top-20 rounded-2xl border-border bg-white shadow-none">
            <CardContent className="space-y-5 p-5">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Organizar
                </h3>
                <p className="text-xs text-muted-foreground">
                  {filteredErrors.length}{" "}
                  {filteredErrors.length === 1 ? "questão" : "questões"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Situação
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "all", label: `Todas (${stats.total})` },
                      { id: "pending", label: `Refazer (${stats.pendingCount})` },
                      { id: "mastered", label: `Domin. (${stats.masteredCount})` },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatusFilter(s.id)}
                      className={`rounded-xl px-2 py-2 text-[11px] font-bold transition-colors ${
                        statusFilter === s.id
                          ? "bg-slate-900 text-white"
                          : "bg-muted/50 text-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Matérias
                </p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setAreaFilter("all")}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                      areaFilter === "all"
                        ? "bg-secondary text-primary"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>Todas as matérias</span>
                    <span>{stats.total}</span>
                  </button>
                  {stats.areas.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAreaFilter(a)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                        areaFilter === a
                          ? "bg-secondary text-primary"
                          : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span className="truncate">{a}</span>
                      <span>{errors.filter((e) => e.area === a).length}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Por que errei
                </p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setReasonFilter("all")}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold ${
                      reasonFilter === "all"
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>Todos os motivos</span>
                    <span>{stats.total}</span>
                  </button>
                  {stats.reasonCounts.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setReasonFilter(r.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold ${
                          reasonFilter === r.id
                            ? "bg-secondary text-primary"
                            : "text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Icon className="size-3.5 shrink-0" />
                          <span className="truncate">{r.id}</span>
                        </span>
                        <span>{r.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal para guardar erro recente fora do caderno */}
      <ErrorReasonModal
        open={Boolean(saveModalAttempt)}
        area={
          saveModalAttempt
            ? DISC_TO_AREA[saveModalAttempt.discipline] || "Matemática"
            : "Matemática"
        }
        topic={
          saveModalAttempt
            ? `ENEM ${saveModalAttempt.year} • Questão #${saveModalAttempt.questionId}`
            : ""
        }
        onClose={() => setSaveModalAttempt(null)}
        onSave={(reason, note) => {
          if (!saveModalAttempt) return;
          onAddError({
            area: DISC_TO_AREA[saveModalAttempt.discipline] || "Matemática",
            topic: `ENEM ${saveModalAttempt.year} • Questão #${saveModalAttempt.questionId}`,
            type: reason,
            lesson: note || `Marcou ${saveModalAttempt.selected} no treino.`,
            questionId: saveModalAttempt.questionId,
            year: saveModalAttempt.year,
            status: "pending",
            lastResult: "none",
          });
        }}
      />
    </div>
  );
}
