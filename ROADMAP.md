# ROADMAP — Guia ENEM 2027

## Visão do Produto
Um sistema pessoal, leve e sem distrações para guiar a preparação do zero até o ENEM de novembro de 2027, transformando o plano de 4 ciclos (Alicerce, Construção, Expansão e Reta Final) em uma rotina semanal realista e mensurável.

## Critérios de Sucesso (MVP)
- Funcionar localmente no navegador sem necessidade de instalação complexa ou servidor pago.
- Mostrar claramente o progresso geral, por ciclo e por área do conhecimento.
- Permitir configurar e acompanhar a grade semanal de estudos (incluindo "Dia Coringa").
- Ter checklist completo dos conteúdos dos 4 ciclos (baseado no plano definido).
- Incluir registro simples de Redações e Caderno de Erros.
- Salvar tudo automaticamente no navegador (`localStorage`) com opção de backup (Exportar/Importar JSON).

## Marcos (Milestones)
- **Marco 1 (MVP — Concluído):** Estrutura base HTML/CSS/JS, Dashboard, Grade Semanal, Mapa de Conteúdos dos 4 Ciclos, Diário de Redações, Caderno de Erros e Backup JSON.
- **Marco 2 (Sistema Local + MySQL — Concluído):** Banco de dados local MySQL (via DBngin), API local em Node.js (`mysql2`), importação das provas do ENEM (`2014–2023`), persistência no MySQL e aba Banco de Questões.
- **Marco 3 (Frontend Moderno React + Sidebar + Sortable Stack — Concluído):** Migração da interface para **React + Vite + Tailwind CSS + shadcn**, substituição do menu superior por **Sidebar lateral responsiva** e integração nativa do **`@beui/sortable-stack`**.
- **Marco 4 (Sessão de Estudos Pomodoro + Redesign Bento EdTech — Concluído):** Timer Pomodoro integrado à sessão de estudos (com presets de foco/pausa e registro automático de horas no MySQL), além de novo tema moderno inspirado em plataformas de estudo.
- **Marco 5 (Grade Curricular de Matemática — Concluído):** Cronograma anual de Matemática no estilo grade universitária (4 períodos progressivos, códigos `MAT-101`..., guia de estudo por tema e atalho para Banco de Questões).
- **Marco 6 (Metodologia Avançada de Estudos — Atual):** Integração dos métodos dos 3 vídeos: Nivelamento `R1/R2/R3`, classificação `Core (80%)` vs. `Diferencial Competitivo (20%)`, Folha em Branco + Autoexplicação 5m (RAD/Feynman), Alvos de Ataque da Semana, Diagnóstico de Confiança + Checkpoints e Lista Global (10 questões misturadas no MySQL).

## Fora de Escopo (Não faremos agora)
- Login/cadastro em nuvem ou hospedagem remota.
- Correção automática de redação por IA dentro do app.
