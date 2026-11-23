import type { MathCourseItem } from "@/data/mathCurriculum";

export interface LessonSection {
  heading: string;
  body: string;
}

export interface WorkedExample {
  prompt: string;
  solution: string[];
  answer: string;
}

export interface LessonTheory {
  intro: string;
  sections: LessonSection[];
  example: WorkedExample;
  keyFormulas: string[];
}

const CUSTOM_LESSONS: Record<string, LessonTheory> = {
  "m1-0": {
    intro:
      "Antes de decorar fórmulas complexas, seu cérebro precisa de agilidade com os números. Todas as 45 questões de Matemática do ENEM exigem contas — dominar cálculo mental reduz o cansaço e libera tempo para raciocinar.",
    sections: [
      {
        heading: "1. Complementaridade e Arredondar & Corrigir",
        body: "Nosso cérebro soma e subtrai muito mais rápido com múltiplos de 10, 100 e 1.000. Em vez de armar conta para 3.150 - 600, tire 100 (chega em 3.050) e depois tire 500 (chega em 2.550). Para somar 87 + 46, complete o 87 para 90 (+3) e some o restante 43 → 133.",
      },
      {
        heading: "2. Multiplicação Mental por Distributiva",
        body: "Quebre números grandes em dezenas + unidades. Exemplo: 7 × 14 = 7 × (10 + 4) = 70 + 28 = 98. Outro exemplo clássico de prova: 16 × 12 = 16 × (10 + 2) = 160 + 32 = 192.",
      },
      {
        heading: "3. Fatiamento de Divisões",
        body: "Dividir por um número composto é o mesmo que dividir em etapas pelos seus fatores. Para fazer 72 ÷ 6, pense que 6 = 2 × 3: primeiro faça 72 ÷ 2 = 36, depois 36 ÷ 3 = 12.",
      },
    ],
    example: {
      prompt: "Calcule mentalmente o custo de 16 kits escolares a R$ 12,00 cada, e depois divida o total igualmente entre 6 turmas.",
      solution: [
        "16 × 12 = 16 × (10 + 2) = 160 + 32 = 192.",
        "Agora divida 192 por 6 fatiando em ÷2 e ÷3:",
        "192 ÷ 2 = 96; em seguida 96 ÷ 3 = 32.",
      ],
      answer: "Total R$ 192,00 (R$ 32,00 por turma).",
    },
    keyFormulas: [
      "a × (b + c) = a·b + a·c (Distributiva mental)",
      "x ÷ (p·q) = (x ÷ p) ÷ q (Fatiamento)",
      "0,1 = 0,10 = 0,100 (Zeros à direita não alteram o decimal)",
    ],
  },
  "m1-1": {
    intro:
      "Os números primos são os 'átomos' da aritmética: qualquer número inteiro maior que 1 pode ser desmontado de uma única forma em produto de fatores primos (Teorema Fundamental da Aritmética). Dominar essa decomposição resolve MMC, MDC e divisores sem decoreba.",
    sections: [
      {
        heading: "1. Racionais vs. Irracionais",
        body: "Números racionais podem ser escritos como fração a/b (inteiros, decimais exatos e dízimas periódicas). Números irracionais possuem infinitas casas decimais sem padrão de repetição (como π ≈ 3,14159... e √2 ≈ 1,4142...).",
      },
      {
        heading: "2. MMC — Quando usar e como calcular",
        body: "O Mínimo Múltiplo Comum responde perguntas de ENCONTROS PERIÓDICOS (remédios de 3h em 3h e 4h em 4h) ou de IGUALAR PACOTES (comprar a menor quantidade igual de itens em pacotes de tamanhos diferentes). Decomponha os números em fatores primos e junte todos os fatores com o MAIOR expoente.",
      },
      {
        heading: "3. MDC — Quando usar e como calcular",
        body: "O Máximo Divisor Comum responde perguntas de DIVIDIR EM GRUPOS/LISTAS IGUAIS sem misturar categorias e sem sobrar ninguém. Decomponha em fatores primos e pegue apenas a INTERSEÇÃO (fatores comuns com o menor expoente).",
      },
    ],
    example: {
      prompt: "Uma escola tem 70 meninas e 90 meninos e quer formar equipes com o mesmo número de integrantes, sem misturar grupos, com a maior quantidade possível de alunos por equipe.",
      solution: [
        "Decomposição em fatores primos: 70 = 2 × 5 × 7 e 90 = 2 × 3² × 5.",
        "Fatores comuns aos dois (interseção): 2 e 5 → MDC(70, 90) = 2 × 5 = 10 alunos por equipe.",
        "Quantidade de equipes: 70 ÷ 10 = 7 equipes de meninas e 90 ÷ 10 = 9 equipes de meninos (16 equipes no total).",
      ],
      answer: "10 integrantes por equipe (7 + 9 = 16 equipes).",
    },
    keyFormulas: [
      "MMC = todos os fatores primos com MAIOR expoente",
      "MDC = apenas fatores primos COMUNS com MENOR expoente",
      "MMC(a, b) × MDC(a, b) = a × b",
    ],
  },
  "m1-2": {
    intro:
      "Frações e Porcentagem são o coração da Matemática do ENEM. Quase todas as manipulações de frações nascem de um único princípio: multiplicar qualquer número por 1 não altera seu valor (a · 1 = a), só muda a forma como o escrevemos.",
    sections: [
      {
        heading: "1. Princípio Multiplicativo do 1 em Frações",
        body: "Para somar 3/5 + 7/3 sem decorar regras, basta colocar no mesmo denominador multiplicando cada fração por uma forma inteligente do número 1: multiplique 3/5 por 3/3 (= 9/15) e 7/3 por 5/5 (= 35/15). Somando os numeradores: 44/15.",
      },
      {
        heading: "2. Fração Geratriz de Dízimas Periódicas",
        body: "Para transformar x = 0,9414141... em fração, use o Princípio de Euclides (faça a mesma operação nos dois lados): multiplique por 10 (10x = 9,4141...) e por 1000 (1000x = 941,4141...). Subtraindo as duas equações, a parte infinita cancela: 990x = 932 → x = 932/990 = 466/495.",
      },
      {
        heading: "3. Porcentagem Rápida e Fatores Diretos",
        body: "Use blocos mentais (10% = ÷10, 5% = metade de 10%) e a propriedade comutativa: x% de y = y% de x (28% de 25 é o mesmo que 25% de 28 = 7!). Para calcular o valor final direto sem etapa intermediária, multiplique pelo fator: aumento de 20% = × 1,20; desconto de 20% = × 0,80.",
      },
      {
        heading: "4. Aumentos e Descontos Sucessivos",
        body: "Nunca some ou subtraia porcentagens sucessivas! Multiplique os fatores. Um aumento de 20% seguido de desconto de 20% resulta em 1,20 × 0,80 = 0,96 (queda real de 4%, não volta ao preço original).",
      },
    ],
    example: {
      prompt: "Uma loja vende uma geladeira com 80% de lucro sobre o custo. Na promoção, dá 40% de desconto sobre o preço de venda. Qual é o lucro percentual final?",
      solution: [
        "Como não há valor em reais, chute o preço de custo = 100.",
        "Preço normal com +80% de lucro: 100 × 1,80 = 180.",
        "Na promoção com -40% de desconto (paga 60%): 180 × 0,60 = 108.",
        "Comprou por 100 e vendeu por 108 → lucro líquido de 8%.",
      ],
      answer: "Lucro de 8% (e não 80% - 40% = 40%!).",
    },
    keyFormulas: [
      "x% de y = y% de x",
      "Aumento de i%: V_final = V_inicial × (1 + i)",
      "Desconto de i%: V_final = V_inicial × (1 - i)",
    ],
  },
  "m1-3": {
    intro:
      "Razão e Proporção aparecem em mais de 60% da prova do ENEM (escalas, regras de três, gráficos, física e química). O segredo é saber distinguir com clareza GDP (razão constante) de GIP (produto constante).",
    sections: [
      {
        heading: "1. Grandezas Diretamente Proporcionais (GDP)",
        body: "Não basta dizer 'uma sobe e a outra sobe': elas precisam crescer na MESMA proporção (se uma dobra, a outra dobra), mantendo a RAZÃO constante (y/x = k → y = k·x). O gráfico de uma GDP é SEMPRE uma reta passando pela origem (0,0).",
      },
      {
        heading: "2. Grandezas Inversamente Proporcionais (GIP)",
        body: "Quando uma dobra, a outra cai pela metade, mantendo o PRODUTO constante (x·y = k → y = k/x). Exemplo: velocidade × tempo numa viagem de 360 km. Como nenhuma das duas chega a zero, o gráfico é um RAMO DE HIPÉRBOLE que se aproxima dos eixos sem nunca tocá-los.",
      },
      {
        heading: "3. Escalas Linear, Superficial e Volumétrica",
        body: "Escala linear é E = medida no desenho / medida real (na mesma unidade!). Se o problema falar em ÁREA, use E². Se falar em VOLUME ou capacidade, use E³.",
      },
    ],
    example: {
      prompt: "Em uma viagem de 360 km, um carro a 60 km/h leva 6 horas. Se aumentar a velocidade para 90 km/h, quanto tempo levará?",
      solution: [
        "Velocidade e tempo são inversamente proporcionais (produto constante: v · t = 360).",
        "60 × 6 = 360, logo 90 × t = 360 → t = 360 ÷ 90 = 4 horas.",
      ],
      answer: "4 horas (velocidade ×1,5 → tempo ÷1,5).",
    },
    keyFormulas: [
      "GDP: y / x = k  (Gráfico: reta passando pela origem)",
      "GIP: x · y = k  (Gráfico: ramo de hipérbole)",
      "Escala: E = d / D  |  Área: E²  |  Volume: E³",
    ],
  },
  "m1-4": {
    intro:
      "Resolver equações não é 'passar para o outro lado trocando sinal' por mágica — é aplicar o Princípio de Euclides: 'se iguais são feitos a iguais, eles permanecem iguais'. Qualquer operação feita de um lado vale se feita igual do outro.",
    sections: [
      {
        heading: "1. Princípio de Euclides na Prática",
        body: "Em 3x - 1 = 4, somamos 1 dos dois lados para anular o -1 (3x = 5), e dividimos os dois lados por 3 (x = 5/3). Com essa lógica, você nunca trava em equações com frações ou letras.",
      },
      {
        heading: "2. Eliminando Denominadores em 1 Passo",
        body: "Se uma equação tem frações (ex.: 2x/5 - 2 = x/10), multiplique TODOS os termos dos dois lados por 10. Os denominadores desaparecem instantaneamente: 4x - 20 = x → 3x = 20 → x = 20/3.",
      },
      {
        heading: "3. Sistemas Lineares 2×2",
        body: "No ENEM, quase todo sistema sai rápido por Substituição (isole a letra mais simples) ou Adição (multiplique uma equação para cancelar uma incógnita ao somar).",
      },
    ],
    example: {
      prompt: "Resolva a equação 2x/5 - 2 = x/10 sem tirar MMC.",
      solution: [
        "Multiplique ambos os lados por 10 (múltiplo de 5 e 10):",
        "10·(2x/5) - 10·2 = 10·(x/10)  →  4x - 20 = x.",
        "Subtraia x e some 20 dos dois lados: 3x = 20  →  x = 20/3.",
      ],
      answer: "x = 20/3.",
    },
    keyFormulas: [
      "Princípio de Euclides: A = B ⇒ A + c = B + c  e  A·c = B·c",
      "Inequação: multiplicar/dividir por número negativo INVERTE o sinal (< vira >)",
    ],
  },
  "m1-6": {
    intro:
      "Muitas questões fáceis do ENEM são perdidas apenas por unidade de medida errada. Além das conversões métricas, a Análise Dimensional permite descobrir a fórmula ou unidade correta só lendo o texto.",
    sections: [
      {
        heading: "1. Escada Métrica e Litros",
        body: "Comprimento salta de 10 em 10 (1 m = 100 cm). Área salta de 100 em 100 (1 m² = 10.000 cm²). Volume salta de 1.000 em 1.000. Guarde as 3 equivalências de ouro: 1 m³ = 1.000 L, 1 dm³ = 1 L e 1 cm³ = 1 mL.",
      },
      {
        heading: "2. Análise Dimensional (Macete de Prova)",
        body: "Diretamente proporcional fica sempre no NUMERADOR (em cima). Inversamente proporcional e tudo que vier depois da palavra 'POR' ficam no DENOMINADOR (embaixo). Falou 'área' = unidade²; falou 'volume' = unidade³.",
      },
    ],
    example: {
      prompt: "A potência radiante é diretamente proporcional à energia (J) e inversamente proporcional ao tempo (s). Qual é a unidade da potência radiante POR unidade de área (m²)?",
      solution: [
        "Potência radiante: Energia (em cima) ÷ Tempo (embaixo) = J / s.",
        "'Por unidade de área' significa dividir por m² (entra no denominador).",
        "Resultado final: J / (s · m²).",
      ],
      answer: "J / (s · m²).",
    },
    keyFormulas: [
      "1 m³ = 1.000 L  |  1 dm³ = 1 L  |  1 cm³ = 1 mL",
      "Diretamente = Numerador  |  Inversamente ou 'por' = Denominador",
    ],
  },
  "m2-1": {
    intro:
      "A Função Afim f(x) = ax + b modela qualquer situação que tenha um valor fixo e uma taxa constante de crescimento ou queda (corrida de táxi, custo de produção, conta de luz).",
    sections: [
      {
        heading: "1. Interpretando a e b",
        body: "'b' é o valor fixo (onde o gráfico corta o eixo y, quando x = 0). 'a' é a taxa de variação (quanto y muda a cada +1 unidade de x): a = Δy / Δx = (y2 - y1) / (x2 - x1).",
      },
      {
        heading: "2. Macete da Variação Linear por Blocos",
        body: "Quando o texto disser que o custo cresce linearmente, você não precisa montar sistema! Calcule quanto custou um bloco (Δx) e some ou subtraia esse bloco diretamente do valor mais próximo dado na tabela.",
      },
    ],
    example: {
      prompt: "O custo linear de produção é R$ 1.050 para 30 mochilas, R$ 1.650 para 50 mochilas e R$ 3.150 para 100 mochilas. Qual o custo para 80 mochilas?",
      solution: [
        "De 30 para 50 mochilas (+20 mochilas), o custo subiu de 1.050 para 1.650 (+R$ 600).",
        "Logo, cada bloco de 20 mochilas custa R$ 600.",
        "Para achar 80 mochilas a partir de 100 mochilas, basta subtrair 20 mochilas (R$ 600): 3.150 - 600 = 2.550.",
      ],
      answer: "R$ 2.550,00.",
    },
    keyFormulas: [
      "f(x) = a·x + b",
      "a = Δy / Δx = (y2 - y1) / (x2 - x1)",
    ],
  },
  "m2-3": {
    intro:
      "Estatística Descritiva é garantia de pontos fáceis/médios na TRI. O mais importante é não confundir média, moda e mediana — e usar o macete de corte de extremos na mediana.",
    sections: [
      {
        heading: "1. Média, Moda e Mediana",
        body: "Média é a soma dividida pela quantidade (na ponderada, multiplique cada valor pelo seu peso). Moda é o valor que mais se repete. Mediana é o termo central do conjunto ORDENADO (se a quantidade for par, faça a média dos 2 termos do meio).",
      },
      {
        heading: "2. Macete Rápido da Mediana (Corte de Extremos)",
        body: "Em tabelas com vários valores fora de ordem, em vez de reescrever tudo em ordem crescente, vá riscando em pares o MAIOR e o MENOR número restante até sobrar 1 valor (ou 2 valores, fazendo a média deles).",
      },
    ],
    example: {
      prompt: "Encontre a mediana do conjunto: {46, 66, 54, 64, 60, 64}.",
      solution: [
        "Corte o maior (66) e o menor (46) → sobram {54, 64, 60, 64}.",
        "Corte o próximo maior (64) e o menor (54) → sobram {60, 64}.",
        "Média dos dois centrais: (60 + 64) ÷ 2 = 62.",
      ],
      answer: "Mediana = 62.",
    },
    keyFormulas: [
      "Média = (Σ x_i) / n",
      "Mediana (n par) = média dos 2 valores centrais ordenados",
    ],
  },
  "m3-7": {
    intro:
      "Questões de gráficos trigonométricos assustam quem não conhece o padrão, mas são algumas das mais rápidas de resolver quando você aplica a leitura direta da onda.",
    sections: [
      {
        heading: "1. Graus e Radianos",
        body: "Uma volta completa tem 360° = 2π radianos, portanto 180° = π rad. Use regra de três simples para converter qualquer ângulo.",
      },
      {
        heading: "2. Macete para Identificar a Função pelo Gráfico",
        body: "Passo 1: Veja onde a onda começa no eixo y — se começa no CENTRO da onda, é SENO; se começa na EXTREMIDADE (topo ou vale), é COSSENO. Passo 2: O termo somado fora (+ d) é o valor CENTRAL da onda. Passo 3: O número que multiplica (a) é (extremidade mais próxima − termo central).",
      },
    ],
    example: {
      prompt: "Um gráfico de onda começa no valor central y = 88 e sobe até o pico máximo y = 168. Qual é a estrutura da função?",
      solution: [
        "Começa no centro da onda → função SENO.",
        "Termo central = +88.",
        "Amplitude (coeficiente multiplicador) = 168 - 88 = 80.",
        "Logo a função tem formato f(x) = 88 + 80·sen(...).",
      ],
      answer: "f(x) = 88 + 80·sen(bx).",
    },
    keyFormulas: [
      "180° = π rad",
      "f(x) = d + a·sen(bx)  |  Período T = 2π / |b|",
      "Centro = Seno  |  Extremidade = Cosseno",
    ],
  },
};

/**
 * Returns the full structured lesson theory for any MathCourseItem,
 * using rich custom lessons where available and a clean structured synthesis
 * built from the curriculum guide for the remaining courses.
 */
export function getLessonTheory(course: MathCourseItem): LessonTheory {
  if (CUSTOM_LESSONS[course.id]) {
    return CUSTOM_LESSONS[course.id];
  }

  return {
    intro: `${course.syllabus} Este módulo faz parte do eixo ${course.axis} e tem carga sugerida de ${course.estimatedHours}h com incidência ${course.enemWeight} no ENEM.`,
    sections: course.whatToStudy.map((point, index) => ({
      heading: `Ponto ${index + 1}`,
      body: point,
    })),
    example: {
      prompt: `Aplicação prática de ${course.title} no padrão ENEM.`,
      solution: [
        "Identifique no enunciado o que o comando está pedindo e anote no papel para desafogar a memória de trabalho.",
        "Separe os dados numéricos e verifique se todas as unidades de medida estão compatíveis.",
        "Aplique o conceito principal do tema e confira se o resultado faz sentido com o cotidiano antes de marcar.",
      ],
      answer: "Pratique agora na aba 'Questões do Tema' ao lado usando provas oficiais do MySQL!",
    },
    keyFormulas: [
      `Tema: ${course.code} — ${course.title}`,
      course.prerequisites.length
        ? `Pré-requisitos: ${course.prerequisites.join(", ")}`
        : "Sem pré-requisitos obrigatórios",
    ],
  };
}
