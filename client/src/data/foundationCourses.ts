import type { PracticeExercise } from "@/data/mathExercises";
import type { LessonTheory } from "@/data/mathLessonContent";

export type FoundationSubjectId =
  | "biologia"
  | "fisica"
  | "quimica"
  | "linguagens"
  | "humanas";

export interface FoundationCourseItem {
  id: string;
  subject: FoundationSubjectId;
  subjectName: string;
  code: string;
  axis: string;
  title: string;
  syllabus: string;
  estimatedHours: number;
  enemWeight: "Base" | "Alta";
  searchKeyword: string;
  disciplineApi: string;
  whatToStudy: string[];
  enemTip: string;
  theory: LessonTheory;
  exercises: PracticeExercise[];
}

export const FOUNDATION_COURSES: FoundationCourseItem[] = [
  // ==================== BIOLOGIA ====================
  {
    id: "bio-100",
    subject: "biologia",
    subjectName: "Biologia",
    code: "BIO-100",
    axis: "Citologia (Base)",
    title: "O que é Vida e Como a Célula Funciona",
    syllabus:
      "Célula procarionte vs. eucarionte, membrana plasmática, núcleo e as organelas essenciais explicadas como uma fábrica.",
    estimatedHours: 2,
    enemWeight: "Base",
    searchKeyword: "célula",
    disciplineApi: "ciencias-natureza",
    whatToStudy: [
      "Diferença entre bactéria (procarionte, sem núcleo) e célula animal/vegetal (eucarionte, com núcleo).",
      "Função da Membrana Plasmática (portão seletivo) e do Núcleo (escritório do DNA).",
      "Organelas campeãs: Mitocôndria (usina de energia), Ribossomo (fábrica de proteínas) e Cloroplasto (fotossíntese nas plantas).",
    ],
    enemTip:
      "No ENEM, quase sempre associam uma doença, veneno ou remédio a uma organela: se cortou energia → Mitocôndria; se impediu proteína → Ribossomo.",
    theory: {
      intro:
        "Todo ser vivo é feito de células — pense na célula como uma pequena fábrica funcionando 24 horas para manter você vivo. Não precisa decorar 20 nomes difíceis de cara: domine as 5 peças principais dessa fábrica.",
      sections: [
        {
          heading: "1. Procarionte x Eucarionte (a grande divisão)",
          body: "Procariontes (bactérias) são células super simples, SEM núcleo organizado — o DNA fica solto no citoplasma. Eucariontes (animais, plantas, fungos) são mais complexas e guardam o DNA protegido dentro de um núcleo.",
        },
        {
          heading: "2. A Fábrica Celular (organelas que você precisa saber)",
          body: "• Membrana Plasmática: o portão com segurança (controla quem entra e sai).\n• Mitocôndria: a usina elétrica (faz respiração celular para gerar energia ATP).\n• Ribossomo: o operário que monta proteínas.\n• Lisossomo: a equipe de limpeza e reciclagem (digestão celular).\n• Cloroplasto + Parede Celular: exclusivos de plantas/algas (fazem fotossíntese).",
        },
      ],
      example: {
        prompt:
          "Um pesticida bloqueia a produção de energia (ATP) nas células de um inseto. Qual organela foi diretamente afetada?",
        solution: [
          "1. Produção de energia (ATP) = respiração celular.",
          "2. A organela responsável pela respiração celular e geração de ATP é a Mitocôndria.",
        ],
        answer: "Mitocôndria.",
      },
      keyFormulas: [
        "Procarionte = SEM núcleo (bactérias) | Eucarionte = COM núcleo",
        "Mitocôndria = Energia (ATP) | Ribossomo = Proteínas",
        "Cloroplasto = Fotossíntese (apenas em plantas e algas)",
      ],
    },
    exercises: [
      {
        id: "bio-100-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Qual é a principal diferença estrutural entre uma bactéria (procarionte) e uma célula humana (eucarionte)?",
        alternatives: [
          { letter: "A", text: "A bactéria não possui DNA." },
          {
            letter: "B",
            text: "A bactéria não possui membrana plasmática.",
          },
          {
            letter: "C",
            text: "A bactéria não possui núcleo organizado envolvendo o DNA.",
          },
          { letter: "D", text: "A célula humana não possui ribossomos." },
          { letter: "E", text: "A bactéria possui mitocôndrias gigantes." },
        ],
        correct: "C",
        explanation:
          "Toda célula viva tem DNA, membrana plasmática e ribossomos. O que diferencia procarionte (bactéria) de eucarionte é a ausência de núcleo organizado (carioteca).",
      },
      {
        id: "bio-100-q2",
        level: "Nível 2 • Contextual",
        prompt:
          "Células musculares precisam de muita energia para contrair durante uma corrida. Por isso, elas possuem grande quantidade de qual organela?",
        alternatives: [
          { letter: "A", text: "Cloroplastos" },
          { letter: "B", text: "Mitocôndrias" },
          { letter: "C", text: "Vacúolos" },
          { letter: "D", text: "Parede celular" },
          { letter: "E", text: "Centríolos" },
        ],
        correct: "B",
        explanation:
          "Quanto maior o gasto de energia de um tecido (como músculo e coração), maior a quantidade de mitocôndrias geradoras de ATP.",
      },
    ],
  },
  {
    id: "bio-101",
    subject: "biologia",
    subjectName: "Biologia",
    code: "BIO-101",
    axis: "Ecologia (Campeão ENEM)",
    title: "Cadeia Alimentar, Produtores e Decompositores",
    syllabus:
      "Como a energia flui na natureza: produtores, consumidores, decompositores e impacto da extinção de uma espécie.",
    estimatedHours: 2,
    enemWeight: "Alta",
    searchKeyword: "cadeia alimentar",
    disciplineApi: "ciencias-natureza",
    whatToStudy: [
      "Produtores (plantas/algas): fabricam o próprio alimento pela fotossíntese.",
      "Consumidores (primário, secundário, terciário) e Decompositores (fungos e bactérias).",
      "A energia SEMPRE diminui ao longo da cadeia (perde calor em cada nível).",
    ],
    enemTip:
      "Ecologia é o assunto nº 1 de Biologia no ENEM. Sempre leia as setas da cadeia como 'serve de alimento para'.",
    theory: {
      intro:
        "Se você dominar Ecologia Básica, já garante várias questões de Biologia todo ano. A regra de ouro é entender quem produz energia e como ela passa de um ser vivo para o outro.",
      sections: [
        {
          heading: "1. Os 3 papéis da Cadeia Alimentar",
          body: "• Produtores (autótrofos): plantas e algas. Transformam luz solar em glicose.\n• Consumidores (heterótrofos): herbívoros comem plantas (consumidor 1º); carnívoros comem herbívoros (consumidor 2º) e assim por diante.\n• Decompositores: fungos e bactérias. Reciclam matéria morta devolvendo nutrientes ao solo.",
        },
        {
          heading: "2. Fluxo de energia x Ciclo da matéria",
          body: "A energia entra pelo Sol nos produtores e VAI SE PERDENDO em forma de calor (unidirecional — cada nível aproveita só ~10%). Já a matéria (carbono, nitrogênio, água) é reciclada pelos decompositores.",
        },
      ],
      example: {
        prompt:
          "Na cadeia Capim → Gafanhoto → Sapo → Cobra, se uma praga eliminar os sapos, o que acontece de imediato com os gafanhotos e com o capim?",
        solution: [
          "1. Sem sapos (predadores), a população de gafanhotos aumenta muito.",
          "2. Com muito mais gafanhotos comendo, a quantidade de capim diminui.",
        ],
        answer: "Aumentam os gafanhotos e diminui o capim.",
      },
      keyFormulas: [
        "Seta (A → B) significa: 'A serve de alimento para B'",
        "Energia diminui a cada nível (~10% passa adiante)",
        "Decompositores (fungos/bactérias) reciclam nutrientes para o solo",
      ],
    },
    exercises: [
      {
        id: "bio-101-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Em um ecossistema, quais organismos são os responsáveis por transformar a energia solar em matéria orgânica, formando a base da cadeia alimentar?",
        alternatives: [
          { letter: "A", text: "Decompositores (fungos)" },
          { letter: "B", text: "Consumidores primários (herbívoros)" },
          { letter: "C", text: "Produtores (plantas e algas)" },
          { letter: "D", text: "Consumidores terciários" },
          { letter: "E", text: "Parasitas" },
        ],
        correct: "C",
        explanation:
          "Apenas os produtores (seres fotossintetizantes como plantas, algas e cianobactérias) captam energia solar para produzir alimento na base da cadeia.",
      },
      {
        id: "bio-101-q2",
        level: "Nível 2 • Contextual",
        prompt:
          "Por que grandes predadores (como onças e águias) são muito menos numerosos na natureza do que herbívoros e plantas?",
        alternatives: [
          {
            letter: "A",
            text: "Porque a energia se multiplica a cada nível da cadeia.",
          },
          {
            letter: "B",
            text: "Porque apenas cerca de 10% da energia passa de um nível trófico para o seguinte.",
          },
          { letter: "C", text: "Porque os decompositores consomem as águias vivas." },
          { letter: "D", text: "Porque plantas não gastam energia." },
          { letter: "E", text: "Porque predadores não respiram." },
        ],
        correct: "B",
        explanation:
          "Como a energia diminui drasticamente em cada etapa (perda em forma de calor e metabolismo), sobra pouca energia disponível no topo da pirâmide.",
      },
    ],
  },
  {
    id: "bio-102",
    subject: "biologia",
    subjectName: "Biologia",
    code: "BIO-102",
    axis: "Genética (Base)",
    title: "DNA, Genes e Hereditariedade Sem Mistério",
    syllabus:
      "O que é DNA, cromossomo, gene, genótipo x fenótipo e como funciona dominante (A) x recessivo (a).",
    estimatedHours: 2,
    enemWeight: "Base",
    searchKeyword: "DNA",
    disciplineApi: "ciencias-natureza",
    whatToStudy: [
      "Hierarquia: DNA (receita) → Gene (uma receita específica) → Cromossomo (livro enrolado).",
      "Genótipo (letras no DNA, ex.: Aa) vs. Fenótipo (característica visível + ambiente).",
      "Dominante (A) aparece com 1 cópia (AA ou Aa); Recessivo (a) só aparece em dose dupla (aa).",
    ],
    enemTip:
      "Sempre que dois pais normais têm um filho com uma característica genética, essa característica é RECESSIVA (aa) e os pais são heterozigotos (Aa)!",
    theory: {
      intro:
        "Genética assusta quando começa direto com contas, mas a ideia central é simples: você recebe metade do manual de instruções da sua mãe e metade do seu pai.",
      sections: [
        {
          heading: "1. DNA, Gene e Cromossomo",
          body: "O DNA é o manual completo do seu corpo. Um Gene é um capítulo desse manual (por exemplo, a receita de uma proteína). O Cromossomo é o DNA bem enroladinho para caber no núcleo da célula.",
        },
        {
          heading: "2. Dominante (A) x Recessivo (a)",
          body: "Para cada característica, temos 2 versões (alelos): uma do pai e uma da mãe.\n• AA = homozigoto dominante (expressa A).\n• Aa = heterozigoto (o A 'manda' e expressa A).\n• aa = homozigoto recessivo (único jeito de aparecer a característica recessiva).",
        },
      ],
      example: {
        prompt:
          "Dois pais com visão normal (Aa e Aa) têm um filho. Qual a chance desse filho nascer com albinismo (recessivo, aa)?",
        solution: [
          "Cruzamento Aa × Aa gera 4 combinações possíveis: AA, Aa, aA, aa.",
          "Apenas 1 em 4 é 'aa' → 1/4 = 25%.",
        ],
        answer: "25% (1 em 4).",
      },
      keyFormulas: [
        "Genótipo = letras (AA, Aa, aa) | Fenótipo = característica + ambiente",
        "Pais iguais com filho diferente → o filho é recessivo (aa) e os pais são Aa",
      ],
    },
    exercises: [
      {
        id: "bio-102-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Dois irmãos gêmeos idênticos têm exatamente o mesmo DNA (genótipo), mas um praticou natação e ficou mais alto e musculoso que o outro. Isso mostra que:",
        alternatives: [
          { letter: "A", text: "O genótipo muda com o exercício." },
          {
            letter: "B",
            text: "O fenótipo resulta da interação entre o genótipo e o ambiente.",
          },
          { letter: "C", text: "Gêmeos idênticos têm genes diferentes." },
          { letter: "D", text: "O DNA não influencia características físicas." },
          { letter: "E", text: "Natação altera cromossomos." },
        ],
        correct: "B",
        explanation:
          "Fenótipo = Genótipo + Meio Ambiente. Mesmo com DNA idêntico, alimentação, sol e exercício geram diferenças visíveis.",
      },
    ],
  },

  // ==================== FÍSICA ====================
  {
    id: "fis-100",
    subject: "fisica",
    subjectName: "Física",
    code: "FIS-100",
    axis: "Base Matemática da Física",
    title: "Grandezas, Unidades e Conversões (km/h ↔ m/s)",
    syllabus:
      "Sistema Internacional (SI), como converter km/h para m/s (÷ 3,6) e não cair em pegadinha de unidades.",
    estimatedHours: 2,
    enemWeight: "Base",
    searchKeyword: "velocidade",
    disciplineApi: "ciencias-natureza",
    whatToStudy: [
      "Unidades padrão (SI): distância em metros (m), tempo em segundos (s), massa em kg.",
      "Conversão de ouro: km/h → m/s divide por 3,6 | m/s → km/h multiplica por 3,6.",
      "Sempre checar as unidades antes de multiplicar ou dividir qualquer fórmula.",
    ],
    enemTip:
      "Mais da metade dos erros em Física básica acontecem porque o aluno misturou minutos com segundos ou km com metros. Olhe as unidades primeiro!",
    theory: {
      intro:
        "Física não é decorar 50 fórmulas: ela começa garantindo que você saiba medir o mundo nas unidades certas. Antes de calcular qualquer coisa, pergunte: 'as unidades estão combinando?'",
      sections: [
        {
          heading: "1. O Sistema Internacional (SI)",
          body: "Na Física, as unidades oficiais que combinam entre si são: Metro (m) para distância, Segundo (s) para tempo e Quilograma (kg) para massa.",
        },
        {
          heading: "2. A regra do 3,6 (km/h ↔ m/s)",
          body: "Como 1 km tem 1.000 metros e 1 hora tem 3.600 segundos, a razão entre eles é 3,6.\n• De km/h para m/s: DIVIDE por 3,6 (ex.: 72 km/h ÷ 3,6 = 20 m/s).\n• De m/s para km/h: MULTIPLICA por 3,6 (ex.: 10 m/s × 3,6 = 36 km/h).",
        },
      ],
      example: {
        prompt: "Um carro está a 108 km/h. Qual é a sua velocidade em m/s?",
        solution: [
          "Para passar de km/h para m/s, dividimos por 3,6:",
          "108 ÷ 3,6 = 30 m/s.",
        ],
        answer: "30 m/s.",
      },
      keyFormulas: [
        "km/h → m/s : divide por 3,6 (ex.: 36 km/h = 10 m/s; 72 = 20; 108 = 30)",
        "m/s → km/h : multiplica por 3,6",
        "1 hora = 60 minutos = 3.600 segundos",
      ],
    },
    exercises: [
      {
        id: "fis-100-q1",
        level: "Nível 1 • Fixação",
        prompt: "Converta a velocidade de 72 km/h para m/s:",
        alternatives: [
          { letter: "A", text: "10 m/s" },
          { letter: "B", text: "15 m/s" },
          { letter: "C", text: "20 m/s" },
          { letter: "D", text: "25 m/s" },
          { letter: "E", text: "30 m/s" },
        ],
        correct: "C",
        explanation: "72 ÷ 3,6 = 20 m/s. (Dica: 36 km/h = 10 m/s, então o dobro 72 km/h = 20 m/s!).",
      },
      {
        id: "fis-100-q2",
        level: "Nível 2 • Contextual",
        prompt:
          "Um corredor profissional atinge 10 m/s em uma prova de 100 metros. A quantos km/h essa velocidade equivale?",
        alternatives: [
          { letter: "A", text: "10 km/h" },
          { letter: "B", text: "28 km/h" },
          { letter: "C", text: "36 km/h" },
          { letter: "D", text: "42 km/h" },
          { letter: "E", text: "100 km/h" },
        ],
        correct: "C",
        explanation: "De m/s para km/h, multiplicamos por 3,6: 10 × 3,6 = 36 km/h.",
      },
    ],
  },
  {
    id: "fis-101",
    subject: "fisica",
    subjectName: "Física",
    code: "FIS-101",
    axis: "Cinemática (Base)",
    title: "Velocidade Média e Movimento Uniforme",
    syllabus:
      "Como entender v = Δs / Δt de forma intuitiva (quanto você anda a cada hora ou segundo) e calcular tempo de viagem.",
    estimatedHours: 2,
    enemWeight: "Alta",
    searchKeyword: "velocidade média",
    disciplineApi: "ciencias-natureza",
    whatToStudy: [
      "Conceito intuitivo de velocidade: 80 km/h significa 'anda 80 km a cada 1 hora'.",
      "Fórmula da velocidade média: v = distância total ÷ tempo total.",
      "Cuidado com paradas no caminho: o tempo parado ENTRA no tempo total!",
    ],
    enemTip:
      "Se um carro faz metade do caminho a 40 km/h e a outra metade a 60 km/h, a velocidade média NÃO é 50 km/h! Calcule distância total ÷ tempo total.",
    theory: {
      intro:
        "Velocidade média é apenas uma razão: quanto você andou dividido pelo tempo total que levou (incluindo eventuais paradas).",
      sections: [
        {
          heading: "1. A fórmula sem mistério",
          body: "v = ΔS / Δt. Se você quer a distância: ΔS = v × Δt. Se você quer o tempo: Δt = ΔS / v.",
        },
        {
          heading: "2. A armadilha clássica da média aritmética",
          body: "Nunca tire a média simples de duas velocidades! Sempre calcule quanto tempo gastou no trecho 1, quanto gastou no trecho 2, some os tempos e divida a distância total pelo tempo total.",
        },
      ],
      example: {
        prompt:
          "Campinas fica a cerca de 100 km de São Paulo. Se um ônibus faz o trajeto em 1h15min (1,25 h), qual foi sua velocidade média?",
        solution: [
          "Distância = 100 km.",
          "Tempo = 1h15min = 1,25 h (pois 15 min = 1/4 de hora = 0,25 h).",
          "v = 100 ÷ 1,25 = 80 km/h.",
        ],
        answer: "80 km/h.",
      },
      keyFormulas: [
        "Velocidade média: v = ΔS / Δt",
        "15 min = 0,25 h | 30 min = 0,5 h | 45 min = 0,75 h",
      ],
    },
    exercises: [
      {
        id: "fis-101-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Um ciclista mantém velocidade constante de 20 km/h durante 2 horas e 30 minutos. Qual distância ele percorreu?",
        alternatives: [
          { letter: "A", text: "40 km" },
          { letter: "B", text: "45 km" },
          { letter: "C", text: "50 km" },
          { letter: "D", text: "55 km" },
          { letter: "E", text: "60 km" },
        ],
        correct: "C",
        explanation:
          "2 horas e 30 minutos = 2,5 horas. Distância = 20 km/h × 2,5 h = 50 km.",
      },
      {
        id: "fis-101-q2",
        level: "Nível 2 • Contextual",
        prompt:
          "Um motorista viaja 180 km em 2 horas e faz uma parada de 1 hora para almoçar. Qual foi a velocidade média na viagem inteira?",
        alternatives: [
          { letter: "A", text: "90 km/h" },
          { letter: "B", text: "75 km/h" },
          { letter: "C", text: "60 km/h" },
          { letter: "D", text: "45 km/h" },
          { letter: "E", text: "120 km/h" },
        ],
        correct: "C",
        explanation:
          "O tempo total inclui a parada! Tempo total = 2h + 1h = 3h. Velocidade média = 180 km ÷ 3 h = 60 km/h.",
      },
    ],
  },
  {
    id: "fis-102",
    subject: "fisica",
    subjectName: "Física",
    code: "FIS-102",
    axis: "Energia e Eletricidade (Campeão ENEM)",
    title: "Potência e Energia na Conta de Luz (kWh)",
    syllabus:
      "O que significam os Watts (W) de um aparelho e como calcular o consumo mensal em kWh na conta de luz.",
    estimatedHours: 2,
    enemWeight: "Alta",
    searchKeyword: "potência",
    disciplineApi: "ciencias-natureza",
    whatToStudy: [
      "Potência (Watts) é a rapidez com que o aparelho gasta energia (1 kW = 1.000 W).",
      "Energia gasta: E = Potência (kW) × Tempo (horas) = resultado direto em kWh!",
      "Custo = kWh consumido × preço de 1 kWh.",
    ],
    enemTip:
      "Essa é possivelmente a conta de Física que MAIS cai no ENEM: transformar Watts em kW (dividindo por 1.000) e multiplicar pelas horas de uso no mês.",
    theory: {
      intro:
        "Todo aparelho elétrico (chuveiro, geladeira, carregador) vem com um número em Watts (W). Saber calcular quanto ele custa no fim do mês resolve dezenas de questões do ENEM.",
      sections: [
        {
          heading: "1. Potência x Energia",
          body: "Potência (em Watts) é a 'fome' de energia do aparelho. Um chuveiro de 5.000 W gasta muito mais por segundo do que uma lâmpada de 10 W.",
        },
        {
          heading: "2. A receita da Conta de Luz (em 3 passos)",
          body: "1) Pegue os Watts e divida por 1.000 para virar kW (ex.: 5.000 W = 5 kW).\n2) Multiplique pelas horas de uso no mês (ex.: 0,5h/dia × 30 dias = 15h).\n3) Multiplique: 5 kW × 15 h = 75 kWh.",
        },
      ],
      example: {
        prompt:
          "Um chuveiro de 4.000 W fica ligado 15 minutos por dia durante 30 dias. Se 1 kWh custa R$ 0,80, quanto ele custa no mês?",
        solution: [
          "1. Potência em kW: 4.000 W ÷ 1.000 = 4 kW.",
          "2. Tempo no mês: 15 min/dia = 0,25 h/dia. Em 30 dias: 0,25 × 30 = 7,5 h.",
          "3. Energia: 4 kW × 7,5 h = 30 kWh.",
          "4. Custo: 30 × R$ 0,80 = R$ 24,00.",
        ],
        answer: "R$ 24,00.",
      },
      keyFormulas: [
        "1 kW = 1.000 W",
        "Energia (kWh) = Potência (kW) × Tempo (h)",
      ],
    },
    exercises: [
      {
        id: "fis-102-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Um ferro de passar de 2.000 W é utilizado durante 3 horas em um mês. Quantos kWh ele consumiu?",
        alternatives: [
          { letter: "A", text: "2 kWh" },
          { letter: "B", text: "3 kWh" },
          { letter: "C", text: "6 kWh" },
          { letter: "D", text: "60 kWh" },
          { letter: "E", text: "6.000 kWh" },
        ],
        correct: "C",
        explanation:
          "2.000 W = 2 kW. Energia = 2 kW × 3 h = 6 kWh.",
      },
    ],
  },

  // ==================== QUÍMICA ====================
  {
    id: "qui-100",
    subject: "quimica",
    subjectName: "Química",
    code: "QUI-100",
    axis: "Atomística (Base)",
    title: "Átomo, Prótons, Elétrons e Tabela Periódica",
    syllabus:
      "As 3 partículas do átomo (próton, nêutron, elétron), número atômico (Z), número de massa (A) e íons.",
    estimatedHours: 2,
    enemWeight: "Base",
    searchKeyword: "átomo",
    disciplineApi: "ciencias-natureza",
    whatToStudy: [
      "Núcleo tem Prótons (+) e Nêutrons (0); Eletrosfera tem Elétrons (-).",
      "Número Atômico (Z) = nº de prótons (é o 'RG' do elemento químico).",
      "Íons: Cátion (+) perdeu elétrons; Ânion (-) ganhou elétrons.",
    ],
    enemTip:
      "Pegadinha clássica: se um átomo vira Cátion (+), ele NÃO ganhou prótons — ele PERDEU elétrons (cargas negativas)!",
    theory: {
      intro:
        "Tudo ao seu redor é feito de átomos. Para entender Química sem decorar tudo, pense no átomo como um estádio de futebol: o núcleo bem pequeno no centro e os elétrons girando na arquibancada.",
      sections: [
        {
          heading: "1. As 3 partículas fundamentais",
          body: "• Próton (p+): carga positiva, fica no núcleo.\n• Nêutron (n0): sem carga, fica no núcleo dando estabilidade.\n• Elétron (e-): carga negativa, gira na eletrosfera (é quem participa das ligações químicas!).",
        },
        {
          heading: "2. Número Atômico (Z) e Massa (A)",
          body: "• Z = número de prótons (define qual é o elemento: se tem 6 prótons é Carbono, sempre!).\n• A = Prótons + Nêutrons (a massa quase toda está no núcleo).",
        },
      ],
      example: {
        prompt:
          "Um átomo neutro de Sódio tem Z = 11 e A = 23. Quantos prótons, elétrons e nêutrons ele possui?",
        solution: [
          "1. Z = 11 → 11 prótons.",
          "2. Como é neutro, elétrons = prótons = 11 elétrons.",
          "3. Nêutrons = A - Z = 23 - 11 = 12 nêutrons.",
        ],
        answer: "11 prótons, 11 elétrons e 12 nêutrons.",
      },
      keyFormulas: [
        "Z = nº de prótons | A = Prótons + Nêutrons",
        "Cátion (+) = perdeu elétrons | Ânion (-) = ganhou elétrons",
      ],
    },
    exercises: [
      {
        id: "qui-100-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Quando um átomo neutro de Cloro (Cl) ganha 1 elétron e vira o íon Cl⁻, o que mudou nele?",
        alternatives: [
          { letter: "A", text: "Ganhou 1 próton no núcleo." },
          { letter: "B", text: "Perdeu 1 próton no núcleo." },
          { letter: "C", text: "Ficou com 1 elétron a mais na eletrosfera." },
          { letter: "D", text: "Transformou-se em outro elemento químico." },
          { letter: "E", text: "Perdeu 1 nêutron." },
        ],
        correct: "C",
        explanation:
          "Íons só mudam a quantidade de ELÉTRONS. Como ganhou 1 elétron (carga negativa), ficou com carga -1 (ânion Cl⁻).",
      },
    ],
  },
  {
    id: "qui-101",
    subject: "quimica",
    subjectName: "Química",
    code: "QUI-101",
    axis: "Matéria e Misturas (Campeão ENEM)",
    title: "Estados Físicos e Separação de Misturas",
    syllabus:
      "Fusão, ebulição, sublimação, substância pura x mistura e os métodos de separação (filtração, destilação, decantação).",
    estimatedHours: 2,
    enemWeight: "Alta",
    searchKeyword: "destilação",
    disciplineApi: "ciencias-natureza",
    whatToStudy: [
      "Mudanças de estado: Fusão (sólido → líquido), Vaporização/Ebulição (líquido → gás), Sublimação (sólido → gás direto).",
      "Mistura homogênea (1 fase, ex.: água + sal) vs. heterogênea (2+ fases, ex.: água + óleo).",
      "Separação: Filtração (sólido + líquido), Decantação (densidades diferentes), Destilação (pontos de ebulição diferentes).",
    ],
    enemTip:
      "Separação de misturas cai TODO ANO no ENEM (tratamento de água, petróleo, reciclagem, café coado).",
    theory: {
      intro:
        "No dia a dia você já faz Química o tempo todo: coar café é filtração, ferver água é ebulição, deixar a areia baixar no fundo do balde é decantação.",
      sections: [
        {
          heading: "1. Principais métodos de separação",
          body: "• Filtração: separa sólido insolúvel de líquido (ex.: pó de café na água).\n• Decantação: separa pela diferença de densidade (ex.: água e óleo, ou lama assentando).\n• Destilação simples/fracionada: separa líquidos misturados usando a diferença de ponto de ebulição (ex.: álcool e água, ou frações do petróleo).",
        },
      ],
      example: {
        prompt:
          "Para separar uma mistura homogênea de água e sal de cozinha recuperando a água pura, qual método devemos usar?",
        solution: [
          "Água + sal formam 1 única fase (mistura homogênea) onde o sal está dissolvido — filtro comum não segura sal dissolvido!",
          "Aquecendo na destilação simples, a água ferve a 100°C, evapora e condensa pura no outro recipiente, deixando o sal.",
        ],
        answer: "Destilação simples.",
      },
      keyFormulas: [
        "Homogênea = 1 fase (uniforme) | Heterogênea = 2 ou mais fases",
        "Destilação separa por diferença de Ponto de Ebulição",
      ],
    },
    exercises: [
      {
        id: "qui-101-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Em uma estação de tratamento de água, a água fica em repouso em tanques para que partículas pesadas de sujeira afundem pela gravidade. Qual processo é esse?",
        alternatives: [
          { letter: "A", text: "Destilação fracionada" },
          { letter: "B", text: "Decantação" },
          { letter: "C", text: "Sublimação" },
          { letter: "D", text: "Cromatografia" },
          { letter: "E", text: "Peneiração" },
        ],
        correct: "B",
        explanation:
          "Deixar o sólido mais denso afundar pela ação da gravidade chama-se decantação (ou sedimentação).",
      },
    ],
  },
  {
    id: "qui-102",
    subject: "quimica",
    subjectName: "Química",
    code: "QUI-102",
    axis: "Química Geral",
    title: "Ligações Químicas e Escala de pH (Ácido x Base)",
    syllabus:
      "Ligação iônica (doa/recebe) x covalente (compartilha) e como ler a escala de pH de 0 a 14.",
    estimatedHours: 2,
    enemWeight: "Base",
    searchKeyword: "pH",
    disciplineApi: "ciencias-natureza",
    whatToStudy: [
      "Ligação Iônica: Metal + Ametal (transfere elétrons, ex.: NaCl - sal).",
      "Ligação Covalente: Ametal + Ametal ou H (compartilha elétrons, ex.: H₂O, CO₂).",
      "Escala de pH: menor que 7 = Ácido (limão, vinagre); 7 = Neutro; maior que 7 = Básico/Alcalino (sabão, soda).",
    ],
    enemTip:
      "Questões de solo agrícola e chuva ácida no ENEM sempre usam pH: se o solo está ácido (pH < 7), joga-se calcário (básico) para neutralizar!",
    theory: {
      intro:
        "Os átomos se juntam formando moléculas para ficarem estáveis. E essas substâncias podem deixar o meio ácido, neutro ou básico — medido pela famosa escala de pH.",
      sections: [
        {
          heading: "1. A Escala de pH (0 a 14)",
          body: "• pH < 7 → Ácido (quanto menor o número, mais ácido).\n• pH = 7 → Neutro (água pura a 25°C).\n• pH > 7 → Básico ou Alcalino.",
        },
      ],
      example: {
        prompt:
          "O suco de limão tem pH ≈ 2 e o leite de magnésia tem pH ≈ 10. Qual deles é básico e por que o leite de magnésia alivia azia?",
        solution: [
          "pH 10 > 7, portanto o leite de magnésia é BÁSICO.",
          "Como a azia é excesso de ácido no estômago, uma base neutraliza o ácido.",
        ],
        answer: "Leite de magnésia é básico e neutraliza o ácido do estômago.",
      },
      keyFormulas: [
        "pH < 7: Ácido | pH = 7: Neutro | pH > 7: Básico",
        "Iônica = transfere elétrons | Covalente = compartilha elétrons",
      ],
    },
    exercises: [
      {
        id: "qui-102-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Um agricultor mediu o pH do solo e encontrou 4,5. Para tornar o solo próximo da neutralidade (pH ~7), ele deve adicionar uma substância de caráter:",
        alternatives: [
          { letter: "A", text: "Fortemente ácido" },
          { letter: "B", text: "Básico (alcalino)" },
          { letter: "C", text: "Neutro" },
          { letter: "D", text: "Radioativo" },
          { letter: "E", text: "Inerte" },
        ],
        correct: "B",
        explanation:
          "pH 4,5 é ácido (< 7). Para elevar o pH até 7, é preciso neutralizar com uma base (como o calcário).",
      },
    ],
  },

  // ==================== LINGUAGENS ====================
  {
    id: "lin-100",
    subject: "linguagens",
    subjectName: "Linguagens",
    code: "LIN-100",
    axis: "Interpretação de Texto (Base)",
    title: "Como Ler Questões de Linguagens no ENEM",
    syllabus:
      "Ordem de leitura estratégica (Comando → Texto → Alternativas), identificação de tese e eliminação de extrapolação.",
    estimatedHours: 2,
    enemWeight: "Alta",
    searchKeyword: "texto",
    disciplineApi: "linguagens",
    whatToStudy: [
      "Leia SEMPRE o comando (a pergunta) ANTES do texto para saber o que procurar.",
      "Identifique a ideia central (tese) e a intenção do autor (informar, criticar, convencer).",
      "Cuidado com os 3 distratores clássicos: Extrapolação (vai além do texto), Redução (só parte) e Contradição.",
    ],
    enemTip:
      "Em Linguagens no ENEM, a resposta certa NUNCA inventa algo que não está sustentado pelo texto ou pela sua função social.",
    theory: {
      intro:
        "Muita gente erra Linguagens não por não saber português, mas por ler o texto sem saber o que a questão quer — ou por marcar alternativas que 'fazem sentido na vida real', mas não estão no texto.",
      sections: [
        {
          heading: "1. O Método dos 3 Passos em Linguagens",
          body: "1) Leia primeiro a FONTE (rodapé do texto) e o COMANDO da questão.\n2) Leia o texto já procurando o que o comando pediu.\n3) Elimine alternativas absurdas, muito radicais ('sempre', 'nunca', 'todos') ou que extrapolam o texto.",
        },
      ],
      example: {
        prompt:
          "Se uma questão pergunta 'Qual o objetivo principal do cartaz de vacinação?', o que você deve procurar?",
        solution: [
          "Cartaz de campanha pública tem função apelativa/conativa: convencer ou orientar o leitor a tomar uma atitude (vacinar-se).",
        ],
        answer: "Convencer/conscientizar o público-alvo a aderir à campanha.",
      },
      keyFormulas: [
        "Ordem de leitura: 1º Comando + Fonte → 2º Texto → 3º Alternativas",
        "Desconfie de palavras extremas ('jamais', 'exclusivamente', 'todos')",
      ],
    },
    exercises: [
      {
        id: "lin-100-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Ao resolver uma questão longa de interpretação de texto no ENEM, qual é a ordem de leitura mais eficiente para economizar tempo e evitar pegadinhas?",
        alternatives: [
          {
            letter: "A",
            text: "Ler todas as alternativas antes de saber qual é o tema.",
          },
          {
            letter: "B",
            text: "Ler primeiro o comando da questão e a fonte, depois ler o texto com foco.",
          },
          { letter: "C", text: "Decorar o texto palavra por palavra." },
          { letter: "D", text: "Chutar a alternativa mais longa." },
          { letter: "E", text: "Ignorar o título e o rodapé." },
        ],
        correct: "B",
        explanation:
          "Ler o comando e a fonte antes dá um 'radar' ao seu cérebro: você já lê o texto sabendo exatamente qual informação importa.",
      },
    ],
  },
  {
    id: "lin-101",
    subject: "linguagens",
    subjectName: "Linguagens",
    code: "LIN-101",
    axis: "Gêneros e Funções da Linguagem",
    title: "Funções da Linguagem e Gêneros Textuais",
    syllabus:
      "As 6 funções (Referencial, Emotiva, Conativa, Poética, Fática, Metalinguística) e como reconhecer gêneros na prova.",
    estimatedHours: 2,
    enemWeight: "Alta",
    searchKeyword: "linguagem",
    disciplineApi: "linguagens",
    whatToStudy: [
      "Referencial: foca na informação objetiva (notícia, verbete).",
      "Conativa/Apelativa: foca em convencer o leitor (propaganda, campanha).",
      "Metalinguística: o código explicando o próprio código (poema sobre poesia, dicionário).",
    ],
    enemTip:
      "Na Unicamp (COMVEST), saber a diferença de Gêneros Textuais é obrigatório tanto para leitura quanto para a Redação!",
    theory: {
      intro:
        "Todo texto nasce com uma intenção: informar, emocionar, dar uma ordem, testar a conexão ou explicar a própria língua. Isso são as Funções da Linguagem.",
      sections: [
        {
          heading: "1. Guia rápido das 6 Funções",
          body: "• Referencial (Informativa): notícia de jornal, foco no fato.\n• Emotiva (Expressiva): foco no 'eu' (diário, desabafo, 1ª pessoa).\n• Conativa (Apelativa): foco no 'você', verbos no imperativo (propaganda: 'Compre já!').\n• Poética: foco na beleza e sonoridade das palavras (poesia, música).\n• Fática: testar o canal de comunicação ('Alô?', 'Oi, tudo bem?').\n• Metalinguística: texto falando sobre o próprio texto/código (um filme sobre fazer cinema).",
        },
      ],
      example: {
        prompt:
          "Uma propaganda diz: 'Doe sangue. Salve vidas hoje mesmo!'. Qual função da linguagem predomina?",
        solution: [
          "Verbos no imperativo ('Doe', 'Salve') tentando convencer o interlocutor a agir = Função Conativa (Apelativa).",
        ],
        answer: "Função Conativa (ou Apelativa).",
      },
      keyFormulas: [
        "Imperativo / convencer = Conativa | Informação objetiva = Referencial",
        "1ª pessoa / sentimentos = Emotiva | Código falando de si = Metalinguística",
      ],
    },
    exercises: [
      {
        id: "lin-101-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Um poema cujo assunto principal é a própria dificuldade de escrever poemas exemplifica principalmente a função:",
        alternatives: [
          { letter: "A", text: "Fática" },
          { letter: "B", text: "Referencial" },
          { letter: "C", text: "Metalinguística" },
          { letter: "D", text: "Conativa" },
          { letter: "E", text: "Científica" },
        ],
        correct: "C",
        explanation:
          "Quando a linguagem explica ou reflete sobre ela mesma (poema sobre poesia, música sobre compor), temos a função metalinguística.",
      },
    ],
  },
  {
    id: "lin-102",
    subject: "linguagens",
    subjectName: "Linguagens",
    code: "LIN-102",
    axis: "Sociolinguística (Campeão ENEM)",
    title: "Variação Linguística e Preconceito Linguístico",
    syllabus:
      "Norma padrão x linguagem informal, variações regionais, históricas e sociais sem preconceito.",
    estimatedHours: 1.5,
    enemWeight: "Alta",
    searchKeyword: "variação",
    disciplineApi: "linguagens",
    whatToStudy: [
      "Não existe português 'errado' na fala cotidiana — existem variedades adequadas ou inadequadas ao contexto.",
      "Tipos de variação: Regional (sotaques/gírias), Histórica (vossa mercê → você), Social e Situacional (formal x informal).",
    ],
    enemTip:
      "No ENEM, qualquer alternativa que diga que um falante regional 'fala errado' ou 'destrói a língua' está ERRADA. A palavra-chave é ADEQUAÇÃO ao contexto.",
    theory: {
      intro:
        "Você não fala com seus amigos no WhatsApp do mesmo jeito que escreve uma redação ou fala em uma entrevista de emprego. Isso não é erro — é adaptação ao contexto.",
      sections: [
        {
          heading: "1. Adequação x Erro",
          body: "A norma padrão (culta) é muito importante para redações, provas e documentos formais, mas as variedades regionais e coloquiais têm suas próprias regras lógicas e fazem parte da identidade cultural.",
        },
      ],
      example: {
        prompt:
          "Por que 'aipim', 'macaxeira' e 'mandioca' representam uma variação linguística?",
        solution: [
          "São nomes diferentes para o mesmo alimento dependendo da região do Brasil → Variação Regional (geográfica).",
        ],
        answer: "Variação linguística regional (ou geográfica).",
      },
      keyFormulas: [
        "Não existe 'certo x errado' absoluto na fala; existe ADEQUAÇÃO ao contexto",
        "Regional (lugar) • Histórica (tempo) • Social (grupo) • Situacional (formal/informal)",
      ],
    },
    exercises: [
      {
        id: "lin-102-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Na visão da linguística moderna cobrada no ENEM, qual deve ser a postura diante de gírias jovens e sotaques regionais?",
        alternatives: [
          { letter: "A", text: "Devem ser proibidos em qualquer conversa." },
          {
            letter: "B",
            text: "São expressões legítimas da língua, adequadas a contextos informais e identitários.",
          },
          { letter: "C", text: "São sinais de ignorância gramatical." },
          { letter: "D", text: "Devem substituir a norma padrão nas leis." },
          { letter: "E", text: "Não fazem parte da língua portuguesa." },
        ],
        correct: "B",
        explanation:
          "A língua é viva e diversa. Cada variedade tem valor cultural e deve ser avaliada pela adequação à situação comunicativa.",
      },
    ],
  },

  // ==================== HUMANAS ====================
  {
    id: "hum-100",
    subject: "humanas",
    subjectName: "Ciências Humanas",
    code: "HUM-100",
    axis: "História Geral (Linha do Tempo)",
    title: "Linha do Tempo Essencial da História",
    syllabus:
      "Os 4 grandes períodos (Antiguidade, Idade Média, Moderna e Contemporânea) para nunca mais se perder nas datas.",
    estimatedHours: 2,
    enemWeight: "Base",
    searchKeyword: "história",
    disciplineApi: "ciencias-humanas",
    whatToStudy: [
      "Antiguidade: Grécia (democracia, filosofia) e Roma (direito, império).",
      "Idade Média: Feudalismo, Igreja Católica forte, trabalho servil.",
      "Idade Moderna: Grandes Navegações, Renascimento, Iluminismo.",
      "Idade Contemporânea: Revolução Francesa, Revolução Industrial, Guerras Mundiais.",
    ],
    enemTip:
      "Humanas no ENEM quase nunca cobra data exata decorada — cobra entender O QUE MUDOU de um período para o outro (ex.: campo → cidade na Rev. Industrial).",
    theory: {
      intro:
        "Se você não lembra quase nada de História, o primeiro passo é ter um 'mapa mental do tempo' para saber onde encaixar cada assunto.",
      sections: [
        {
          heading: "1. Os 4 grandes blocos da História",
          body: "1) Antiguidade (até 476 d.C.): Grécia e Roma.\n2) Idade Média (476–1453): Feudalismo, castelos, poder da Igreja.\n3) Idade Moderna (1453–1789): Navegações, colonização das Américas, Renascimento, Iluminismo.\n4) Idade Contemporânea (1789–hoje): Revolução Francesa, fábricas (Rev. Industrial), século XX.",
        },
      ],
      example: {
        prompt:
          "Por que o Iluminismo (séc. XVIII) foi tão importante para o fim do Absolutismo?",
        solution: [
          "Os iluministas defenderam razão, liberdade, igualdade jurídica e divisão dos poderes (contra o poder absoluto dos reis).",
        ],
        answer: "Porque questionou o poder absoluto dos reis com base na razão e nos direitos individuais.",
      },
      keyFormulas: [
        "Grécia = Democracia e Filosofia | Idade Média = Feudalismo",
        "Moderna = Navegações + Iluminismo | Contemporânea = Indústria + Direitos",
      ],
    },
    exercises: [
      {
        id: "hum-100-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Qual transformação marca a passagem da Idade Moderna para a Idade Contemporânea no final do século XVIII?",
        alternatives: [
          { letter: "A", text: "A construção das pirâmides do Egito" },
          {
            letter: "B",
            text: "A Revolução Francesa (queda do absolutismo) e o avanço da Revolução Industrial",
          },
          { letter: "C", text: "A invenção da escrita cuneiforme" },
          { letter: "D", text: "O início do feudalismo europeu" },
          { letter: "E", text: "As Cruzadas medievais" },
        ],
        correct: "B",
        explanation:
          "1789 (Revolução Francesa) é o marco tradicional da Idade Contemporânea, acompanhado da Revolução Industrial na Inglaterra.",
      },
    ],
  },
  {
    id: "hum-101",
    subject: "humanas",
    subjectName: "Ciências Humanas",
    code: "HUM-101",
    axis: "História do Brasil",
    title: "Brasil Colônia, Império e República em 15 Minutos",
    syllabus:
      "Os 3 grandes momentos do Brasil: Colônia (1500–1822), Império (1822–1889) e República (1889–hoje).",
    estimatedHours: 2,
    enemWeight: "Alta",
    searchKeyword: "Brasil",
    disciplineApi: "ciencias-humanas",
    whatToStudy: [
      "Colônia: pacto colonial, açúcar (Nordeste), escravidão africana e indígena, ouro (Minas Gerais).",
      "Império: Independência (1822), D. Pedro I e II, café e Abolição tardia (1888).",
      "República: Proclamação (1889), Era Vargas (CLT/indústria), Ditadura Militar (1964–1985) e Constituição Cidadã (1988).",
    ],
    enemTip:
      "Constituição de 1988, Era Vargas e heranças da escravidão no Brasil são temas quase obrigatórios em toda prova do ENEM.",
    theory: {
      intro:
        "Para dominar História do Brasil do zero, divida o país em apenas 3 capítulos grandes e entenda o que sustentava a economia e o poder em cada um.",
      sections: [
        {
          heading: "1. Os 3 Capítulos do Brasil",
          body: "• Colônia (1500–1822): Brasil pertencia a Portugal. Economia de exportação (cana-de-açúcar e ouro) baseada no trabalho escravizado.\n• Império (1822–1889): Brasil independente governado por imperadores. Economia do café e abolição da escravidão só em 1888.\n• República (1889–hoje): República Velha (café), Era Vargas (leis trabalhistas e indústria), Ditadura Militar (1964–1985) e Redemocratização (Constituição de 1988).",
        },
      ],
      example: {
        prompt:
          "Por que a Constituição de 1988 é chamada de 'Constituição Cidadã'?",
        solution: [
          "Porque foi criada após a Ditadura Militar ampliando direitos sociais (saúde/SUS, educação), voto universal e liberdades democráticas.",
        ],
        answer: "Porque restabeleceu a democracia e ampliou os direitos sociais e civis no Brasil.",
      },
      keyFormulas: [
        "1500–1822: Colônia | 1822–1889: Império | 1889–hoje: República",
        "1888: Lei Áurea | 1988: Constituição Cidadã",
      ],
    },
    exercises: [
      {
        id: "hum-101-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "Qual característica econômica marcou o Brasil durante quase todo o período Colonial (1500–1822)?",
        alternatives: [
          { letter: "A", text: "Indústria de alta tecnologia voltada ao mercado interno" },
          {
            letter: "B",
            text: "Produção agrícola/mineral para exportação (açúcar e ouro) com mão de obra escravizada",
          },
          { letter: "C", text: "Economia baseada em trabalho assalariado urbano" },
          { letter: "D", text: "Comércio livre sem controle de Portugal" },
          { letter: "E", text: "Ausência de grandes propriedades rurais" },
        ],
        correct: "B",
        explanation:
          "O modelo colonial baseava-se no latifúndio agroexportador (plantation), pacto colonial com Portugal e trabalho escravizado.",
      },
    ],
  },
  {
    id: "hum-102",
    subject: "humanas",
    subjectName: "Ciências Humanas",
    code: "HUM-102",
    axis: "Geografia (Base)",
    title: "Geografia Básica: Urbanização, Clima e Globalização",
    syllabus:
      "Êxodo rural, problemas das grandes cidades, ilhas de calor e impactos da globalização no espaço geográfico.",
    estimatedHours: 2,
    enemWeight: "Alta",
    searchKeyword: "urbanização",
    disciplineApi: "ciencias-humanas",
    whatToStudy: [
      "Êxodo rural: saída em massa do campo para a cidade (industrialização a partir de 1950 no Brasil).",
      "Problemas urbanos: favelização, ilha de calor (muito asfalto/concreto), enchentes (solo impermeabilizado).",
      "Globalização: integração rápida de informação e economia, mas com desigualdade entre países/regiões.",
    ],
    enemTip:
      "Em Geografia do ENEM, quando falar em enchente na cidade grande, a resposta quase sempre envolve 'impermeabilização do solo' (asfalto impedindo a água de infiltrar).",
    theory: {
      intro:
        "Geografia no ENEM conecta natureza + sociedade: como a ação humana transforma o clima, as cidades e o trabalho.",
      sections: [
        {
          heading: "1. Cidade, Asfalto e Clima",
          body: "Nas grandes cidades, trocamos árvores e terra por concreto e asfalto. Resultado: a água da chuva não infiltra (causando enchentes) e o centro retém muito mais calor que os arredores (Ilha de Calor).",
        },
      ],
      example: {
        prompt:
          "Por que os centros das metrópoles costumam registrar temperaturas mais altas do que áreas rurais vizinhas?",
        solution: [
          "Excesso de asfalto/concreto, pouca vegetação e poluição retêm calor → fenômeno chamado Ilha de Calor.",
        ],
        answer: "Fenômeno das Ilhas de Calor urbanas.",
      },
      keyFormulas: [
        "Asfalto impede água de infiltrar → Enchentes",
        "Muito concreto + poucas árvores → Ilha de Calor",
      ],
    },
    exercises: [
      {
        id: "hum-102-q1",
        level: "Nível 1 • Fixação",
        prompt:
          "O asfaltamento intenso das ruas e a redução de áreas verdes nas grandes cidades agravam diretamente as enchentes porque:",
        alternatives: [
          { letter: "A", text: "Aumentam a infiltração de água no subsolo." },
          {
            letter: "B",
            text: "Impermeabilizam o solo, aumentando o escoamento superficial da água da chuva.",
          },
          { letter: "C", text: "Eliminam a evaporação dos oceanos." },
          { letter: "D", text: "Diminuem o volume de chuvas." },
          { letter: "E", text: "Resfriam o ar urbano." },
        ],
        correct: "B",
        explanation:
          "Sem solo exposto e raízes de plantas, a água não infiltra na terra e corre rápido pela superfície, alagando as partes baixas.",
      },
    ],
  },
];

export function getFoundationCoursesBySubject(
  subject: FoundationSubjectId,
): FoundationCourseItem[] {
  return FOUNDATION_COURSES.filter((c) => c.subject === subject);
}

export function findFoundationCourse(
  courseId: string,
): FoundationCourseItem | undefined {
  return FOUNDATION_COURSES.find((c) => c.id === courseId);
}
