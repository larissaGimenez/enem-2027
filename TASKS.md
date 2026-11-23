# TASKS — Guia ENEM 2027

## Marco 1: MVP — Sistema Guia de Estudos
- [x] Definir arquitetura zero-dependência (HTML + CSS + JS + `localStorage` + JSON backup)
- [x] Criar documentação inicial (`ROADMAP.md`, `TASKS.md`, `DEVLOG.md`)
- [x] Estruturar dados iniciais dos 4 ciclos e matriz de conteúdos em `data.js`
- [x] Construir layout base e navegação por abas em `index.html` e `styles.css`
- [x] Implementar Dashboard (contagem regressiva, ciclo atual, barras de progresso)
- [x] Implementar Grade Semanal editável com marcação de sessões concluídas
- [x] Implementar Mapa de Conteúdos com filtros por Ciclo/Área e status (`A fazer`, `Estudando`, `Concluído`)
- [x] Implementar Diário de Redações e Caderno de Erros
- [x] Implementar persistência (`localStorage`) e Exportar/Importar JSON
- [x] Validar sintaxe JS com `node --check` e revisar fluxos principais

## Marco 2: Sistema Local MySQL + Base de Conhecimento ENEM
- [x] Verificar instância MySQL local no DBngin (`127.0.0.1:3306`, MySQL 8.4.2)
- [x] Atualizar documentação (`ROADMAP.md`, `TASKS.md`, `DEVLOG.md`)
- [x] Criar schema SQL do banco `enem_2027` (`exams`, `questions`, `alternatives` e tabelas de estudo)
- [x] Configurar backend Node.js (`package.json`, `mysql2`, `dotenv`, `express`)
- [x] Criar script de importação das provas do ENEM (2014–2023 via `api.enem.dev` + importador de JSON local para 2024/2025)
- [x] Executar importação dos últimos 10 anos e validar contagens no MySQL (`10` provas, `1790` questões únicas, `8945` alternativas)
- [x] Criar servidor API local (`server.js`) com endpoints para provas/questões e estado de estudo
- [x] Conectar frontend (`app.js`) ao MySQL (`/api/study-state/...`) com migração automática do `localStorage`
- [x] Adicionar aba `Banco de Questões` com filtros, resolução interativa e envio ao Caderno de Erros
- [x] Aplicar Design System (`ui-ux-pro-max`: paleta roxo/lavanda, tipografia Fredoka/Nunito, foco acessível)

## Marco 3: Frontend React + Sidebar + `@beui/sortable-stack`
- [x] Criar projeto React + Vite + TypeScript + Tailwind CSS em `client/`
- [x] Configurar `shadcn` e importar componentes padrão de `beUI/` (`animated-sidebar`, `sortable-stack`, `card`, `button`, `input`, `animated-badge`, `animated-number`, `pagination`)
- [x] Implementar layout com **Menu Lateral (`AnimatedSidebar`)** responsivo e acessível (`ui-ux-pro-max`)
- [x] Migrar todas as 6 abas (`Visão Geral`, `Grade Semanal` com `SortableStack`, `Mapa de Conteúdos`, `Redações`, `Caderno de Erros`, `Banco de Questões`)
- [x] Conectar `server.js` para servir `client/dist` e validar build (`tsc -b && vite build`) + fluxo completo

## Marco 4: Sessão de Estudos (Pomodoro) + Tema Moderno EdTech
- [x] Atualizar tema e paleta moderna (Sidebar escura `#0F172A`, canvas `#F4F6FB`, Indigo `#4F46E5`, Emerald `#10B981`, Plus Jakarta Sans + Inter)
- [x] Criar componente **Pomodoro Study Session** usando `beUI` (`DigitSwap`, `Card`, `Button`, `AnimatedBadge`) com registro automático de minutos no MySQL
- [x] Redesenhar Dashboard em **Bento Grid** com atalho para iniciar sessão de estudos e iniciar direto da Grade Semanal
- [x] Validar build (`tsc -b && vite build`) e servidor na porta `3000`

## Marco 5: Grade Curricular de Matemática (Estilo Faculdade)
- [x] Modelar matriz curricular de Matemática (`client/src/data/mathCurriculum.ts`) com 4 períodos, pré-requisitos e carga horária
- [x] Construir `MathCurriculumTab.tsx` usando componentes `beUI` (`Card`, `AnimatedBadge`, `AnimatedNumber`, `Button`)
- [x] Conectar Grade de Matemática à `AnimatedSidebar`, ao `QuestionBankTab` (filtro inicial) e ao Pomodoro
- [x] Validar build (`tsc -b && vite build`) e servidor na porta `3000`

## Marco 6: Metodologia Avançada (Nivelamento, Core vs. Diferencial, RAD/Feynman e Lista Global)
- [x] Adicionar endpoint `/api/questions/random` no `server.js` e expandir `StudyState` (`studyLevel`, `weeklyTargets`)
- [x] Classificar Grade de Matemática em `Core (80%)` vs. `Diferencial (20%)` com filtro dedicado
- [x] Adicionar Folha em Branco (Active Recall) e preset `Autoexplicação 5m` na Sessão de Estudo
- [x] Adicionar Alvos de Ataque da Semana na Grade Semanal e Nivelamento `R1/R2/R3` no Dashboard
- [x] Adicionar Confiança, Checkpoint anti-distração e Gerador de Lista Global (10 questões) no Banco de Questões
- [x] Validar build (`tsc -b && vite build`) e testar APIs no MySQL

## Marco 7: Redesign UI/UX (Design System Esmeralda Light Mode — Referência Protocolo ENEM)
- [x] **Fase 1:** Aplicar tokens CSS Light Mode (`#F5F6F8`, `#FFFFFF`, Esmeralda `#059669`, Obsidiana `#0F172A`), nova Sidebar branca agrupada (`APRENDER`, `PRATICAR`, `ORGANIZAR`) e novo Dashboard `Início` (`DashboardHome.tsx`) com KPIs, Agenda lateral, Em andamento, Seu ritmo, Domínio por área e Suas matérias
- [x] **Fase 2:** Redesenhar Catálogo de `Aulas` + `Sala de Aula` (`Missão da aula` + `Neste conteúdo`) com **indexação de múltiplos vídeos do YouTube pela usuária** (salvos no MySQL)
- [x] **Fase 3:** Unificar Hub de `Questões` (`Banco de questões` | `Minhas listas` | `Caderno de erros` | `Desempenho`) com painel direito de filtros, riscar alternativas, modo prova com Cartão-Resposta e modal de 6 motivos no Caderno de Erros
- [x] **Fase 4:** Implementar `Cartões revisionais` (desbloqueados por aula + repetição espaçada), `Simulados` (1º/2º Dia) e nova `Rotina` (banner verde, calendário semanal/mensal, Pomodoro com registro e wizard `Montar cronograma`)

## 🧊 Icebox / Ideias Futuras
- Registro de notas de simulados por área (TRI / acertos)
