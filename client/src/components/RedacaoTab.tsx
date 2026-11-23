import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  Lightbulb,
  PenLine,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/motion/button";
import { Card, CardContent } from "@/components/motion/card";
import type { EssayEntry } from "@/types/study";

interface RedacaoTabProps {
  essays: EssayEntry[];
  onAddEssay: (entry: EssayEntry) => void;
  onDeleteEssay: (id: string) => void;
}

type RedacaoView = "write" | "history" | "themes";

const COMPETENCIAS = [
  {
    key: "c1" as const,
    code: "C1",
    name: "Norma culta",
    desc: "Gramática, ortografia, pontuação e registro formal.",
  },
  {
    key: "c2" as const,
    code: "C2",
    name: "Tema e repertório",
    desc: "Compreensão do tema, estrutura dissertativa e repertório sociocultural.",
  },
  {
    key: "c3" as const,
    code: "C3",
    name: "Projeto de texto",
    desc: "Seleção, organização e defesa clara dos argumentos.",
  },
  {
    key: "c4" as const,
    code: "C4",
    name: "Coesão",
    desc: "Uso variado de conectivos entre parágrafos e frases.",
  },
  {
    key: "c5" as const,
    code: "C5",
    name: "Intervenção",
    desc: "Proposta respeitando direitos humanos com os 5 elementos.",
  },
];

const SCORE_STEPS = [0, 40, 80, 120, 160, 200];

const C5_ELEMENTS = [
  { id: "agente", label: "Agente (quem faz?)" },
  { id: "acao", label: "Ação (o que será feito?)" },
  { id: "meio", label: "Meio / Modo (como?)" },
  { id: "efeito", label: "Finalidade (para quê?)" },
  { id: "detalhe", label: "Detalhamento de um elemento" },
];

const ENEM_THEMES = [
  {
    axis: "Tecnologia & Sociedade",
    title:
      "Os impactos da inteligência artificial e dos algoritmos na formação do pensamento crítico no Brasil",
    repertoire:
      "Byung-Chul Han (Sociedade do Cansaço) • Marco Civil da Internet • Zygmunt Bauman",
  },
  {
    axis: "Saúde Pública",
    title:
      "Desafios para a promoção da saúde mental entre jovens no ambiente escolar brasileiro",
    repertoire:
      "Constituição Federal Art. 196 • OMS • Émile Durkheim (fato social)",
  },
  {
    axis: "Meio Ambiente",
    title:
      "Caminhos para enfrentar os eventos climáticos extremos e o racismo ambiental nas cidades brasileiras",
    repertoire:
      "Ailton Krenak (Ideias para adiar o fim do mundo) • Constituição Art. 225 • Agenda 2030 ONU",
  },
  {
    axis: "Invisibilidade Social",
    title:
      "A invisibilidade do trabalho informal e os desafios para a garantia de direitos trabalhistas no Brasil",
    repertoire:
      "Jessé Souza • Consolidação das Leis do Trabalho (CLT) • Declaração Universal dos Direitos Humanos",
  },
  {
    axis: "Educação & Cultura",
    title:
      "O papel da leitura e das bibliotecas públicas na redução das desigualdades educacionais",
    repertoire:
      "Paulo Freire • Antonio Candido (O direito à literatura) • Constituição Art. 205",
  },
  {
    axis: "Mobilidade & Cidades",
    title:
      "Desafios para democratizar o transporte público sustentável nos grandes centros urbanos",
    repertoire:
      "Milton Santos (Por uma outra globalização) • Estatuto da Cidade",
  },
];

const UNICAMP_GENRES = [
  "Carta Aberta",
  "Artigo de Opinião",
  "Discurso",
  "Manifesto",
  "Crônica",
  "Reportagem",
];

const UNICAMP_THEMES = [
  {
    genre: "Carta Aberta",
    title:
      "Carta aberta à direção escolar sobre o uso ético de Inteligência Artificial nas atividades acadêmicas",
    repertoire:
      "Interlocutor claro (comunidade escolar) • Saudação, argumentação com exemplos concretos e despedida formal.",
  },
  {
    genre: "Artigo de Opinião",
    title:
      "Precarização e algoritmos: o trabalho por aplicativos garante autonomia ou aprofunda vulnerabilidades?",
    repertoire:
      "Título chamativo • Tese explícita • Dados e contra-argumentação • Assinatura (pseudônimo se solicitado).",
  },
  {
    genre: "Manifesto",
    title:
      "Manifesto pela acessibilidade digital e inclusão tecnológica nos serviços públicos brasileiros",
    repertoire:
      "Tom engajado e coletivo ('Nós') • Reivindicações objetivas • Chamado à ação.",
  },
  {
    genre: "Discurso",
    title:
      "Discurso em audiência pública sobre emergência climática e planejamento urbano sustentável",
    repertoire:
      "Vocativo inicial ('Senhoras e senhores...') • Marcas de oralidade culta • Fechamento impactante.",
  },
];

const UNICAMP_CHECKLIST = [
  { id: "genero", label: "Estrutura fiel ao gênero pedido" },
  { id: "interlocutor", label: "Interlocutor e situação bem definidos" },
  { id: "coletanea", label: "Leitura produtiva da coletânea" },
  { id: "registro", label: "Registro adequado (formal/semiformal)" },
];

export function RedacaoTab({
  essays,
  onAddEssay,
  onDeleteEssay,
}: RedacaoTabProps) {
  const [view, setView] = useState<RedacaoView>("write");
  const [examModel, setExamModel] = useState<"enem" | "unicamp">("enem");
  const [genre, setGenre] = useState("Carta Aberta");
  const [unicampScore, setUnicampScore] = useState(38);
  const [theme, setTheme] = useState("");
  const [stage, setStage] = useState("Versão final");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [essayText, setEssayText] = useState("");
  const [scores, setScores] = useState({
    c1: 160,
    c2: 160,
    c3: 160,
    c4: 160,
    c5: 160,
  });
  const [c5Checks, setC5Checks] = useState<Record<string, boolean>>({});
  const [includeScore, setIncludeScore] = useState(true);

  const totalScore = scores.c1 + scores.c2 + scores.c3 + scores.c4 + scores.c5;

  const wordCount = useMemo(() => {
    const trimmed = essayText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [essayText]);

  const estimatedLines = Math.ceil(wordCount / 11);

  const stats = useMemo(() => {
    const scored = essays.filter((e) => typeof e.totalScore === "number");
    const avg =
      scored.length > 0
        ? Math.round(
            scored.reduce((acc, e) => acc + (e.totalScore || 0), 0) /
              scored.length,
          )
        : null;
    const latest = scored[0]?.totalScore ?? null;

    const compAverages = COMPETENCIAS.map((c) => {
      const withComp = scored.filter((e) => typeof e[c.key] === "number");
      const val =
        withComp.length > 0
          ? Math.round(
              withComp.reduce((acc, e) => acc + (e[c.key] || 0), 0) /
                withComp.length,
            )
          : 0;
      return { ...c, avg: val };
    });

    return { total: essays.length, avg, latest, compAverages };
  }, [essays]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!theme.trim()) return;

    const entry: EssayEntry = {
      id: `essay-${Date.now()}`,
      theme: theme.trim(),
      stage,
      date,
      notes: notes.trim(),
      examModel,
      genre: examModel === "unicamp" ? genre : undefined,
      text: essayText.trim() || undefined,
      ...(includeScore
        ? examModel === "enem"
          ? {
              c1: scores.c1,
              c2: scores.c2,
              c3: scores.c3,
              c4: scores.c4,
              c5: scores.c5,
              totalScore,
            }
          : { totalScore: unicampScore }
        : {}),
    };

    onAddEssay(entry);
    setTheme("");
    setNotes("");
    setEssayText("");
    setC5Checks({});
    setView("history");
  }

  return (
    <div className="space-y-6">
      {/* KPIs + Painel Obsidian das 5 Competências */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="grid grid-cols-3 gap-4 lg:col-span-6">
          <Card className="rounded-2xl border-border bg-white shadow-none">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground">
                Redações
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-foreground">
                {stats.total}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                registradas
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-white shadow-none">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground">
                Última nota
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-primary">
                {stats.latest !== null ? stats.latest : "—"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                de 1.000 pts
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-white shadow-none">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground">
                Média geral
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-foreground">
                {stats.avg !== null ? stats.avg : "—"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                meta 900+
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="surface-obsidian rounded-2xl border-0 shadow-none lg:col-span-6">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Média por competência (0–200)
              </p>
              <span className="text-[11px] text-slate-400">Matriz ENEM</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {stats.compAverages.map((c) => (
                <div
                  key={c.code}
                  className="rounded-xl bg-white/10 p-2.5 text-center"
                >
                  <p className="text-[11px] font-bold text-emerald-300">
                    {c.code}
                  </p>
                  <p className="mt-0.5 font-display text-lg font-extrabold tabular-nums text-white">
                    {c.avg || "—"}
                  </p>
                  <p className="truncate text-[10px] text-slate-300">
                    {c.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-abas */}
      <div className="inline-flex rounded-full border border-border bg-white p-1">
        {(
          [
            { id: "write", label: "Escrever / Registrar", icon: PenLine },
            {
              id: "history",
              label: `Minhas redações (${essays.length})`,
              icon: FileText,
            },
            { id: "themes", label: "Banco de temas", icon: Lightbulb },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setView(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                view === t.id
                  ? "bg-slate-900 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ABA 1: ESCREVER / REGISTRAR */}
      {view === "write" && (
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Esquerda: Tema + Texto + Repertórios */}
          <div className="space-y-4 lg:col-span-8">
            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="inline-flex rounded-full bg-muted p-1">
                    <button
                      type="button"
                      onClick={() => setExamModel("enem")}
                      className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                        examModel === "enem"
                          ? "bg-slate-900 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Modelo ENEM (0–1000)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamModel("unicamp")}
                      className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                        examModel === "unicamp"
                          ? "bg-slate-900 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Modelo Unicamp COMVEST (0–48)
                    </button>
                  </div>

                  {examModel === "unicamp" && (
                    <select
                      aria-label="Gênero textual Unicamp"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="h-8 rounded-full border border-border bg-secondary/70 px-3 text-xs font-bold text-primary"
                    >
                      {UNICAMP_GENRES.map((g) => (
                        <option key={g} value={g}>
                          Gênero: {g}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <div className="space-y-1 sm:col-span-12">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Tema da redação
                      </label>
                      <button
                        type="button"
                        onClick={() => setView("themes")}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Escolher do banco de temas →
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="Ex.: Os desafios para a valorização de comunidades..."
                      className="h-10 w-full rounded-xl border border-border bg-muted/20 px-3 text-sm font-semibold text-foreground focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-7">
                    <label className="text-xs font-bold text-foreground">
                      Estágio
                    </label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-muted/20 px-3 text-xs font-semibold"
                    >
                      <option value="Esqueleto / Projeto de texto">
                        Esqueleto / Projeto de texto
                      </option>
                      <option value="Rascunho">Rascunho</option>
                      <option value="Versão final">Versão final</option>
                      <option value="Corrigida">Corrigida</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-5">
                    <label className="text-xs font-bold text-foreground">
                      Data
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-muted/20 px-3 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Folha de Redação com contador de linhas */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-foreground">
                      Texto da redação (opcional se escreveu no papel)
                    </label>
                    <span
                      className={`text-[11px] font-bold tabular-nums ${
                        estimatedLines > 30
                          ? "text-rose-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {wordCount} palavras • ~{estimatedLines}/30 linhas ENEM
                    </span>
                  </div>
                  <textarea
                    rows={10}
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    placeholder="Escreva ou cole sua redação aqui para acompanhar o tamanho em linhas..."
                    className="w-full rounded-2xl border border-border bg-muted/15 p-4 text-sm leading-relaxed text-foreground focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Repertórios, tese & pontos a melhorar
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex.: Usei Bauman na introdução e Constituição Art. 6º no D1. Preciso detalhar melhor o agente na C5."
                    className="w-full rounded-2xl border border-border bg-muted/15 p-3.5 text-xs leading-relaxed text-foreground focus:bg-white"
                  />
                </div>

                <Button type="submit" className="w-full rounded-full">
                  <Plus className="size-4" />
                  Salvar redação no histórico
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Direita: Autoavaliação C1-C5 + Checklist C5 */}
          <div className="space-y-4 lg:col-span-4">
            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Nota por competência
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Escala oficial ENEM (0 a 200)
                    </p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={includeScore}
                      onChange={(e) => setIncludeScore(e.target.checked)}
                      className="accent-emerald-600"
                    />
                    Incluir nota
                  </label>
                </div>

                {includeScore && (
                  <>
                    <div className="rounded-2xl bg-secondary/70 p-3 text-center">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        {examModel === "enem"
                          ? "Nota total estimada (ENEM)"
                          : "Nota estimada (COMVEST)"}
                      </p>
                      <p className="font-display text-3xl font-extrabold tabular-nums text-primary">
                        {examModel === "enem" ? totalScore : unicampScore}
                        <span className="text-sm font-semibold text-emerald-700">
                          {examModel === "enem" ? "/1000" : "/48"}
                        </span>
                      </p>
                    </div>

                    {examModel === "enem" ? (
                      <div className="space-y-3">
                        {COMPETENCIAS.map((c) => (
                          <div key={c.code} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-foreground">
                                {c.code} • {c.name}
                              </span>
                              <span className="font-bold tabular-nums text-primary">
                                {scores[c.key]}
                              </span>
                            </div>
                            <div className="grid grid-cols-6 gap-1">
                              {SCORE_STEPS.map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() =>
                                    setScores((prev) => ({
                                      ...prev,
                                      [c.key]: val,
                                    }))
                                  }
                                  className={`rounded-lg py-1 text-[10px] font-bold tabular-nums transition-colors ${
                                    scores[c.key] === val
                                      ? "bg-slate-900 text-white"
                                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>Pontuação COMVEST (0 a 48)</span>
                          <span className="text-primary tabular-nums">{unicampScore} pts</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={48}
                          value={unicampScore}
                          onChange={(e) => setUnicampScore(Number(e.target.value))}
                          className="w-full accent-emerald-600"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Avalia: Proposta/Gênero (12) + Leitura (12) + Articulação (12) + Estilo (12).
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Checklist dos 5 elementos da C5 */}
            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-foreground">
                    {examModel === "enem"
                      ? "Checklist C5 (200 pts)"
                      : `Checklist Unicamp (${genre})`}
                  </h3>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-primary tabular-nums">
                    {Object.values(c5Checks).filter(Boolean).length}/
                    {examModel === "enem" ? 5 : 4}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {examModel === "enem"
                    ? "Para garantir 200 na Proposta de Intervenção, confira os 5 elementos:"
                    : "Critérios-chave da banca COMVEST para o gênero escolhido:"}
                </p>
                <div className="space-y-1.5">
                  {(examModel === "enem" ? C5_ELEMENTS : UNICAMP_CHECKLIST).map((el) => {
                    const checked = Boolean(c5Checks[el.id]);
                    return (
                      <button
                        key={el.id}
                        type="button"
                        onClick={() =>
                          setC5Checks((prev) => ({
                            ...prev,
                            [el.id]: !prev[el.id],
                          }))
                        }
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium hover:bg-muted/50"
                      >
                        {checked ? (
                          <CheckCircle2 className="size-4 shrink-0 text-primary" />
                        ) : (
                          <Circle className="size-4 shrink-0 text-slate-300" />
                        )}
                        <span
                          className={
                            checked
                              ? "text-foreground line-through opacity-70"
                              : "text-foreground"
                          }
                        >
                          {el.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      )}

      {/* ABA 2: MINHAS REDAÇÕES */}
      {view === "history" && (
        <div className="space-y-3">
          {essays.length === 0 ? (
            <Card className="rounded-2xl border-border bg-white shadow-none">
              <CardContent className="space-y-3 py-12 text-center">
                <BookOpen className="mx-auto size-8 text-primary" />
                <h3 className="font-display text-base font-bold text-foreground">
                  Nenhuma redação registrada ainda
                </h3>
                <p className="text-xs text-muted-foreground">
                  Escolha um tema no Banco de Temas ou registre sua primeira redação.
                </p>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => setView("write")}
                >
                  Escrever primeira redação
                </Button>
              </CardContent>
            </Card>
          ) : (
            essays.map((es) => (
              <Card
                key={es.id}
                className="rounded-2xl border-border bg-white shadow-none"
              >
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 font-bold text-primary">
                          {es.stage}
                        </span>
                        <span className="text-muted-foreground">{es.date}</span>
                        {typeof es.totalScore === "number" && (
                          <span className="rounded-full bg-slate-900 px-2.5 py-0.5 font-bold text-white tabular-nums">
                            {es.totalScore}/1000
                          </span>
                        )}
                      </div>
                      <h4 className="font-display text-base font-bold text-foreground">
                        {es.theme}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteEssay(es.id)}
                      title="Excluir redação"
                      className="inline-flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {typeof es.c1 === "number" && (
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                      {(["c1", "c2", "c3", "c4", "c5"] as const).map(
                        (k, idx) => (
                          <span
                            key={k}
                            className="rounded-lg bg-muted/60 px-2 py-0.5 text-foreground tabular-nums"
                          >
                            C{idx + 1}: {es[k]}
                          </span>
                        ),
                      )}
                    </div>
                  )}

                  {es.notes && (
                    <p className="rounded-xl bg-muted/35 p-3 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {es.notes}
                    </p>
                  )}

                  {es.text && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-bold text-primary hover:underline">
                        Ler texto completo
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap rounded-xl border border-border bg-white p-4 leading-relaxed text-slate-700">
                        {es.text}
                      </p>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ABA 3: BANCO DE TEMAS (ENEM + UNICAMP COMVEST) */}
      {view === "themes" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-display text-base font-extrabold text-foreground">
              Propostas Unicamp (COMVEST — Gêneros Textuais)
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {UNICAMP_THEMES.map((item) => (
                <Card
                  key={item.title}
                  className="rounded-2xl border-emerald-200/80 bg-white shadow-none"
                >
                  <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                        COMVEST • {item.genre}
                      </span>
                      <h4 className="font-display text-base font-bold leading-snug text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        <strong>O que a banca espera:</strong> {item.repertoire}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      className="w-full rounded-full"
                      onClick={() => {
                        setExamModel("unicamp");
                        setGenre(item.genre);
                        setTheme(item.title);
                        setNotes(`Gênero: ${item.genre} • ${item.repertoire}`);
                        setView("write");
                      }}
                    >
                      <PenLine className="size-3.5" />
                      Treinar gênero ({item.genre})
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-base font-extrabold text-foreground">
              Temas ENEM (Dissertativo-Argumentativo)
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {ENEM_THEMES.map((item) => (
                <Card
                  key={item.title}
                  className="rounded-2xl border-border bg-white shadow-none"
                >
                  <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-primary">
                        <Sparkles className="size-3" />
                        {item.axis}
                      </span>
                      <h4 className="font-display text-base font-bold leading-snug text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        <strong>Repertórios sugeridos:</strong> {item.repertoire}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      className="w-full rounded-full"
                      onClick={() => {
                        setExamModel("enem");
                        setTheme(item.title);
                        setNotes(`Repertórios base: ${item.repertoire}`);
                        setView("write");
                      }}
                    >
                      <PenLine className="size-3.5" />
                      Usar este tema
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
