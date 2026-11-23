import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Layers,
  Lock,
  Play,
  RotateCcw,
  Search,
} from "lucide-react";
import { Button } from "@/components/motion/button";
import { Card, CardContent } from "@/components/motion/card";
import { Input } from "@/components/motion/input";
import { MATH_AXES, MATH_CURRICULUM } from "@/data/mathCurriculum";
import { getLessonTheory } from "@/data/mathLessonContent";
import type { CardReviewState, TopicStatus } from "@/types/study";

interface FlashCardItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  axis: string;
  front: string;
  back: string;
  unlocked: boolean;
}

interface CardsTabProps {
  topicStatus: Record<string, TopicStatus>;
  cardReviews: Record<string, CardReviewState>;
  onRecordReview: (review: CardReviewState) => void;
  onGoToLessons: () => void;
}

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function CardsTab({
  topicStatus,
  cardReviews,
  onRecordReview,
  onGoToLessons,
}: CardsTabProps) {
  const [search, setSearch] = useState("");
  const [axisFilter, setAxisFilter] = useState("all");
  const [reviewingQueue, setReviewingQueue] = useState<FlashCardItem[] | null>(
    null,
  );
  const [reviewIdx, setReviewIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const todayIso = new Date().toISOString().slice(0, 10);

  const allCards = useMemo<FlashCardItem[]>(() => {
    const items: FlashCardItem[] = [];
    for (const course of MATH_CURRICULUM) {
      const theory = getLessonTheory(course);
      const unlocked = topicStatus[course.id] === "done";

      theory.keyFormulas.forEach((formula, idx) => {
        items.push({
          id: `${course.id}-f-${idx}`,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          axis: course.axis,
          front: `${course.title}: qual é a regra ou fórmula-chave #${idx + 1}?`,
          back: formula,
          unlocked,
        });
      });

      items.push({
        id: `${course.id}-tip`,
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        axis: course.axis,
        front: `Como "${course.title}" costuma cair no ENEM e qual o cuidado principal?`,
        back: course.enemTip,
        unlocked,
      });
    }
    return items;
  }, [topicStatus]);

  const unlockedCards = useMemo(
    () => allCards.filter((c) => c.unlocked),
    [allCards],
  );
  const lockedCardsCount = allCards.length - unlockedCards.length;
  const lockedLessonsCount = MATH_CURRICULUM.filter(
    (c) => topicStatus[c.id] !== "done",
  ).length;

  const dueToday = useMemo(() => {
    return unlockedCards.filter((c) => {
      const rev = cardReviews[c.id];
      if (!rev) return true;
      return rev.nextReviewDate <= todayIso;
    });
  }, [unlockedCards, cardReviews, todayIso]);

  const accuracyStats = useMemo(() => {
    const list = Object.values(cardReviews);
    const totalReviews = list.reduce((acc, r) => acc + r.reviewCount, 0);
    const goodOrEasy = list.filter(
      (r) => r.lastResult === "good" || r.lastResult === "easy",
    ).length;
    const pct =
      list.length > 0 ? Math.round((goodOrEasy / list.length) * 100) : null;
    return { totalReviews, pct };
  }, [cardReviews]);

  const next7Days = useMemo(() => {
    const labels = ["hoje", "amn", "d+2", "d+3", "d+4", "d+5", "d+6"];
    return labels.map((label, offset) => {
      const targetIso = addDaysIso(offset);
      const count = unlockedCards.filter((c) => {
        const rev = cardReviews[c.id];
        if (offset === 0) return !rev || rev.nextReviewDate <= todayIso;
        return rev?.nextReviewDate === targetIso;
      }).length;
      return { label, count, isToday: offset === 0 };
    });
  }, [unlockedCards, cardReviews, todayIso]);

  const filteredCollection = useMemo(() => {
    const term = search.trim().toLowerCase();
    return unlockedCards.filter((c) => {
      if (axisFilter !== "all" && c.axis !== axisFilter) return false;
      if (
        term &&
        !c.front.toLowerCase().includes(term) &&
        !c.back.toLowerCase().includes(term) &&
        !c.courseTitle.toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [unlockedCards, axisFilter, search]);

  function handleRateCard(
    card: FlashCardItem,
    rating: CardReviewState["lastResult"],
    intervalDays: number,
  ) {
    const prev = cardReviews[card.id];
    onRecordReview({
      cardId: card.id,
      intervalDays,
      nextReviewDate: addDaysIso(intervalDays),
      lastResult: rating,
      reviewCount: (prev?.reviewCount || 0) + 1,
    });

    if (reviewingQueue && reviewIdx + 1 < reviewingQueue.length) {
      setReviewIdx((i) => i + 1);
      setShowBack(false);
    } else {
      setReviewingQueue(null);
      setReviewIdx(0);
      setShowBack(false);
    }
  }

  // Modo Sessão de Revisão Espaçada
  if (reviewingQueue && reviewingQueue.length > 0) {
    const card = reviewingQueue[reviewIdx];
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-white px-5 py-3">
          <div>
            <p className="text-xs font-bold text-primary">
              Revisão Espaçada • Cartão {reviewIdx + 1} de{" "}
              {reviewingQueue.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {card.courseCode} — {card.courseTitle}
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={() => {
              setReviewingQueue(null);
              setShowBack(false);
            }}
          >
            Encerrar
          </Button>
        </div>

        <Card className="rounded-3xl border-border bg-white shadow-none">
          <CardContent className="flex min-h-[260px] flex-col justify-between gap-6 p-8">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                {card.axis}
              </span>
              <h3 className="font-display text-xl font-extrabold leading-snug text-foreground">
                {card.front}
              </h3>
            </div>

            {showBack ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Resposta
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground">
                    {card.back}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => handleRateCard(card, "again", 1)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Errei (1d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateCard(card, "hard", 2)}
                    className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-100"
                  >
                    Difícil (2d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateCard(card, "good", 4)}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                  >
                    Bom (4d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateCard(card, "easy", 7)}
                    className="rounded-xl border border-slate-900 bg-slate-900 px-3 py-2.5 text-xs font-bold text-white hover:opacity-90"
                  >
                    Fácil (7d)
                  </button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full rounded-full"
                onClick={() => setShowBack(true)}
              >
                <Eye className="size-4" />
                Mostrar resposta
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const unlockedPct = Math.round(
    (unlockedCards.length / Math.max(1, allCards.length)) * 100,
  );

  return (
    <div className="space-y-6">
      {/* Subtítulo descritivo */}
      <p className="text-xs text-muted-foreground">
        Repetição espaçada dos cartões das suas aulas •{" "}
        <strong className="text-foreground">{dueToday.length} revisões hoje</strong>
      </p>

      {/* Bento Topo: Tudo em dia / Revisar + Coleção / Acerto / Próximos 7 dias */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="rounded-2xl border-border bg-white shadow-none lg:col-span-7">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                {dueToday.length === 0 ? "Tudo em dia" : "Revisões de hoje"}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold tabular-nums text-foreground">
                  {dueToday.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {dueToday.length === 1 ? "cartão" : "cartões"} • ~
                  {Math.max(1, Math.ceil(dueToday.length * 0.5))} min
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {unlockedCards.length === 0
                  ? "Conclua aulas para ganhar novos cartões."
                  : dueToday.length === 0
                    ? "Você revisou todos os cartões programados para hoje!"
                    : "Revise agora para fixar fórmulas e conceitos na memória de longo prazo."}
              </p>

              <div className="pt-2">
                {dueToday.length > 0 ? (
                  <Button
                    className="rounded-full"
                    onClick={() => {
                      setReviewingQueue(dueToday);
                      setReviewIdx(0);
                      setShowBack(false);
                    }}
                  >
                    <Play className="size-3.5 fill-current" />
                    Iniciar revisão ({dueToday.length})
                  </Button>
                ) : unlockedCards.length > 0 ? (
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => {
                      setReviewingQueue(unlockedCards.slice(0, 10));
                      setReviewIdx(0);
                      setShowBack(false);
                    }}
                  >
                    <RotateCcw className="size-3.5" />
                    Praticar coleção mesmo assim
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={onGoToLessons}
                  >
                    Ir para Aulas
                  </Button>
                )}
              </div>
            </div>

            <div className="hidden size-28 shrink-0 items-center justify-center rounded-3xl bg-secondary/70 text-primary sm:flex">
              <Layers className="size-12" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-5">
          <Card className="rounded-2xl border-border bg-white shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-1 p-5 text-center">
              <p className="text-xs font-semibold text-muted-foreground">
                Coleção
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-foreground">
                {unlockedPct}%
              </p>
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {unlockedCards.length}/{allCards.length} desbloqueados
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-white shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-1 p-5 text-center">
              <p className="text-xs font-semibold text-muted-foreground">
                Acerto
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-primary">
                {accuracyStats.pct !== null ? `${accuracyStats.pct}%` : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {accuracyStats.totalReviews > 0
                  ? `${accuracyStats.totalReviews} revisões feitas`
                  : "Aparece após revisar"}
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-2 rounded-2xl border-border bg-white shadow-none">
            <CardContent className="space-y-2.5 p-4">
              <p className="text-xs font-bold text-foreground">
                Próximos 7 dias
              </p>
              <div className="grid grid-cols-7 gap-1 text-center">
                {next7Days.map((d) => (
                  <div key={d.label} className="space-y-1">
                    <p className="text-xs font-bold tabular-nums text-foreground">
                      {d.count}
                    </p>
                    <div
                      className={`mx-auto h-1 w-6 rounded-full ${
                        d.isToday ? "bg-primary" : "bg-slate-200"
                      }`}
                    />
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {d.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Coleção + Painel direito Eixos */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-foreground">
              Coleção • {unlockedCards.length} cartões
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={setSearch}
                placeholder="Buscar nos seus cartões..."
                className="h-9 rounded-full pl-8 text-xs"
              />
            </div>
          </div>

          {filteredCollection.length === 0 ? (
            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="py-10 text-center text-xs text-muted-foreground">
                {unlockedCards.length === 0
                  ? "Conclua aulas para começar sua coleção de cartões."
                  : "Nenhum cartão encontrado para essa busca."}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredCollection.map((card) => {
                const rev = cardReviews[card.id];
                return (
                  <Card
                    key={card.id}
                    className="rounded-2xl border-border bg-white shadow-none"
                  >
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold text-primary">
                          {card.courseCode}
                        </span>
                        {rev ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="size-3" />
                            Próx: {rev.nextReviewDate}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Novo</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-foreground">
                        {card.front}
                      </p>
                      <p className="line-clamp-3 text-xs text-muted-foreground">
                        {card.back}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {lockedCardsCount > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-white px-5 py-3.5 text-xs">
              <span className="flex items-center gap-2 font-semibold text-muted-foreground">
                <Lock className="size-4" />
                {lockedCardsCount} cartões bloqueados em {lockedLessonsCount}{" "}
                aulas
              </span>
              <button
                type="button"
                onClick={onGoToLessons}
                className="font-bold text-primary hover:underline"
              >
                Ver aulas →
              </button>
            </div>
          )}
        </div>

        {/* Painel Direito: Eixos */}
        <div className="lg:col-span-4">
          <Card className="sticky top-20 rounded-2xl border-border bg-white shadow-none">
            <CardContent className="space-y-2 p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Eixos de Matemática
              </p>
              <button
                type="button"
                onClick={() => setAxisFilter("all")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                  axisFilter === "all"
                    ? "bg-secondary text-primary"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <span>Todas</span>
                <span className="tabular-nums">{unlockedCards.length}</span>
              </button>
              {MATH_AXES.map((ax) => {
                const count = unlockedCards.filter((c) => c.axis === ax).length;
                const totalAx = allCards.filter((c) => c.axis === ax).length;
                return (
                  <button
                    key={ax}
                    type="button"
                    onClick={() => setAxisFilter(ax)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                      axisFilter === ax
                        ? "bg-secondary text-primary"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className="truncate">{ax}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {count}/{totalAx}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
