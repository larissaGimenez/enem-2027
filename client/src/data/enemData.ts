import type { CycleInfo, ScheduleDay, TopicItem } from "@/types/study";

export const TARGET_DATE = "2027-11-07";

export const CYCLES: CycleInfo[] = [
  {
    id: "ciclo-1",
    name: "Ciclo 1: O Alicerce",
    period: "Nov/2026 a Fev/2027",
    goal: "Construir o hábito sem pressa e dominar a base (matemática básica, leitura ativa e redação sem pânico).",
  },
  {
    id: "ciclo-2",
    name: "Ciclo 2: A Construção",
    period: "Mar/2027 a Jun/2027",
    goal: "Entrar nos conteúdos clássicos de alta incidência do ENEM e começar exercícios contextualizados.",
  },
  {
    id: "ciclo-3",
    name: "Ciclo 3: Expansão e Prática",
    period: "Jul/2027 a Set/2027",
    goal: "Aprofundar temas de Natureza e Humanas, fazer redações completas quinzenais e simulados parciais.",
  },
  {
    id: "ciclo-4",
    name: "Ciclo 4: Reta Final",
    period: "Out/2027 a Nov/2027",
    goal: "Provas antigas cronometradas, revisão pelo Caderno de Erros e controle emocional. Nada de matéria nova pesada.",
  },
];

export const AREAS = [
  "Matemática",
  "Linguagens / Redação",
  "Ciências Humanas",
  "Ciências da Natureza",
];

export const DEFAULT_SCHEDULE: ScheduleDay[] = [
  { id: "seg", day: "Segunda", subject: "Matemática (Base)", task: "Aula teórica + 5 exercícios de fixação", minutes: 60, done: false, courseId: "m1-0" },
  { id: "ter", day: "Terça", subject: "Linguagens + Redação", task: "Leitura/interpretação + esqueleto de redação", minutes: 60, done: false },
  { id: "qua", day: "Quarta", subject: "Ciências Humanas", task: "História/Geografia + resumo em tópicos", minutes: 60, done: false },
  { id: "qui", day: "Quinta", subject: "Ciências da Natureza", task: "Biologia/Física/Química base + 5 questões", minutes: 60, done: false },
  { id: "sex", day: "Sexta", subject: "Matemática + Revisão", task: "Prática + revisão do Caderno de Erros", minutes: 60, done: false, courseId: "m1-1" },
  { id: "sab", day: "Sábado", subject: "Dia Coringa (Opcional)", task: "Compensar algo da semana ou descansar", minutes: 45, done: false, courseId: "m1-2" },
  { id: "dom", day: "Domingo", subject: "Descanso Total", task: "Zero culpa — recarregar as energias", minutes: 0, done: false },
];

export const TOPICS: TopicItem[] = [
  { id: "m1-1", cycle: "ciclo-1", area: "Matemática", title: "Operações fundamentais e expressões", sub: "Tabuada, sinais, parênteses e potenciação" },
  { id: "m1-2", cycle: "ciclo-1", area: "Matemática", title: "Frações, decimais e porcentagem", sub: "Base para ~30% das questões de matemática do ENEM" },
  { id: "m1-3", cycle: "ciclo-1", area: "Matemática", title: "Razão, proporção e regra de três", sub: "Simples, composta e escalas" },
  { id: "m1-4", cycle: "ciclo-1", area: "Matemática", title: "Equações do 1º grau e sistemas", sub: "Tradução de problemas em equações" },
  { id: "l1-1", cycle: "ciclo-1", area: "Linguagens / Redação", title: "Interpretação de texto e gêneros", sub: "Identificar tese, comando da questão e distratores" },
  { id: "l1-2", cycle: "ciclo-1", area: "Linguagens / Redação", title: "Estrutura da Redação ENEM", sub: "As 5 competências e o esqueleto padrão" },
  { id: "l1-3", cycle: "ciclo-1", area: "Linguagens / Redação", title: "Repertório sociocultural coringa", sub: "Constituição, conceitos de cidadania e repertórios flexíveis" },
  { id: "h1-1", cycle: "ciclo-1", area: "Ciências Humanas", title: "Brasil Colônia e Império (linha do tempo)", sub: "Economia açucareira, mineração e escravidão" },
  { id: "h1-2", cycle: "ciclo-1", area: "Ciências Humanas", title: "Cartografia e Geografia Geral", sub: "Escalas, fusos horários e globalização" },
  { id: "n1-1", cycle: "ciclo-1", area: "Ciências da Natureza", title: "Ecologia básica", sub: "Cadeias alimentares, ciclos biogeoquímicos e impactos" },
  { id: "n1-2", cycle: "ciclo-1", area: "Ciências da Natureza", title: "Grandezas físicas e unidades (SI)", sub: "Conversão de unidades e leitura de gráficos" },
  { id: "n1-3", cycle: "ciclo-1", area: "Ciências da Natureza", title: "Propriedades da matéria e separação de misturas", sub: "Substâncias puras, misturas e métodos de separação" },

  { id: "m2-1", cycle: "ciclo-2", area: "Matemática", title: "Funções do 1º e 2º grau", sub: "Gráficos, raízes, vértice e aplicações" },
  { id: "m2-2", cycle: "ciclo-2", area: "Matemática", title: "Geometria Plana", sub: "Áreas, perímetros, triângulos e Pitágoras" },
  { id: "m2-3", cycle: "ciclo-2", area: "Matemática", title: "Estatística básica", sub: "Média, mediana, moda e leitura de tabelas" },
  { id: "l2-1", cycle: "ciclo-2", area: "Linguagens / Redação", title: "Funções da linguagem e figuras", sub: "Metáfora, ironia, função conativa/referencial" },
  { id: "l2-2", cycle: "ciclo-2", area: "Linguagens / Redação", title: "Desenvolvimento e proposta de intervenção", sub: "Agente, ação, meio, finalidade e detalhamento" },
  { id: "h2-1", cycle: "ciclo-2", area: "Ciências Humanas", title: "Era Vargas e República Populista", sub: "Industrialização, CLT e contexto político" },
  { id: "h2-2", cycle: "ciclo-2", area: "Ciências Humanas", title: "Geografia Agrária e Urbana do Brasil", sub: "Êxodo rural, agronegócio e problemas urbanos" },
  { id: "h2-3", cycle: "ciclo-2", area: "Ciências Humanas", title: "Filosofia e Sociologia: Clássicos", sub: "Iluminismo, contrato social, Durkheim, Weber e Marx" },
  { id: "n2-1", cycle: "ciclo-2", area: "Ciências da Natureza", title: "Citologia e Fisiologia Humana", sub: "Células, sistemas digestório, circulatório e imunológico" },
  { id: "n2-2", cycle: "ciclo-2", area: "Ciências da Natureza", title: "Cinemática e Leis de Newton", sub: "Velocidade média, aceleração, força e atrito" },
  { id: "n2-3", cycle: "ciclo-2", area: "Ciências da Natureza", title: "Estequiometria e Soluções", sub: "Mol, balanceamento e concentração comum" },

  { id: "m3-1", cycle: "ciclo-3", area: "Matemática", title: "Geometria Espacial", sub: "Volume de prismas, cilindros, cones e esferas" },
  { id: "m3-2", cycle: "ciclo-3", area: "Matemática", title: "Probabilidade e Análise Combinatória", sub: "Princípio fundamental da contagem e probabilidade simples" },
  { id: "m3-3", cycle: "ciclo-3", area: "Matemática", title: "Matemática Financeira", sub: "Juros simples, compostos e descontos" },
  { id: "l3-1", cycle: "ciclo-3", area: "Linguagens / Redação", title: "Variação linguística e literatura modernista", sub: "Preconceito linguístico e Semana de 22" },
  { id: "l3-2", cycle: "ciclo-3", area: "Linguagens / Redação", title: "Prática quinzenal de redação completa", sub: "Treinar tempo de 1h15 com revisão crítica" },
  { id: "h3-1", cycle: "ciclo-3", area: "Ciências Humanas", title: "Ditadura Militar e Redemocratização", sub: "AI-5, milagre econômico e Constituição de 1988" },
  { id: "h3-2", cycle: "ciclo-3", area: "Ciências Humanas", title: "Geopolítica e Meio Ambiente", sub: "Conflitos contemporâneos, matriz energética e clima" },
  { id: "n3-1", cycle: "ciclo-3", area: "Ciências da Natureza", title: "Genética e Evolução", sub: "Leis de Mendel, biotecnologia e seleção natural" },
  { id: "n3-2", cycle: "ciclo-3", area: "Ciências da Natureza", title: "Termologia, Óptica e Ondulatória", sub: "Calorimetria, reflexão/refração e fenômenos ondulatórios" },
  { id: "n3-3", cycle: "ciclo-3", area: "Ciências da Natureza", title: "Eletrodinâmica básica", sub: "Corrente, tensão, resistência, potência e consumo em kWh" },
  { id: "n3-4", cycle: "ciclo-3", area: "Ciências da Natureza", title: "Química Orgânica e Ambiental", sub: "Funções orgânicas, pH, chuva ácida e polímeros" },

  { id: "r4-1", cycle: "ciclo-4", area: "Matemática", title: "Provas antigas de Matemática (2019–2026)", sub: "Treinar seleção de questões fáceis/médias (TRI)" },
  { id: "r4-2", cycle: "ciclo-4", area: "Linguagens / Redação", title: "Revisão de conectivos e repertórios", sub: "Deixar redação no piloto automático seguro" },
  { id: "r4-3", cycle: "ciclo-4", area: "Ciências Humanas", title: "Simulados cronometrados Dia 1", sub: "Gerenciar leitura longa (90 questões + redação)" },
  { id: "r4-4", cycle: "ciclo-4", area: "Ciências da Natureza", title: "Simulados cronometrados Dia 2", sub: "Revisar apenas pontos recorrentes do Caderno de Erros" },
];
