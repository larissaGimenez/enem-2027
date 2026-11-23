// Dados estruturados do plano ENEM 2027 (Dez/2026 - Nov/2027)

window.ENEM_DATA = {
  targetDate: "2027-11-07", // Data estimada do 1º domingo de prova em Nov/2027

  cycles: [
    {
      id: "ciclo-1",
      number: 1,
      name: "1. Alicerce",
      period: "Dez/2026 – Fev/2027 (3 meses)",
      focus: "Matemática Básica + Estrutura de Redação + Leitura/Interpretação",
      proportion: "50% Mat. Básica · 30% Redação · 20% Leitura/Base"
    },
    {
      id: "ciclo-2",
      number: 2,
      name: "2. Construção",
      period: "Mar/2027 – Jun/2027 (4 meses)",
      focus: "Núcleo duro do Ensino Médio nas 4 áreas + Redação quinzenal",
      proportion: "35% Mat. · 30% Naturezas · 20% Humanas · 15% Ling./Red."
    },
    {
      id: "ciclo-3",
      number: 3,
      name: "3. Expansão",
      period: "Jul/2027 – Set/2027 (3 meses)",
      focus: "Tópicos intermediários + Questões por assunto + Redação semanal",
      proportion: "30% Mat. · 30% Naturezas · 20% Humanas · 20% Ling./Red."
    },
    {
      id: "ciclo-4",
      number: 4,
      name: "4. Reta Final",
      period: "Out/2027 – Nov/2027 (6–8 semanas)",
      focus: "Simulados cronometrados, revisão de erros, repertório e resistência",
      proportion: "60% Simulados/Revisão · 25% Pontos fracos · 15% Redação"
    }
  ],

  areas: [
    { id: "matematica", name: "Matemática", color: "#2563eb" },
    { id: "redacao", name: "Redação & Linguagens", color: "#9333ea" },
    { id: "humanas", name: "Ciências Humanas", color: "#d97706" },
    { id: "natureza", name: "Ciências da Natureza", color: "#059669" }
  ],

  topics: [
    // CICLO 1 - ALICERCE
    { id: "mat-1", area: "matematica", cycle: "ciclo-1", title: "Operações básicas e expressões numéricas", sub: "Soma, subtração, multiplicação, divisão e ordem de resolução" },
    { id: "mat-2", area: "matematica", cycle: "ciclo-1", title: "Frações e números decimais", sub: "Operações com frações, conversão fração/decimal" },
    { id: "mat-3", area: "matematica", cycle: "ciclo-1", title: "Potenciação e radiciação", sub: "Propriedades básicas e notação científica" },
    { id: "mat-4", area: "matematica", cycle: "ciclo-1", title: "Equações de 1º e 2º grau", sub: "Isolar incógnita, problemas do dia a dia e Bhaskara" },
    { id: "mat-5", area: "matematica", cycle: "ciclo-1", title: "Razão, proporção e escalas", sub: "Escalas de mapas e divisão proporcional" },
    { id: "mat-6", area: "matematica", cycle: "ciclo-1", title: "Regra de três simples e composta", sub: "Grandezas direta e inversamente proporcionais" },
    { id: "mat-7", area: "matematica", cycle: "ciclo-1", title: "Porcentagem", sub: "Cálculo rápido, aumentos e descontos sucessivos" },

    { id: "red-1", area: "redacao", cycle: "ciclo-1", title: "Estrutura dos 4 parágrafos da redação", sub: "Introdução, D1, D2 e Conclusão" },
    { id: "red-2", area: "redacao", cycle: "ciclo-1", title: "Introdução e Tese clara", sub: "Contextualizar o tema e apresentar o ponto de vista" },
    { id: "red-3", area: "redacao", cycle: "ciclo-1", title: "Conectivos e coesão entre parágrafos", sub: "Operadores argumentativos para ligar ideias" },
    { id: "red-4", area: "redacao", cycle: "ciclo-1", title: "Proposta de intervenção (5 elementos)", sub: "Agente, ação, meio/modo, finalidade e detalhamento" },
    { id: "red-5", area: "redacao", cycle: "ciclo-1", title: "Interpretação de texto e gêneros textuais", sub: "Leitura ativa e identificação da ideia central" },

    // CICLO 2 - CONSTRUÇÃO
    { id: "mat-8", area: "matematica", cycle: "ciclo-2", title: "Estatística básica", sub: "Média, moda, mediana e leitura de gráficos/tabelas" },
    { id: "mat-9", area: "matematica", cycle: "ciclo-2", title: "Geometria plana", sub: "Áreas, perímetros, triângulos e Teorema de Pitágoras" },
    { id: "mat-10", area: "matematica", cycle: "ciclo-2", title: "Geometria espacial", sub: "Prismas, cilindros, cones, esferas e volume" },
    { id: "mat-11", area: "matematica", cycle: "ciclo-2", title: "Função afim (1º grau) e quadrática (2º grau)", sub: "Gráficos, raízes, máximo e mínimo" },

    { id: "red-6", area: "redacao", cycle: "ciclo-2", title: "Banco enxuto de repertórios coringa", sub: "3 a 5 referências versáteis (cidadania, história, cultura)" },
    { id: "red-7", area: "redacao", cycle: "ciclo-2", title: "Funções da linguagem e figuras de linguagem", sub: "Como aparecem em poemas, propagandas e tirinhas" },
    { id: "red-8", area: "redacao", cycle: "ciclo-2", title: "Variação linguística", sub: "Norma culta vs. linguagem regional, histórica e social" },

    { id: "hum-1", area: "humanas", cycle: "ciclo-2", title: "História do Brasil: Colônia e Império", sub: "Ciclo do açúcar, mineração, escravidão e abolição" },
    { id: "hum-2", area: "humanas", cycle: "ciclo-2", title: "História do Brasil: República, Era Vargas e Ditadura", sub: "República Velha, Vargas, Regime Militar e Redemocratização" },
    { id: "hum-3", area: "humanas", cycle: "ciclo-2", title: "Geografia Física e Meio Ambiente", sub: "Clima, relevo, biomas do Brasil e impactos ambientais" },
    { id: "hum-4", area: "humanas", cycle: "ciclo-2", title: "Geografia Humana: Urbanização e Agropecuária", sub: "Industrialização, demografia e espaço agrário brasileiro" },
    { id: "hum-5", area: "humanas", cycle: "ciclo-2", title: "Filosofia Antiga e Contratualismo", sub: "Sócrates, Platão, Aristóteles; Hobbes, Locke, Rousseau" },

    { id: "nat-1", area: "natureza", cycle: "ciclo-2", title: "Biologia: Ecologia (Campeã do ENEM)", sub: "Cadeias alimentares, ciclos biogeoquímicos e impactos" },
    { id: "nat-2", area: "natureza", cycle: "ciclo-2", title: "Biologia: Citologia e Saúde Pública", sub: "Organelas básicas, vacinas, vírus e doenças" },
    { id: "nat-3", area: "natureza", cycle: "ciclo-2", title: "Química: Estrutura atômica, tabela e ligações", sub: "Átomos, íons, ligações iônicas/covalentes e polaridade" },
    { id: "nat-4", area: "natureza", cycle: "ciclo-2", title: "Química: Funções inorgânicas e pH", sub: "Ácidos, bases, sais e óxidos no cotidiano" },
    { id: "nat-5", area: "natureza", cycle: "ciclo-2", title: "Física: Cinemática e Leis de Newton", sub: "Velocidade, aceleração, gráficos, força e energia" },
    { id: "nat-6", area: "natureza", cycle: "ciclo-2", title: "Física: Ondulatória (som e luz)", sub: "Frequência, comprimento de onda e fenômenos ondulatórios" },

    // CICLO 3 - EXPANSÃO
    { id: "mat-12", area: "matematica", cycle: "ciclo-3", title: "Análise combinatória básica", sub: "Princípio fundamental da contagem, arranjo e combinação" },
    { id: "mat-13", area: "matematica", cycle: "ciclo-3", title: "Probabilidade", sub: "Eventos independentes e probabilidade condicional simples" },
    { id: "mat-14", area: "matematica", cycle: "ciclo-3", title: "Progressões (PA e PG) e Trigonometria básica", sub: "Termo geral e triângulo retângulo" },
    { id: "mat-15", area: "matematica", cycle: "ciclo-3", title: "Noções de função exponencial e logarítmica", sub: "Crescimento/decrescimento e leitura de gráficos" },

    { id: "red-9", area: "redacao", cycle: "ciclo-3", title: "Movimentos literários brasileiros", sub: "Do Quinhentismo ao Modernismo e literatura contemporânea" },
    { id: "red-10", area: "redacao", cycle: "ciclo-3", title: "Arte, cultura corporal e Língua Estrangeira", sub: "Leitura instrumental (Inglês ou Espanhol) e arte moderna" },

    { id: "hum-6", area: "humanas", cycle: "ciclo-3", title: "História Geral: Antiguidade, Idade Média e Moderna", sub: "Grécia, Roma, feudalismo, Renascimento e Iluminismo" },
    { id: "hum-7", area: "humanas", cycle: "ciclo-3", title: "Revolução Industrial, Guerras e Guerra Fria", sub: "Capitalismo industrial, séc. XX e geopolítica" },
    { id: "hum-8", area: "humanas", cycle: "ciclo-3", title: "Cartografia, fusos horários e Globalização", sub: "Coordenadas, projeções e blocos econômicos" },
    { id: "hum-9", area: "humanas", cycle: "ciclo-3", title: "Sociologia: Cultura, Trabalho e Cidadania", sub: "Movimentos sociais, indústria cultural e direitos" },

    { id: "nat-7", area: "natureza", cycle: "ciclo-3", title: "Biologia: Genética básica, Evolução e Fisiologia", sub: "Leis de Mendel, seleção natural e sistemas do corpo" },
    { id: "nat-8", area: "natureza", cycle: "ciclo-3", title: "Química: Estequiometria, Soluções e Termoquímica", sub: "Cálculo de mols, concentrações e calor nas reações" },
    { id: "nat-9", area: "natureza", cycle: "ciclo-3", title: "Química: Eletroquímica e Química Orgânica", sub: "Pilhas, cadeias carbônicas e funções orgânicas" },
    { id: "nat-10", area: "natureza", cycle: "ciclo-3", title: "Física: Termologia, Óptica e Eletrodinâmica", sub: "Calorimetria, espelhos/lentes, corrente, tensão e potência" },

    // CICLO 4 - RETA FINAL
    { id: "ret-1", area: "matematica", cycle: "ciclo-4", title: "Simulado de Matemática cronometrado (45 questões)", sub: "Treinar gestão de tempo e pular questões difíceis" },
    { id: "ret-2", area: "redacao", cycle: "ciclo-4", title: "Redação semanal em 1h–1h15", sub: "Lapidar argumentação e evitar repetições" },
    { id: "ret-3", area: "humanas", cycle: "ciclo-4", title: "Simulado Dia 1 (Linguagens + Humanas + Redação)", sub: "Treinar resistência de 5h30 de leitura" },
    { id: "ret-4", area: "natureza", cycle: "ciclo-4", title: "Simulado Dia 2 (Natureza + Matemática)", sub: "Revisar caderno de erros e fórmulas essenciais" }
  ],

  defaultSchedule: [
    { day: "Segunda", subject: "Matemática Básica", task: "1 microtópico + 5 a 8 questões", duration: 60, done: false },
    { day: "Terça", subject: "Redação", task: "Ler tema + planejar tese e estrutura", duration: 60, done: false },
    { day: "Quarta", subject: "Matemática Básica", task: "Continuar tópico + analisar erros", duration: 60, done: false },
    { day: "Quinta", subject: "Leitura & Interpretação", task: "Questões de Linguagens / leitura ativa", duration: 45, done: false },
    { day: "Sexta", subject: "Redação / Revisão", task: "Escrever parágrafos ou revisar caderno de erros", duration: 60, done: false },
    { day: "Sábado", subject: "Dia Coringa", task: "Repor o que faltou na semana ou descansar", duration: 45, done: false },
    { day: "Domingo", subject: "Descanso", task: "Pausa livre para recarregar energia", duration: 0, done: false }
  ]
};
