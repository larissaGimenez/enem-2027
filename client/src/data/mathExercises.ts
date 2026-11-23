import { FOUNDATION_COURSES } from "@/data/foundationCourses";
import type { MathCourseItem } from "@/data/mathCurriculum";

export interface PracticeExercise {
  id: string;
  level: "Nível 1 • Fixação" | "Nível 2 • Contextual" | "Nível 3 • ENEM/Unicamp";
  prompt: string;
  alternatives: Array<{ letter: "A" | "B" | "C" | "D" | "E"; text: string }>;
  correct: "A" | "B" | "C" | "D" | "E";
  explanation: string;
}

const EXERCISES_BY_COURSE: Record<string, PracticeExercise[]> = {
  "m1-0": [
    {
      id: "m1-0-q1",
      level: "Nível 1 • Fixação",
      prompt:
        "Usando a estratégia de arredondar e corrigir (ou complementaridade), qual o resultado mental de 3.150 - 600?",
      alternatives: [
        { letter: "A", text: "2.450" },
        { letter: "B", text: "2.550" },
        { letter: "C", text: "2.650" },
        { letter: "D", text: "2.750" },
        { letter: "E", text: "2.500" },
      ],
      correct: "B",
      explanation:
        "Quebre 600 em 100 + 500: primeiro faça 3.150 - 150 = 3.000 e depois tire 450 → 2.550. Ou faça 3.150 - 100 = 3.050 e 3.050 - 500 = 2.550.",
    },
    {
      id: "m1-0-q2",
      level: "Nível 1 • Fixação",
      prompt:
        "Aplicando a propriedade distributiva mental (decomposição em dezenas + unidades), quanto vale 16 × 12?",
      alternatives: [
        { letter: "A", text: "172" },
        { letter: "B", text: "182" },
        { letter: "C", text: "192" },
        { letter: "D", text: "196" },
        { letter: "E", text: "202" },
      ],
      correct: "C",
      explanation:
        "16 × 12 = 16 × (10 + 2) = 160 + 32 = 192. Muito mais rápido e seguro do que armar a conta no canto da prova.",
    },
    {
      id: "m1-0-q3",
      level: "Nível 1 • Fixação",
      prompt:
        "Usando o fatiamento por fatores primos, divida 144 por 6 mentalmente:",
      alternatives: [
        { letter: "A", text: "22" },
        { letter: "B", text: "24" },
        { letter: "C", text: "26" },
        { letter: "D", text: "28" },
        { letter: "E", text: "32" },
      ],
      correct: "B",
      explanation:
        "Como 6 = 2 × 3, fatiando em duas etapas: 144 ÷ 2 = 72, e depois 72 ÷ 3 = 24.",
    },
    {
      id: "m1-0-q4",
      level: "Nível 2 • Contextual",
      prompt:
        "Um estudante comprou 14 cadernos a R$ 15,00 cada e pagou com uma nota de R$ 250,00 (em notas menores). Quanto recebeu de troco?",
      alternatives: [
        { letter: "A", text: "R$ 30,00" },
        { letter: "B", text: "R$ 35,00" },
        { letter: "C", text: "R$ 40,00" },
        { letter: "D", text: "R$ 45,00" },
        { letter: "E", text: "R$ 50,00" },
      ],
      correct: "C",
      explanation:
        "Dobre e divida por 2: 14 × 15 = 7 × 30 = 210. De R$ 210,00 para R$ 250,00 faltam exatamente R$ 40,00.",
    },
    {
      id: "m1-0-q5",
      level: "Nível 3 • ENEM/Unicamp",
      prompt:
        "Em uma maratona de estudos, Larissa resolveu 87 questões na segunda-feira e 46 questões na terça-feira. Quantas questões ela resolveu nos dois dias?",
      alternatives: [
        { letter: "A", text: "123" },
        { letter: "B", text: "131" },
        { letter: "C", text: "133" },
        { letter: "D", text: "135" },
        { letter: "E", text: "143" },
      ],
      correct: "C",
      explanation:
        "Complete o 87 para 90 pegando +3 do 46 (que vira 43). Agora some 90 + 43 = 133.",
    },
  ],
  "m1-1": [
    {
      id: "m1-1-q1",
      level: "Nível 1 • Fixação",
      prompt:
        "Dois semáforos piscam juntos às 8h00. O primeiro pisca a cada 12 segundos e o segundo a cada 18 segundos. Depois de quantos segundos eles voltarão a piscar juntos?",
      alternatives: [
        { letter: "A", text: "24 s" },
        { letter: "B", text: "30 s" },
        { letter: "C", text: "36 s" },
        { letter: "D", text: "54 s" },
        { letter: "E", text: "72 s" },
      ],
      correct: "C",
      explanation:
        "Encontros periódicos no tempo sempre pedem MMC! MMC(12, 18) = 36 segundos (pois 12×3 = 36 e 18×2 = 36).",
    },
    {
      id: "m1-1-q2",
      level: "Nível 2 • Contextual",
      prompt:
        "Um professor tem 24 apostilas de Matemática e 36 de Física. Ele quer montar pacotes idênticos com o maior número possível de apostilas, sem misturar matérias no mesmo pacote e sem sobras. Quantas apostilas terá cada pacote?",
      alternatives: [
        { letter: "A", text: "6" },
        { letter: "B", text: "8" },
        { letter: "C", text: "12" },
        { letter: "D", text: "18" },
        { letter: "E", text: "72" },
      ],
      correct: "C",
      explanation:
        "Dividir em grupos iguais do MAIOR tamanho possível sem sobras pede MDC! MDC(24, 36) = 12 apostilas por pacote.",
    },
    {
      id: "m1-1-q3",
      level: "Nível 1 • Fixação",
      prompt: "Qual dos números abaixo é divisível simultaneamente por 3 e por 4?",
      alternatives: [
        { letter: "A", text: "124" },
        { letter: "B", text: "132" },
        { letter: "C", text: "142" },
        { letter: "D", text: "150" },
        { letter: "E", text: "162" },
      ],
      correct: "B",
      explanation:
        "Para dividir por 3, a soma dos algarismos deve ser múltipla de 3 (1+3+2=6). Para dividir por 4, os dois últimos algarismos formam múltiplo de 4 (32 ÷ 4 = 8). Logo, 132.",
    },
  ],
  "m1-2": [
    {
      id: "m1-2-q1",
      level: "Nível 1 • Fixação",
      prompt:
        "Joaquim comprou dois potes de sorvete iguais. No pote 1, 1/3 é de chocolate. No pote 2, 1/2 é de chocolate. Juntando os dois potes, qual fração do total comprado é de chocolate?",
      alternatives: [
        { letter: "A", text: "2/5" },
        { letter: "B", text: "5/6" },
        { letter: "C", text: "5/12" },
        { letter: "D", text: "1/3" },
        { letter: "E", text: "1/2" },
      ],
      correct: "C",
      explanation:
        "Chame cada pote de 6 partes (MMC de 3 e 2). Pote 1 tem 2 partes de chocolate; Pote 2 tem 3 partes. Total de chocolate = 5 partes de 12 partes no total → 5/12! (Atenção ao distrator 5/6, que esquece de somar os dois potes).",
    },
    {
      id: "m1-2-q2",
      level: "Nível 2 • Contextual",
      prompt:
        "Um produto custava R$ 200,00. Sofreu um aumento de 20% e, na semana seguinte, um desconto de 20% sobre o novo preço. Qual o preço final?",
      alternatives: [
        { letter: "A", text: "R$ 200,00" },
        { letter: "B", text: "R$ 196,00" },
        { letter: "C", text: "R$ 192,00" },
        { letter: "D", text: "R$ 180,00" },
        { letter: "E", text: "R$ 204,00" },
      ],
      correct: "C",
      explanation:
        "Use fatores multiplicativos: 200 × 1,20 × 0,80 = 200 × 0,96 = R$ 192,00. Aumentar 20% e tirar 20% nunca volta para o mesmo valor!",
    },
    {
      id: "m1-2-q3",
      level: "Nível 1 • Fixação",
      prompt: "Qual é a fração geratriz da dízima periódica 0,777...?",
      alternatives: [
        { letter: "A", text: "7/10" },
        { letter: "B", text: "7/9" },
        { letter: "C", text: "7/99" },
        { letter: "D", text: "1/7" },
        { letter: "E", text: "7/100" },
      ],
      correct: "B",
      explanation:
        "Para dízima simples com 1 algarismo repetido após a vírgula, colocamos esse algarismo sobre um único 9: 7/9.",
    },
  ],
  "m1-5": [
    {
      id: "m1-5-q1",
      level: "Nível 1 • Fixação",
      prompt: "Simplificando a expressão (2⁵ × 2³) ÷ 2⁶, obtemos:",
      alternatives: [
        { letter: "A", text: "2" },
        { letter: "B", text: "4" },
        { letter: "C", text: "8" },
        { letter: "D", text: "16" },
        { letter: "E", text: "1" },
      ],
      correct: "B",
      explanation:
        "Na multiplicação de mesma base, soma-se os expoentes (5+3=8). Na divisão, subtrai-se (8-6=2). Fica 2² = 4.",
    },
    {
      id: "m1-5-q2",
      level: "Nível 2 • Contextual",
      prompt:
        "A distância média da Terra ao Sol é de aproximadamente 150.000.000 km. Como escrevemos esse valor em notação científica?",
      alternatives: [
        { letter: "A", text: "15 × 10⁷ km" },
        { letter: "B", text: "1,5 × 10⁷ km" },
        { letter: "C", text: "1,5 × 10⁸ km" },
        { letter: "D", text: "0,15 × 10⁹ km" },
        { letter: "E", text: "1,5 × 10⁹ km" },
      ],
      correct: "C",
      explanation:
        "Na notação científica, a mantissa deve ficar entre 1 e 10 (1,5). Como a vírgula andou 8 casas para a esquerda, o expoente é 8: 1,5 × 10⁸.",
    },
  ],
  "m1-3": [
    {
      id: "m1-3-q1",
      level: "Nível 2 • Contextual",
      prompt:
        "Em um mapa de escala 1 : 200.000, a distância entre duas cidades mede 4 cm. Qual é a distância real entre elas em quilômetros?",
      alternatives: [
        { letter: "A", text: "0,8 km" },
        { letter: "B", text: "8 km" },
        { letter: "C", text: "80 km" },
        { letter: "D", text: "800 km" },
        { letter: "E", text: "2 km" },
      ],
      correct: "B",
      explanation:
        "4 × 200.000 cm = 800.000 cm. Para passar de cm para km, corte 5 zeros (÷ 100.000): 8 km!",
    },
    {
      id: "m1-3-q2",
      level: "Nível 2 • Contextual",
      prompt:
        "Se 6 impressoras iguais imprimem um lote de apostilas em 4 horas, em quanto tempo 8 dessas impressoras imprimirão o mesmo lote?",
      alternatives: [
        { letter: "A", text: "2 horas" },
        { letter: "B", text: "3 horas" },
        { letter: "C", text: "5,3 horas" },
        { letter: "D", text: "6 horas" },
        { letter: "E", text: "3,5 horas" },
      ],
      correct: "B",
      explanation:
        "Mais impressoras = MENOS tempo (inversamente proporcionais!). Multiplique em linha: 6 × 4 = 8 × t → 24 = 8t → t = 3 horas.",
    },
  ],
  "m1-4": [
    {
      id: "m1-4-q1",
      level: "Nível 1 • Fixação",
      prompt:
        "A soma de dois números é 42 e a diferença entre eles é 10. Qual é o maior desses números?",
      alternatives: [
        { letter: "A", text: "16" },
        { letter: "B", text: "21" },
        { letter: "C", text: "26" },
        { letter: "D", text: "32" },
        { letter: "E", text: "24" },
      ],
      correct: "C",
      explanation:
        "x + y = 42 e x - y = 10. Somando as duas equações: 2x = 52 → x = 26 (e y = 16).",
    },
  ],
};

export function getLessonExercises(course: MathCourseItem): PracticeExercise[] {
  if (EXERCISES_BY_COURSE[course.id]) {
    return EXERCISES_BY_COURSE[course.id];
  }

  // Fallback didático alinhado ao tema exato da aula quando ainda não há lista customizada
  return [
    {
      id: `${course.id}-check-1`,
      level: "Nível 1 • Fixação",
      prompt: `Sobre o tema "${course.title}" (${course.axis}), qual é o foco principal que você deve dominar antes de partir para questões difíceis?`,
      alternatives: [
        { letter: "A", text: course.whatToStudy[0] || course.syllabus },
        {
          letter: "B",
          text: "Decorar apenas fórmulas isoladas sem entender o enunciado",
        },
        {
          letter: "C",
          text: "Pular direto para questões difíceis sem revisar a base",
        },
        { letter: "D", text: "Ignorar unidades de medida na resposta final" },
        { letter: "E", text: "Evitar fazer rascunho organizado" },
      ],
      correct: "A",
      explanation: `Na aula ${course.code}, o primeiro passo essencial é: ${course.whatToStudy[0] || course.syllabus}.`,
    },
  ];
}

export function findExerciseByIdOrTopic(
  exerciseId?: string,
  topic?: string,
): PracticeExercise | null {
  const all = [
    ...Object.values(EXERCISES_BY_COURSE).flat(),
    ...FOUNDATION_COURSES.flatMap((c) => c.exercises),
  ];
  if (exerciseId) {
    const exact = all.find((ex) => ex.id === exerciseId);
    if (exact) return exact;
  }
  if (topic) {
    const clean = topic.toLowerCase();
    const byPrefix = all.find((ex) =>
      clean.includes(ex.prompt.slice(0, 32).toLowerCase()),
    );
    if (byPrefix) return byPrefix;
  }
  return null;
}
