# DEVLOG — Guia ENEM 2027

## 2026-11-23 — Início do Projeto & Entrega do MVP
- **Decisão Arquitetural:** Optado por aplicação web estática pura (HTML5, CSS3, JavaScript vanilla) com persistência em `localStorage` e backup em JSON. Motivo: zero fricção para abrir no dia a dia (basta abrir o `index.html`), sem dependência de Node/Python ou servidores rodando, mantendo o foco total nos estudos.
- **Estrutura de Dados:** Os conteúdos foram organizados nos 4 ciclos progressivos definidos no planejamento (1. Alicerce, 2. Construção, 3. Expansão, 4. Reta Final) e nas 4 áreas do ENEM + Redação.
- **MVP Concluído:** Implementadas todas as 5 abas (`Visão Geral`, `Grade Semanal`, `Mapa de Conteúdos`, `Redações`, `Caderno de Erros`) e exportação/importação de backup JSON. Sintaxe validada via `node --check`.

## 2026-11-23 — Evolução para Sistema Local com MySQL (Marco 2)
- **Decisão Arquitetural:** Evolução do app estático para sistema full-stack local com **MySQL 8.4.2** (via **DBngin** na porta `3306`) e backend **Node.js** (`express` + `mysql2`).
- **Base de Conhecimento ENEM:** Modelagem relacional (`exams`, `questions`, `alternatives`) alimentada inicialmente pela API aberta `api.enem.dev` (edições 2014–2023, totalizando 10 anos disponíveis na API) com suporte a importação de arquivos JSON locais para edições mais recentes (2024/2025).
- **Carga Inicial Concluída:** Importadas **10 provas** (`2014` a `2023`) e **1.821 questões** com suas alternativas para o banco `enem_2027` no MySQL local, além do servidor API em `server.js`.
- **Marco 2 Concluído (Frontend + MySQL + UI/UX):**
  - Instalada a skill `ui-ux-pro-max` em `~/.gemini/config/skills/ui-ux-pro-max` e aplicado o Design System (paleta `#7C3AED` / `#FAF5FF` / `#059669`, tipografia `Fredoka` + `Nunito`, foco visível e `prefers-reduced-motion`).
  - Frontend conectado à API MySQL (`/api/study-state/...`) com migração automática do `localStorage`.
  - Nova aba **Banco de Questões** com filtros (ano, área, idioma, busca), resolução interativa e atalho para o **Caderno de Erros**.

## 2026-11-23 — Migração para React + Vite + Tailwind + beUI (Marco 3)
- **Frontend Moderno (`client/`):** Migrado para React + Vite + TypeScript + Tailwind CSS v4, adotando os componentes da pasta local `beUI/` como padrão (`AnimatedSidebar`, `SortableStack`, `Card`, `Button`, `Input`, `AnimatedBadge`, `AnimatedNumber`, `Pagination`).
- **Menu Lateral & Sortable Stack:** Substituído o menu superior pelo `AnimatedSidebar` colapsável/responsivo e integrada a reordenação por drag-and-drop + teclado + Desfazer (`SortableStack`) na **Grade Semanal**.
- **Integração:** `server.js` configurado para servir `client/dist` em produção mantendo a API MySQL.

## 2026-11-23 — Sessão de Estudos Pomodoro + Redesign Bento EdTech (Marco 4)
- **Tema Moderno EdTech:** Sidebar escura (`#0F172A`), fundo `#F4F6FB`, acentos Indigo (`#4F46E5`) / Emerald (`#10B981`) / Amber (`#F59E0B`), tipografia `Plus Jakarta Sans` + `Inter` e Dashboard em Bento Grid.
- **Pomodoro Integrado:** Criado `PomodoroSessionCard.tsx` com `DigitSwap` da `beUI`, presets (`25m`, `50m`, `5m`, `15m`), vínculo com a Grade Semanal e registro automático de horas/sessões no MySQL.

## 2026-11-23 — Grade Curricular de Matemática (Marco 5)
- **Matriz Universitária (`mathCurriculum.ts`):** Estruturadas 22 disciplinas (`MAT-101` a `MAT-404`) em 4 períodos progressivos com ementa, carga horária estimada, incidência no ENEM e pré-requisitos.
- **Interface (`MathCurriculumTab.tsx`):** Visualização em 4 colunas por período, abertura de **Guia do Tema** (o que estudar, dicas de como cai no ENEM, roteiro sugerido) e atalho para **Questões no Banco**; seleção de tema separada movida para a tela **Sessão de Estudo**.

## 2026-11-23 — Metodologia Avançada dos 3 Vídeos (Marco 6)
- **Nivelamento & Estratégia:** Adicionado seletor `R1 / R2 / R3` no Dashboard e classificação `Core (80%)` vs. `Diferencial Competitivo (20%)` na Grade de Matemática.
- **Active Recall & Ataque Certeiro:** Adicionados **Folha em Branco (Active Recall)** e **Autoexplicação 5m (RAD/Feynman)** na Sessão de Estudo, além de **Alvos de Ataque da Semana** na Grade Semanal.
- **Diagnóstico & Lista Global:** Criado `GET /api/questions/random` no `server.js` e adicionados **Lista Global (10 misturadas)**, **Grau de Confiança** e **Checkpoint anti-distração** no Banco de Questões.
- **Consolidação da Grade de Matemática (`data/*.txt`):** Processadas todas as 4 transcrições locais (~2,7 MB: Ensino Fundamental, Curso Completo ENEM 28h e 2 vídeos de Macetes/Distratores), expandindo `mathCurriculum.ts` para **26 disciplinas** (`MAT-100` a `MAT-404`) sem duplicações, com guias didáticos, macetes de prova e dicas anti-distrator.
- **Jornada Plataforma de Curso (`StudyRoom.tsx` + `mathLessonContent.ts`):** Unificada a experiência do estudante: ao clicar em **Iniciar Aula** no Cronograma Semanal (com vínculo `courseId` por dia) ou na Grade de Matemática, abre a **Sala de Aula** com Mini-Pomodoro no topo e 3 etapas integradas (**1. Aula Teórica com exemplo resolvido e fórmulas** → **2. Folha em Branco 5m** → **3. Questões do Tema no MySQL** → **Concluir e Ir para Próxima**).
- **Cronograma por Semanas (`ScheduleTab.tsx` + `weeklyPlanData.ts`):** Redesenhado no formato do print de referência com cabeçalho `SEMANA 1..N`, barra de conclusão do cronograma, linhas em pílula por matéria (ícone colorido, botão Play para abrir a Sala de Aula, selo de Importância, checks circulares `AULA` / `REV 1` / `REV 2` e campo `Questões Feitas / Certas`), tudo persistido no MySQL e reordenável com `SortableStack`.


## 2026-11-23 — Redesign UI/UX — Fase 1 (Design System Esmeralda Light Mode + Sidebar + Início)
- **Design System (`client/src/index.css`):** Adotada paleta Light Mode limpa inspirada no tour de referência (sem dark mode, mantendo leveza): canvas `#F5F6F8`, cards `#FFFFFF` com borda sutil `#E5E7EB`, primária Verde Esmeralda `#059669`, acento menta `#ECFDF5` e superfícies `.surface-obsidian` e `.surface-emerald-hero`.
- **Sidebar Agrupada (`client/src/App.tsx`):** Substituída a sidebar escura pela `.protocol-sidebar` branca com seções `APRENDER` (`Início`, `Aulas`), `PRATICAR` (`Questões`, `Simulados`, `Cartões`, `Redação`) e `ORGANIZAR` (`Rotina`, `Mapa do Edital`), rodapé compacto com `Tempo` (Pomodoro) + backup JSON + status MySQL, e exclusões respeitadas (sem 3D/mascote, sem O Ninho e sem Suporte Psicológico).
- **Novo Dashboard (`client/src/components/DashboardHome.tsx`):** 4 KPIs no topo (`Questões na semana`, `Ofensiva`, `XP na semana`, `Tempo de estudo`), coluna esquerda com `Agenda` interativa (7 dias + tarefas + Play direto para a aula) e `Constância & Perfil` (`R1/R2/R3` + ciclo), e coluna direita com `Em andamento`, `Seu ritmo` (`XP | Questões | Tempo`), `Domínio por área` e `Suas matérias`. Build (`tsc -b && vite build`) validado com sucesso e API ativa em `http://localhost:3000`.

## 2026-11-23 — Redesign UI/UX — Fase 2 (Aulas em Acordeão + Sala de Aula com YouTube)
- **Catálogo `Aulas` (`client/src/components/MathCurriculumTab.tsx`):** Card de destaque "De onde você parou" (`Continuar aula →`), card escuro `.surface-obsidian` com progresso e contagem de vídeos do YouTube indexados, barra de filtros (`Todas | Core 80% | Diferencial 20%`, status e busca) e sumário em acordeão por Ciclos.
- **Sala de Aula (`client/src/components/StudyRoom.tsx`):** Layout em 2 colunas com player **YouTube embed** e indexador de **múltiplos vídeos por aula** (`lessonVideos` salvo no MySQL), abas `Materiais e Teoria` / `Anotações (Active Recall)` (`lessonNotes` com auto-save no MySQL) / `Questões do Tema` / `Cartões da Aula`, além do painel direito `Missão da aula` (`+45 XP`, `Marcar como concluída`, `Pular`) e `Neste conteúdo`. Build (`tsc -b && vite build`) aprovado.

## 2026-11-23 — Redesign UI/UX — Fase 3 (Hub de Questões + Caderno de Erros + Desempenho)
- **Banco de Questões (`client/src/components/QuestionBankTab.tsx`):** Layout em 2 colunas com painel direito `Filtros` (`Situação: Todas | Nunca respondi | Errei | Acertei`, Área, Ano, Idioma, Palavra-chave), botão de **riscar alternativas** (`Scissors`), Grau de Confiança e registro automático de tentativas (`questionAttempts`) no MySQL.
- **Minhas Listas & Modo Prova:** Gerador de listas (`Monte sua lista` / `Lista Global`), **Cartão-Resposta** lateral interativo, modal `Entregar a lista?`, tela de resultado com percentual e botão `Guardar erros no caderno`.
- **Caderno de Erros (`ErrorNotebookTab.tsx` + `ErrorReasonModal.tsx`):** Modal com os **6 motivos** (`Não sabia o conteúdo`, `Interpretei errado`, `Errei a conta`, `Falta de atenção`, `Faltou tempo`, `Chutei`) + observação; card `.surface-obsidian` `Refazer em sequência` + gráfico `Por que você erra` + painel direito `Organizar`.
- **Desempenho (`PerformanceTab.tsx`):** Sub-abas `Visão geral`, `Acertos e erros` e `Revisão` alimentadas pelo histórico real no MySQL. Build (`tsc -b && vite build`) aprovado.

## 2026-11-23 — Redesign UI/UX — Fase 4 (Cartões Revisionais + Simulados + Rotina)
- **Cartões Revisionais (`client/src/components/CardsTab.tsx`):** Geração automática de flashcards a partir das fórmulas-chave e dicas ENEM de cada aula concluída (`unlocked` quando `topicStatus === "done"`), com cards `Tudo em dia`, `Coleção`, `Acerto`, `Próximos 7 dias`, sessão de **Repetição Espaçada** (`Errei 1d / Difícil 2d / Bom 4d / Fácil 7d`) e filtro lateral por eixos.
- **Simulados ENEM (`client/src/components/SimuladosTab.tsx`):** Banner verde `.surface-emerald-hero`, modos `1º Dia (Linguagens & Humanas)`, `2º Dia (Matemática & Natureza)` e `Simulado Focado — Matemática`, cronômetro, riscar alternativas, **Cartão-Resposta** interativo, envio de erros ao caderno e histórico salvo em `simuladoHistory` no MySQL.
- **Rotina & Wizard (`ScheduleTab.tsx` + `RoutineWizardModal.tsx`):** Banner verde `Sua rotina` com próxima atividade, metas da semana, dias em cards e modal **`Montar cronograma`** com prévia escura `.surface-obsidian` ao vivo. Build (`tsc -b && vite build`) aprovado e validado em `http://localhost:3000`.

## 2026-11-23 — Módulo Completo de Redação ENEM (`RedacaoTab.tsx`)
- **KPIs & Matriz C1–C5:** Cards de `Redações`, `Última nota`, `Média geral` e painel escuro `.surface-obsidian` com a média em cada uma das 5 competências oficiais (`C1` a `C5`, escala `0–200`).
- **Editor & Autoavaliação:** Escrita com contador de palavras e estimativa de linhas (`~30 linhas ENEM`), campo de repertórios/tese, pontuação em múltiplos de `40` (`0..200`) calculando a nota total (`0–1000`) ao vivo e **Checklist da Proposta de Intervenção (C5 — 5 elementos)**.
- **Banco de Temas & Histórico:** 6 temas atuais estilo ENEM com repertórios sugeridos (`Usar este tema`) e histórico detalhado salvo no MySQL. Build (`tsc -b && vite build`) aprovado.

## 2026-11-23 — Adaptação Estratégica: Ciência da Computação — Unicamp (ENEM + COMVEST)
- **Meta & Rotina (`App.tsx`, `ScheduleTab.tsx`):** Meta padrão atualizada para **Ciência da Computação — Unicamp**, com selo de referência no banner (`Alvo: ~755+ ENEM • ~56/72 COMVEST`).
- **Redação (`RedacaoTab.tsx`):** Adicionado seletor **`Modelo ENEM (0–1000)` | `Modelo Unicamp COMVEST (0–48)`**, seletor de gêneros textuais (`Carta Aberta`, `Artigo de Opinião`, `Discurso`, `Manifesto`, `Crônica`, `Reportagem`), checklist específico de gênero e 4 propostas de gêneros COMVEST no Banco de Temas.
- **Sala de Aula (`StudyRoom.tsx`):** Adicionado atalho `+ Roteiro 2ª Fase Unicamp` na aba `Anotações (Active Recall)` para treino de resolução dissertativa passo a passo. Build (`tsc -b && vite build`) aprovado.

## 2026-11-23 — Exercícios de Fixação por Aula (`mathExercises.ts` + `StudyRoom.tsx`)
- **Diagnóstico:** A aula `MAT-100` tinha `searchKeyword: ""`, fazendo a aba `Questões do Tema` listar todas as 433 questões do banco sem filtro (incluindo itens de Natureza marcados no 2º Dia) e jogando iniciantes direto em questões longas de prova.
- **Solução:** Criado `client/src/data/mathExercises.ts` com exercícios graduados (`Nível 1 • Fixação`, `Nível 2 • Contextual`, `Nível 3 • ENEM/Unicamp`) com resolução comentada passo a passo para as aulas iniciais (`MAT-100` a `MAT-105`), e adicionados 2 sub-modos na aba `Questões do Tema` da `StudyRoom.tsx`: **`1. Exercícios de Fixação`** (padrão) e **`2. Questões Reais do ENEM (MySQL)`**. Build (`tsc -b && vite build`) aprovado.

## 2026-11-23 — Módulo 0: Básico do Básico para Todas as Matérias (`foundationCourses.ts`)
- **Conteúdo do Zero Absoluto (`client/src/data/foundationCourses.ts`):** Criadas **15 aulas introdutórias** (3 para **Biologia**, 3 para **Física**, 3 para **Química**, 3 para **Linguagens** e 3 para **Ciências Humanas**), com teoria didática em analogias simples, exemplos resolvidos, ideias-chave, dicas ENEM e **exercícios de fixação com resolução comentada**.
- **Integração Completa (`MathCurriculumTab.tsx`, `StudyRoom.tsx`, `mathExercises.ts`):** Todas as matérias no catálogo de `Aulas` agora abrem sua lista do Módulo 0 e entram na `Sala de Aula` (com indexação de vídeos do YouTube, anotações, exercícios de fixação, cartões e `Refazer em sequência` no Caderno de Erros). Build (`tsc -b && vite build`) aprovado.
