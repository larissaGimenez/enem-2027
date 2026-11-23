import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookmarkPlus,
  CheckCircle2,
  ClipboardList,
  Plus,
  Scissors,
  Search,
  ShieldCheck,
  Shuffle,
  XCircle,
} from "lucide-react";
import { ErrorReasonModal } from "@/components/ErrorReasonModal";
import { Button } from "@/components/motion/button";
import { Card, CardContent } from "@/components/motion/card";
import { Input } from "@/components/motion/input";
import { Pagination } from "@/components/motion/pagination";
import type {
  ConfidenceLevel,
  ErrorEntry,
  ErrorReason,
  ExamSummary,
  QuestionAttempt,
  QuestionDetail,
  QuestionListEntry,
  QuestionSummary,
} from "@/types/study";

interface QuestionBankTabProps {
  exams: ExamSummary[];
  initialDiscipline?: string;
  initialSearch?: string;
  attempts?: Record<number, QuestionAttempt>;
  lists?: QuestionListEntry[];
  onRecordAttempt?: (attempt: QuestionAttempt) => void;
  onSaveToErrorNotebook?: (entry: Omit<ErrorEntry, "id" | "date">) => void;
  onUpdateLists?: (lists: QuestionListEntry[]) => void;
  onSendToErrors?: (area: string, topic: string, suggestedType?: string) => void;
}

const DISCIPLINE_TO_AREA: Record<string, string> = {
  linguagens: "Linguagens / Redação",
  "ciencias-humanas": "Ciências Humanas",
  "ciencias-natureza": "Ciências da Natureza",
  matematica: "Matemática",
};

const PAGE_LIMIT = 10;

export function QuestionBankTab({
  exams,
  initialDiscipline = "",
  initialSearch = "",
  attempts = {},
  lists = [],
  onRecordAttempt,
  onSaveToErrorNotebook,
  onUpdateLists,
  onSendToErrors,
}: QuestionBankTabProps) {
  const [bankSubMode, setBankSubMode] = useState<"bank" | "lists">("bank");

  // Filtros do painel direito
  const [situationFilter, setSituationFilter] = useState<
    "all" | "unanswered" | "wrong" | "correct"
  >("all");
  const [year, setYear] = useState("");
  const [discipline, setDiscipline] = useState(initialDiscipline);
  const [language, setLanguage] = useState("");
  const [searchText, setSearchText] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setDiscipline(initialDiscipline);
    setSearchText(initialSearch);
    setDebouncedSearch(initialSearch);
    setPage(1);
  }, [initialDiscipline, initialSearch]);

  const [total, setTotal] = useState(0);
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [globalMode, setGlobalMode] = useState(false);

  // Questão aberta no modo Banco
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<QuestionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [answeredLetter, setAnsweredLetter] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel>("certeza");
  const [crossedOut, setCrossedOut] = useState<Record<string, boolean>>({});

  // Modal de 6 motivos para Caderno de Erros
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalTarget, setErrorModalTarget] = useState<{
    area: string;
    topic: string;
    questionId?: number;
    year?: number;
    suggestedReason?: ErrorReason;
  } | null>(null);

  // Modo Prova ("Minhas listas")
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [listQuestions, setListQuestions] = useState<QuestionDetail[]>([]);
  const [loadingListExam, setLoadingListExam] = useState(false);
  const [activeExamIdx, setActiveExamIdx] = useState(0);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    let active = true;
    async function fetchQuestions() {
      if (globalMode) return;
      setLoadingList(true);
      setErrorMsg(null);
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_LIMIT),
          offset: String((page - 1) * PAGE_LIMIT),
        });
        if (year) params.set("year", year);
        if (discipline) params.set("discipline", discipline);
        if (language) params.set("language", language);
        if (debouncedSearch) params.set("q", debouncedSearch);

        const res = await fetch(`/api/questions?${params.toString()}`);
        if (!res.ok) throw new Error("API indisponível");
        const payload = await res.json();
        if (!active) return;
        setTotal(Number(payload.total) || 0);
        setQuestions(Array.isArray(payload.questions) ? payload.questions : []);
      } catch {
        if (!active) return;
        setErrorMsg("Inicie o servidor (npm start) para consultar o MySQL.");
        setQuestions([]);
      } finally {
        if (active) setLoadingList(false);
      }
    }
    fetchQuestions();
    return () => {
      active = false;
    };
  }, [year, discipline, language, debouncedSearch, page, globalMode]);

  async function handleGenerateGlobalList() {
    setGlobalMode(true);
    setLoadingList(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams({ limit: "10" });
      if (discipline) params.set("discipline", discipline);
      const res = await fetch(`/api/questions/random?${params.toString()}`);
      if (!res.ok) throw new Error("API indisponível");
      const payload = await res.json();
      const list = Array.isArray(payload.questions) ? payload.questions : [];
      setQuestions(list);
      setTotal(list.length);
      setSelectedId(null);
      setDetail(null);
    } catch {
      setErrorMsg("Inicie o servidor (npm start) para gerar Lista Global.");
    } finally {
      setLoadingList(false);
    }
  }

  async function handleCreateSavedList() {
    if (!onUpdateLists) return;
    setLoadingList(true);
    try {
      const params = new URLSearchParams({ limit: "10" });
      if (discipline) params.set("discipline", discipline);
      const res = await fetch(`/api/questions/random?${params.toString()}`);
      if (!res.ok) throw new Error("API indisponível");
      const payload = await res.json();
      const qs: QuestionSummary[] = Array.isArray(payload.questions)
        ? payload.questions
        : [];
      if (qs.length === 0) return;

      const areaName = discipline
        ? DISCIPLINE_TO_AREA[discipline] || discipline
        : "Lista Global Misturada";
      const newList: QuestionListEntry = {
        id: `list-${Date.now()}`,
        title: `${areaName} (${qs.length} q.)`,
        createdAt: new Date().toISOString().slice(0, 10),
        questionIds: qs.map((q) => q.id),
        answers: {},
        submitted: false,
      };
      onUpdateLists([newList, ...lists]);
      setBankSubMode("lists");
      await openListExam(newList);
    } catch {
      setErrorMsg("Erro ao criar lista no servidor.");
    } finally {
      setLoadingList(false);
    }
  }

  async function openListExam(list: QuestionListEntry) {
    setActiveListId(list.id);
    setActiveExamIdx(0);
    setLoadingListExam(true);
    try {
      const details = await Promise.all(
        list.questionIds.map(async (qId) => {
          const r = await fetch(`/api/questions/${qId}`);
          if (!r.ok) return null;
          return (await r.json()) as QuestionDetail;
        }),
      );
      setListQuestions(details.filter((d): d is QuestionDetail => Boolean(d)));
    } finally {
      setLoadingListExam(false);
    }
  }

  async function openQuestion(id: number) {
    setSelectedId(id);
    setAnsweredLetter(null);
    setCrossedOut({});
    setConfidence("certeza");
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/questions/${id}`);
      if (!res.ok) throw new Error("Falha ao carregar questão");
      const data: QuestionDetail = await res.json();
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  function handleAnswerBankQuestion(letter: string) {
    if (!detail) return;
    setAnsweredLetter(letter);
    const isCorrect =
      letter === detail.correct_alternative ||
      Boolean(
        detail.alternatives.find((a) => a.letter === letter)?.is_correct,
      );
    onRecordAttempt?.({
      questionId: detail.id,
      selected: letter,
      isCorrect,
      discipline: detail.discipline,
      year: detail.year,
      confidence,
      answeredAt: new Date().toISOString(),
    });
  }

  function openErrorModalForDetail(q: QuestionDetail, suggested?: ErrorReason) {
    const area = DISCIPLINE_TO_AREA[q.discipline] || "Matemática";
    setErrorModalTarget({
      area,
      topic: `ENEM ${q.year} • ${q.title || `Questão ${q.question_index}`}`,
      questionId: q.id,
      year: q.year,
      suggestedReason: suggested,
    });
    setErrorModalOpen(true);
  }

  const visibleQuestions = useMemo(() => {
    if (situationFilter === "all") return questions;
    return questions.filter((q) => {
      const att = attempts[q.id];
      if (situationFilter === "unanswered") return !att;
      if (situationFilter === "wrong") return att && !att.isCorrect;
      if (situationFilter === "correct") return att && att.isCorrect;
      return true;
    });
  }, [questions, situationFilter, attempts]);

  const totalPages = globalMode ? 1 : Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const activeList = lists.find((l) => l.id === activeListId) || null;

  return (
    <div className="space-y-5">
      {/* Seletor rápido Banco de questões | Minhas listas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-white p-1">
          <button
            type="button"
            onClick={() => {
              setBankSubMode("bank");
              setActiveListId(null);
            }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              bankSubMode === "bank"
                ? "bg-slate-900 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Questões ({total})
          </button>
          <button
            type="button"
            onClick={() => setBankSubMode("lists")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              bankSubMode === "lists"
                ? "bg-slate-900 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Minhas listas ({lists.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={handleGenerateGlobalList}
          >
            <Shuffle className="size-3.5" />
            Lista Global (10)
          </Button>
          {onUpdateLists && (
            <Button
              size="sm"
              className="rounded-full"
              onClick={handleCreateSavedList}
            >
              <Plus className="size-3.5" />
              Monte sua lista
            </Button>
          )}
        </div>
      </div>

      {/* MODO MINHAS LISTAS / MODO PROVA */}
      {bankSubMode === "lists" && (
        <div className="space-y-4">
          {activeList ? (
            loadingListExam ? (
              <Card className="rounded-2xl border-border bg-white shadow-none">
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  Preparando caderno de prova...
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                {/* Questão da lista */}
                <div className="space-y-4 lg:col-span-8">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-white px-4 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => setActiveListId(null)}
                    >
                      <ArrowLeft className="size-4" />
                      Voltar às listas
                    </Button>
                    <p className="text-xs font-bold text-foreground">
                      {activeList.title} • Questão {activeExamIdx + 1} de{" "}
                      {listQuestions.length}
                    </p>
                  </div>

                  {activeList.submitted && (
                    <Card className="surface-obsidian rounded-2xl border-0 shadow-none">
                      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                            Resultado da Lista
                          </p>
                          <p className="mt-1 font-display text-3xl font-extrabold text-white tabular-nums">
                            {activeList.score ?? 0}/{listQuestions.length}{" "}
                            <span className="text-base font-semibold text-slate-300">
                              (
                              {Math.round(
                                ((activeList.score ?? 0) /
                                  Math.max(1, listQuestions.length)) *
                                  100,
                              )}
                              %)
                            </span>
                          </p>
                        </div>
                        {onSaveToErrorNotebook && (
                          <Button
                            className="rounded-full"
                            onClick={() => {
                              let saved = 0;
                              for (const q of listQuestions) {
                                const ans = activeList.answers[q.id];
                                if (ans && ans !== q.correct_alternative) {
                                  onSaveToErrorNotebook({
                                    area:
                                      DISCIPLINE_TO_AREA[q.discipline] ||
                                      "Matemática",
                                    topic: `ENEM ${q.year} • ${
                                      q.title || `Questão ${q.question_index}`
                                    }`,
                                    type: "Não sabia o conteúdo",
                                    lesson: `Marcou ${ans}, gabarito ${q.correct_alternative}.`,
                                    questionId: q.id,
                                    year: q.year,
                                    status: "pending",
                                    lastResult: "none",
                                  });
                                  saved += 1;
                                }
                              }
                              if (saved > 0) {
                                alert(
                                  `${saved} questão(ões) errada(s) guardada(s) no Caderno de Erros!`,
                                );
                              }
                            }}
                          >
                            <BookmarkPlus className="size-4" />
                            Guardar erros no caderno
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {listQuestions[activeExamIdx] && (() => {
                    const q = listQuestions[activeExamIdx];
                    const chosen = activeList.answers[q.id];
                    return (
                      <Card className="rounded-2xl border-border bg-white shadow-none">
                        <CardContent className="space-y-4 p-6">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
                              ENEM {q.year} • Q{q.question_index}
                            </span>
                            <span className="text-xs font-semibold text-primary">
                              {DISCIPLINE_TO_AREA[q.discipline] || q.discipline}
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
                              const isChosen = chosen === alt.letter;
                              const isCorrect =
                                alt.letter === q.correct_alternative ||
                                Boolean(alt.is_correct);
                              let cls =
                                "border-border bg-white hover:bg-muted/40";
                              if (activeList.submitted) {
                                if (isCorrect)
                                  cls =
                                    "border-emerald-500 bg-emerald-50 text-emerald-900";
                                else if (isChosen)
                                  cls =
                                    "border-rose-500 bg-rose-50 text-rose-900";
                              } else if (isChosen) {
                                cls =
                                  "border-slate-900 bg-slate-900 text-white";
                              }

                              return (
                                <button
                                  key={alt.letter}
                                  type="button"
                                  disabled={activeList.submitted}
                                  onClick={() => {
                                    if (!onUpdateLists) return;
                                    const updated = lists.map((l) =>
                                      l.id === activeList.id
                                        ? {
                                            ...l,
                                            answers: {
                                              ...l.answers,
                                              [q.id]: alt.letter,
                                            },
                                          }
                                        : l,
                                    );
                                    onUpdateLists(updated);
                                  }}
                                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${cls}`}
                                >
                                  <span className="font-bold">
                                    {alt.letter})
                                  </span>
                                  <span className="flex-1">{alt.text}</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="rounded-full"
                              disabled={activeExamIdx === 0}
                              onClick={() =>
                                setActiveExamIdx((i) => Math.max(0, i - 1))
                              }
                            >
                              Anterior
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="rounded-full"
                              disabled={
                                activeExamIdx >= listQuestions.length - 1
                              }
                              onClick={() =>
                                setActiveExamIdx((i) =>
                                  Math.min(listQuestions.length - 1, i + 1),
                                )
                              }
                            >
                              Próxima
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>

                {/* Cartão-Resposta lateral */}
                <div className="lg:col-span-4">
                  <Card className="sticky top-20 rounded-2xl border-border bg-white shadow-none">
                    <CardContent className="space-y-4 p-5">
                      <h3 className="font-display text-base font-bold text-foreground">
                        Cartão-Resposta
                      </h3>
                      <div className="space-y-2">
                        {listQuestions.map((q, idx) => {
                          const chosen = activeList.answers[q.id];
                          const isCurrent = idx === activeExamIdx;
                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => setActiveExamIdx(idx)}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold ${
                                isCurrent
                                  ? "bg-secondary text-primary"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <span className="tabular-nums">
                                Questão {String(idx + 1).padStart(2, "0")}
                              </span>
                              <div className="flex items-center gap-1">
                                {["A", "B", "C", "D", "E"].map((letter) => {
                                  const selected = chosen === letter;
                                  return (
                                    <span
                                      key={letter}
                                      className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                        selected
                                          ? "bg-slate-900 text-white"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {letter}
                                    </span>
                                  );
                                })}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {!activeList.submitted && (
                        <Button
                          className="w-full rounded-full"
                          onClick={() => setConfirmSubmitOpen(true)}
                        >
                          Entregar lista
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {lists.length === 0 ? (
                <Card className="rounded-2xl border-border bg-white shadow-none md:col-span-2">
                  <CardContent className="space-y-3 py-12 text-center">
                    <ClipboardList className="mx-auto size-8 text-primary" />
                    <h3 className="font-display text-base font-bold text-foreground">
                      Nenhuma lista criada ainda
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Clique em <strong>Monte sua lista</strong> para gerar um simulado rápido de 10 questões com Cartão-Resposta.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                lists.map((l) => (
                  <Card
                    key={l.id}
                    className="rounded-2xl border-border bg-white shadow-none"
                  >
                    <CardContent className="flex items-center justify-between gap-3 p-5">
                      <div>
                        <p className="text-xs font-semibold text-primary">
                          {l.createdAt} • {l.questionIds.length} questões
                        </p>
                        <h4 className="font-display text-base font-bold text-foreground">
                          {l.title}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {l.submitted
                            ? `Entregue • Nota: ${l.score ?? 0}/${l.questionIds.length}`
                            : `${Object.keys(l.answers).length}/${l.questionIds.length} respondidas`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() => openListExam(l)}
                      >
                        {l.submitted ? "Revisar" : "Abrir prova"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* MODO BANCO DE QUESTÕES (2 COLUNAS: LISTA/QUESTÃO + PAINEL FILTROS À DIREITA) */}
      {bankSubMode === "bank" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Esquerda: Questão aberta ou Lista de questões */}
          <div className="space-y-4 lg:col-span-8">
            {errorMsg && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                {errorMsg}
              </div>
            )}

            {selectedId && (
              <Card className="rounded-2xl border-border bg-white shadow-none">
                <CardContent className="space-y-4 p-6">
                  {loadingDetail ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Carregando questão...
                    </p>
                  ) : detail ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(null);
                              setDetail(null);
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                          >
                            <ArrowLeft className="size-3.5" />
                            Lista
                          </button>
                          <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
                            ENEM {detail.year} • Q{detail.question_index}
                          </span>
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {DISCIPLINE_TO_AREA[detail.discipline] ||
                              detail.discipline}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openErrorModalForDetail(
                              detail,
                              confidence === "nao-sei"
                                ? "Não sabia o conteúdo"
                                : "Interpretei errado",
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                        >
                          <BookmarkPlus className="size-3.5" />
                          Guardar no caderno
                        </button>
                      </div>

                      {detail.context && (
                        <div className="whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-relaxed text-slate-700">
                          {detail.context}
                        </div>
                      )}

                      {detail.alternatives_intro && (
                        <p className="text-sm font-semibold text-foreground">
                          {detail.alternatives_intro}
                        </p>
                      )}

                      {/* Grau de Confiança */}
                      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/30 px-3 py-2 text-xs">
                        <span className="flex items-center gap-1 font-bold text-muted-foreground">
                          <ShieldCheck className="size-3.5 text-primary" />
                          Confiança:
                        </span>
                        {(
                          [
                            { id: "certeza", label: "Certeza" },
                            { id: "duvida", label: "Dúvida" },
                            { id: "nao-sei", label: "Não sei" },
                          ] as const
                        ).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setConfidence(c.id)}
                            className={`rounded-full px-2.5 py-0.5 font-semibold transition-colors ${
                              confidence === c.id
                                ? "bg-slate-900 text-white"
                                : "bg-white text-muted-foreground border border-border"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>

                      {/* Alternativas com opção de Riscar/Eliminar */}
                      <div className="space-y-2">
                        {detail.alternatives.map((alt) => {
                          const isCrossed = Boolean(crossedOut[alt.letter]);
                          const isCorrect =
                            alt.letter === detail.correct_alternative ||
                            Boolean(alt.is_correct);
                          const isChosen = answeredLetter === alt.letter;

                          let cls =
                            "border-border bg-white hover:border-slate-300";
                          if (answeredLetter) {
                            if (isCorrect) {
                              cls =
                                "border-emerald-500 bg-emerald-50 text-emerald-950";
                            } else if (isChosen) {
                              cls = "border-rose-500 bg-rose-50 text-rose-950";
                            }
                          }

                          return (
                            <div
                              key={alt.letter}
                              className={`flex items-start gap-2 rounded-xl border p-3 transition-colors ${cls}`}
                            >
                              <button
                                type="button"
                                disabled={Boolean(answeredLetter)}
                                onClick={() =>
                                  handleAnswerBankQuestion(alt.letter)
                                }
                                className={`flex flex-1 items-start gap-2.5 text-left text-sm ${
                                  isCrossed
                                    ? "line-through opacity-45"
                                    : ""
                                }`}
                              >
                                <span className="font-bold">
                                  {alt.letter})
                                </span>
                                <span className="flex-1">{alt.text}</span>
                              </button>

                              <button
                                type="button"
                                title={
                                  isCrossed
                                    ? "Desfazer risco"
                                    : "Riscar alternativa"
                                }
                                onClick={() =>
                                  setCrossedOut((prev) => ({
                                    ...prev,
                                    [alt.letter]: !prev[alt.letter],
                                  }))
                                }
                                className={`mt-0.5 shrink-0 rounded-lg p-1.5 transition-colors ${
                                  isCrossed
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-400 hover:bg-muted hover:text-foreground"
                                }`}
                              >
                                <Scissors className="size-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {answeredLetter && (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs">
                          <span className="font-bold text-foreground">
                            {answeredLetter === detail.correct_alternative ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                                <CheckCircle2 className="size-4" />
                                Resposta correta! Gabarito {detail.correct_alternative}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-rose-700">
                                <XCircle className="size-4" />
                                Você marcou {answeredLetter} • Gabarito:{" "}
                                {detail.correct_alternative}
                              </span>
                            )}
                          </span>

                          {answeredLetter !== detail.correct_alternative && (
                            <button
                              type="button"
                              onClick={() => openErrorModalForDetail(detail)}
                              className="font-bold text-primary hover:underline"
                            >
                              Registrar motivo no caderno →
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Lista de Questões */}
            <div className="space-y-2.5">
              {loadingList ? (
                <Card className="rounded-2xl border-border bg-white shadow-none">
                  <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    Consultando MySQL...
                  </CardContent>
                </Card>
              ) : visibleQuestions.length === 0 ? (
                <Card className="rounded-2xl border-border bg-white shadow-none">
                  <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    Nenhuma questão encontrada com esses filtros.
                  </CardContent>
                </Card>
              ) : (
                visibleQuestions.map((q) => {
                  const att = attempts[q.id];
                  const isSelected = selectedId === q.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => openQuestion(q.id)}
                      className={`block w-full rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-emerald-50/30"
                          : "border-border bg-white hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-slate-900 px-2.5 py-0.5 font-bold text-white">
                            ENEM {q.year}
                          </span>
                          <span className="font-bold text-primary">
                            Questão {q.question_index}
                          </span>
                          <span className="text-muted-foreground">
                            {DISCIPLINE_TO_AREA[q.discipline] || q.discipline}
                          </span>
                        </div>
                        {att && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              att.isCorrect
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {att.isCorrect ? "Acertei" : "Errei"}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                        {q.preview || q.title}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(next) => {
                  setPage(next);
                  setSelectedId(null);
                  setDetail(null);
                }}
              />
            )}
          </div>

          {/* Direita: Painel Filtros ao vivo */}
          <div className="lg:col-span-4">
            <Card className="sticky top-20 rounded-2xl border-border bg-white shadow-none">
              <CardContent className="space-y-5 p-5">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Filtros
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    aplicados na hora
                  </p>
                </div>

                {/* Situação */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Situação
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { id: "all", label: "Todas" },
                        { id: "unanswered", label: "Nunca respondi" },
                        { id: "wrong", label: "Errei" },
                        { id: "correct", label: "Acertei" },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSituationFilter(s.id)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                          situationFilter === s.id
                            ? "bg-slate-900 text-white"
                            : "bg-muted/50 text-foreground hover:bg-muted"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Área / Matéria */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Área / Matéria
                  </label>
                  <select
                    value={discipline}
                    onChange={(e) => {
                      setGlobalMode(false);
                      setDiscipline(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 w-full rounded-xl border border-border bg-muted/30 px-3 text-xs font-semibold text-foreground"
                  >
                    <option value="">Todas as áreas</option>
                    <option value="matematica">Matemática</option>
                    <option value="ciencias-natureza">
                      Ciências da Natureza
                    </option>
                    <option value="ciencias-humanas">Ciências Humanas</option>
                    <option value="linguagens">Linguagens</option>
                  </select>
                </div>

                {/* Ano */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Prova / Ano
                  </label>
                  <select
                    value={year}
                    onChange={(e) => {
                      setGlobalMode(false);
                      setYear(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 w-full rounded-xl border border-border bg-muted/30 px-3 text-xs font-semibold text-foreground"
                  >
                    <option value="">Todos os anos (2014–2023)</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={String(ex.year)}>
                        ENEM {ex.year} ({ex.total_questions} q.)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Idioma */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Idioma (Linguagens)
                  </label>
                  <select
                    value={language}
                    onChange={(e) => {
                      setGlobalMode(false);
                      setLanguage(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 w-full rounded-xl border border-border bg-muted/30 px-3 text-xs font-semibold text-foreground"
                  >
                    <option value="">Todos</option>
                    <option value="ingles">Inglês</option>
                    <option value="espanhol">Espanhol</option>
                  </select>
                </div>

                {/* Busca */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Palavra-chave
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchText}
                      onChange={(v) => {
                        setGlobalMode(false);
                        setSearchText(v);
                      }}
                      placeholder="Ex.: porcentagem, função, Brasil..."
                      className="h-9 rounded-xl pl-8 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modal "Entregar a lista?" */}
      {confirmSubmitOpen && activeList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-xl">
            <h3 className="font-display text-lg font-extrabold text-foreground">
              Entregar a lista?
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Você respondeu{" "}
              <strong className="text-foreground">
                {Object.keys(activeList.answers).length}
              </strong>{" "}
              de{" "}
              <strong className="text-foreground">
                {listQuestions.length}
              </strong>{" "}
              questões. Após entregar, verá seu desempenho e o gabarito comentado.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="secondary"
                className="rounded-full"
                onClick={() => setConfirmSubmitOpen(false)}
              >
                Continuar respondendo
              </Button>
              <Button
                className="rounded-full"
                onClick={() => {
                  if (!onUpdateLists) return;
                  let score = 0;
                  for (const q of listQuestions) {
                    const ans = activeList.answers[q.id];
                    if (ans && ans === q.correct_alternative) score += 1;
                    if (ans && onRecordAttempt) {
                      onRecordAttempt({
                        questionId: q.id,
                        selected: ans,
                        isCorrect: ans === q.correct_alternative,
                        discipline: q.discipline,
                        year: q.year,
                        answeredAt: new Date().toISOString(),
                      });
                    }
                  }
                  onUpdateLists(
                    lists.map((l) =>
                      l.id === activeList.id
                        ? { ...l, submitted: true, score }
                        : l,
                    ),
                  );
                  setConfirmSubmitOpen(false);
                }}
              >
                Entregar lista
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal "Guardar no caderno de erros" (6 motivos) */}
      <ErrorReasonModal
        open={errorModalOpen}
        area={errorModalTarget?.area || "Matemática"}
        topic={errorModalTarget?.topic || "Questão do Banco"}
        initialReason={errorModalTarget?.suggestedReason}
        onClose={() => setErrorModalOpen(false)}
        onSave={(reason, note) => {
          if (onSaveToErrorNotebook && errorModalTarget) {
            onSaveToErrorNotebook({
              area: errorModalTarget.area,
              topic: errorModalTarget.topic,
              type: reason,
              lesson: note || "Registrada pelo Banco de Questões.",
              questionId: errorModalTarget.questionId,
              year: errorModalTarget.year,
              status: "pending",
              lastResult: "none",
            });
          } else if (onSendToErrors && errorModalTarget) {
            onSendToErrors(
              errorModalTarget.area,
              errorModalTarget.topic,
              reason,
            );
          }
        }}
      />
    </div>
  );
}
