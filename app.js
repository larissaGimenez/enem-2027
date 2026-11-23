(function () {
  const STORAGE_KEY = "guia_enem_2027_state_v1";
  const data = window.ENEM_DATA;
  let syncTimer = null;
  let apiConnected = false;

  function normalizeState(parsed) {
    return {
      currentCycle: parsed?.currentCycle || "ciclo-1",
      totalMinutes: Number(parsed?.totalMinutes) || 0,
      topicStatus: parsed?.topicStatus || {},
      schedule: Array.isArray(parsed?.schedule) ? parsed.schedule : JSON.parse(JSON.stringify(data.defaultSchedule)),
      essays: Array.isArray(parsed?.essays) ? parsed.essays : [],
      errors: Array.isArray(parsed?.errors) ? parsed.errors : []
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return normalizeState(JSON.parse(raw));
      }
    } catch (e) {
      console.warn("Erro ao carregar dados salvos:", e);
    }
    return normalizeState({});
  }

  let state = loadState();
  let editingDayIndex = null;

  function setDbStatus(text, ok) {
    const pill = document.getElementById("db-status-pill");
    if (!pill) return;
    pill.textContent = text;
    pill.classList.toggle("is-online", Boolean(ok));
    pill.classList.toggle("is-offline", !ok);
  }

  function syncStateToApi() {
    if (!apiConnected) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
      try {
        await fetch(`/api/study-state/${STORAGE_KEY}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state)
        });
      } catch (err) {
        console.warn("Falha ao sincronizar com MySQL:", err);
      }
    }, 300);
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncStateToApi();
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // --- Navegação por Abas ---
  function switchTab(tabId) {
    document.querySelectorAll(".tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${tabId}`);
    });
  }

  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.goto));
  });

  // --- Contagem Regressiva ---
  function renderCountdown() {
    const pill = document.getElementById("countdown-pill");
    const today = new Date();
    const target = new Date(data.targetDate + "T09:00:00");
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      const months = Math.floor(diffDays / 30);
      pill.textContent = `Faltam ~${diffDays} dias (${months} meses) para o ENEM 2027`;
    } else if (diffDays === 0) {
      pill.textContent = "Hoje é dia de prova!";
    } else {
      pill.textContent = "Ciclo ENEM 2027";
    }
  }

  // --- Dashboard ---
  function renderDashboard() {
    const cycleSelect = document.getElementById("current-cycle-select");
    cycleSelect.innerHTML = data.cycles
      .map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
      .join("");
    cycleSelect.value = state.currentCycle;

    const activeCycle = data.cycles.find((c) => c.id === state.currentCycle) || data.cycles[0];
    document.getElementById("cycle-period-hint").textContent = activeCycle.period;
    document.getElementById("cycle-focus-banner").innerHTML = `
      <strong>Foco do ciclo (${escapeHtml(activeCycle.name)}):</strong> ${escapeHtml(activeCycle.focus)}
      <br><span class="muted small">Proporção sugerida: ${escapeHtml(activeCycle.proportion)}</span>
    `;

    // Progresso geral
    const totalTopics = data.topics.length;
    const doneTopics = data.topics.filter((t) => state.topicStatus[t.id] === "done").length;
    const pct = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;
    document.getElementById("overall-progress-text").textContent = `${pct}%`;
    document.getElementById("overall-progress-fill").style.width = `${pct}%`;
    document.getElementById("overall-counts-hint").textContent = `${doneTopics} de ${totalTopics} tópicos concluídos`;

    // Horas totais
    const h = Math.floor(state.totalMinutes / 60);
    const m = state.totalMinutes % 60;
    document.getElementById("total-hours-text").textContent = `${h}h ${String(m).padStart(2, "0")}m`;

    // Progresso por área
    const areaList = document.getElementById("area-progress-list");
    areaList.innerHTML = data.areas
      .map((area) => {
        const items = data.topics.filter((t) => t.area === area.id);
        const done = items.filter((t) => state.topicStatus[t.id] === "done").length;
        const areaPct = items.length ? Math.round((done / items.length) * 100) : 0;
        return `
          <div>
            <div class="area-item-head">
              <span>${escapeHtml(area.name)}</span>
              <span>${done}/${items.length} (${areaPct}%)</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${areaPct}%; background:${area.color}"></div>
            </div>
          </div>
        `;
      })
      .join("");

    // Prévia da semana
    const preview = document.getElementById("dashboard-week-preview");
    preview.innerHTML = state.schedule
      .map(
        (d) => `
        <div class="mini-day ${d.done ? "done" : ""}">
          <span><strong>${escapeHtml(d.day)}</strong> · ${escapeHtml(d.subject)}</span>
          <span>${d.done ? "✓ Feito" : d.duration > 0 ? `${d.duration} min` : "Livre"}</span>
        </div>
      `
      )
      .join("");
  }

  document.getElementById("current-cycle-select").addEventListener("change", (e) => {
    state.currentCycle = e.target.value;
    saveState();
    renderDashboard();
  });

  // --- Grade Semanal ---
  function renderSchedule() {
    const container = document.getElementById("schedule-list");
    container.innerHTML = state.schedule
      .map((item, idx) => {
        if (editingDayIndex === idx) {
          return `
            <div class="day-card">
              <div class="day-card-head">
                <span class="day-name">${escapeHtml(item.day)}</span>
              </div>
              <div class="day-edit-form">
                <input type="text" id="edit-subj-${idx}" value="${escapeHtml(item.subject)}" placeholder="Matéria / Foco" />
                <input type="text" id="edit-task-${idx}" value="${escapeHtml(item.task)}" placeholder="O que fazer" />
                <input type="number" id="edit-dur-${idx}" value="${item.duration}" min="0" max="480" placeholder="Minutos" />
                <div class="day-actions">
                  <button class="btn btn-primary" data-save-day="${idx}">Salvar</button>
                  <button class="btn btn-secondary" data-cancel-day>Cancelar</button>
                </div>
              </div>
            </div>
          `;
        }

        return `
          <div class="day-card ${item.done ? "done" : ""}">
            <div class="day-card-head">
              <span class="day-name">${escapeHtml(item.day)}</span>
              <span class="day-duration">${item.duration > 0 ? `${item.duration} min` : "Descanso"}</span>
            </div>
            <div class="day-subject">${escapeHtml(item.subject)}</div>
            <div class="day-task">${escapeHtml(item.task)}</div>
            <div class="day-actions">
              <button class="btn ${item.done ? "btn-secondary" : "btn-primary"}" data-toggle-day="${idx}">
                ${item.done ? "✓ Concluído" : "Marcar feito"}
              </button>
              <button class="btn-link" data-edit-day="${idx}">Editar</button>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll("[data-toggle-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.toggleDay);
        const day = state.schedule[idx];
        day.done = !day.done;
        if (day.done) {
          state.totalMinutes += Number(day.duration) || 0;
        } else {
          state.totalMinutes = Math.max(0, state.totalMinutes - (Number(day.duration) || 0));
        }
        saveState();
        renderSchedule();
        renderDashboard();
      });
    });

    container.querySelectorAll("[data-edit-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        editingDayIndex = Number(btn.dataset.editDay);
        renderSchedule();
      });
    });

    container.querySelectorAll("[data-cancel-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        editingDayIndex = null;
        renderSchedule();
      });
    });

    container.querySelectorAll("[data-save-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.saveDay);
        state.schedule[idx].subject = document.getElementById(`edit-subj-${idx}`).value.trim() || "Estudo";
        state.schedule[idx].task = document.getElementById(`edit-task-${idx}`).value.trim() || "";
        state.schedule[idx].duration = Math.max(0, Number(document.getElementById(`edit-dur-${idx}`).value) || 0);
        editingDayIndex = null;
        saveState();
        renderSchedule();
        renderDashboard();
      });
    });
  }

  document.getElementById("btn-reset-week").addEventListener("click", () => {
    state.schedule.forEach((d) => {
      d.done = false;
    });
    saveState();
    renderSchedule();
    renderDashboard();
  });

  // --- Mapa de Conteúdos ---
  function initTopicFilters() {
    const cycleSel = document.getElementById("filter-cycle");
    data.cycles.forEach((c) => {
      cycleSel.insertAdjacentHTML("beforeend", `<option value="${c.id}">${escapeHtml(c.name)}</option>`);
    });

    const areaSel = document.getElementById("filter-area");
    data.areas.forEach((a) => {
      areaSel.insertAdjacentHTML("beforeend", `<option value="${a.id}">${escapeHtml(a.name)}</option>`);
    });

    ["filter-cycle", "filter-area", "filter-status", "filter-search"].forEach((id) => {
      document.getElementById(id).addEventListener("input", renderTopics);
    });
  }

  function renderTopics() {
    const cycleVal = document.getElementById("filter-cycle").value;
    const areaVal = document.getElementById("filter-area").value;
    const statusVal = document.getElementById("filter-status").value;
    const query = document.getElementById("filter-search").value.trim().toLowerCase();

    const filtered = data.topics.filter((t) => {
      const st = state.topicStatus[t.id] || "todo";
      if (cycleVal !== "all" && t.cycle !== cycleVal) return false;
      if (areaVal !== "all" && t.area !== areaVal) return false;
      if (statusVal !== "all" && st !== statusVal) return false;
      if (query && !(`${t.title} ${t.sub}`.toLowerCase().includes(query))) return false;
      return true;
    });

    const container = document.getElementById("topics-list");
    if (!filtered.length) {
      container.innerHTML = `<div class="empty-state">Nenhum tópico encontrado com esses filtros.</div>`;
      return;
    }

    container.innerHTML = filtered
      .map((t) => {
        const st = state.topicStatus[t.id] || "todo";
        const cycleObj = data.cycles.find((c) => c.id === t.cycle);
        const areaObj = data.areas.find((a) => a.id === t.area);
        return `
          <div class="topic-row status-${st}">
            <div class="topic-info">
              <div class="topic-badges">
                <span class="badge">${escapeHtml(cycleObj ? cycleObj.name : t.cycle)}</span>
                <span class="badge" style="color:${areaObj ? areaObj.color : "#333"}">${escapeHtml(areaObj ? areaObj.name : t.area)}</span>
              </div>
              <div class="topic-title">${escapeHtml(t.title)}</div>
              <div class="topic-sub">${escapeHtml(t.sub)}</div>
            </div>
            <select class="status-select ${st}" data-topic-id="${t.id}">
              <option value="todo" ${st === "todo" ? "selected" : ""}>A fazer</option>
              <option value="doing" ${st === "doing" ? "selected" : ""}>Estudando</option>
              <option value="done" ${st === "done" ? "selected" : ""}>Concluído</option>
            </select>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".status-select").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        state.topicStatus[e.target.dataset.topicId] = e.target.value;
        saveState();
        renderTopics();
        renderDashboard();
      });
    });
  }

  // --- Diário de Redações ---
  function renderEssays() {
    const list = document.getElementById("essays-list");
    if (!state.essays.length) {
      list.innerHTML = `<div class="empty-state">Nenhuma redação registrada ainda. Comece treinando só a introdução e a tese!</div>`;
      return;
    }
    list.innerHTML = state.essays
      .map(
        (item, idx) => `
        <div class="record-card">
          <div class="record-head">
            <span class="record-title">${escapeHtml(item.theme)}</span>
            <button class="btn-danger-ghost" data-del-essay="${idx}">Excluir</button>
          </div>
          <div class="record-meta">${escapeHtml(item.date)} · ${escapeHtml(item.stage)}</div>
          ${item.notes ? `<div class="record-body">${escapeHtml(item.notes)}</div>` : ""}
        </div>
      `
      )
      .join("");

    list.querySelectorAll("[data-del-essay]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.essays.splice(Number(btn.dataset.delEssay), 1);
        saveState();
        renderEssays();
      });
    });
  }

  document.getElementById("essay-date").valueAsDate = new Date();
  document.getElementById("essay-form").addEventListener("submit", (e) => {
    e.preventDefault();
    state.essays.unshift({
      theme: document.getElementById("essay-theme").value.trim(),
      stage: document.getElementById("essay-stage").value,
      date: document.getElementById("essay-date").value,
      notes: document.getElementById("essay-notes").value.trim()
    });
    saveState();
    e.target.reset();
    document.getElementById("essay-date").valueAsDate = new Date();
    renderEssays();
  });

  // --- Caderno de Erros ---
  function renderErrors() {
    const list = document.getElementById("errors-list");
    if (!state.errors.length) {
      list.innerHTML = `<div class="empty-state">Seu caderno de erros está vazio. Quando errar uma questão, anote aqui o motivo para revisar depois.</div>`;
      return;
    }
    list.innerHTML = state.errors
      .map(
        (item, idx) => `
        <div class="record-card">
          <div class="record-head">
            <span class="record-title">${escapeHtml(item.topic)}</span>
            <button class="btn-danger-ghost" data-del-error="${idx}">Excluir</button>
          </div>
          <div class="record-meta">${escapeHtml(item.area)} · ${escapeHtml(item.type)} · ${escapeHtml(item.date)}</div>
          <div class="record-body">${escapeHtml(item.lesson)}</div>
        </div>
      `
      )
      .join("");

    list.querySelectorAll("[data-del-error]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.errors.splice(Number(btn.dataset.delError), 1);
        saveState();
        renderErrors();
      });
    });
  }

  document.getElementById("error-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const today = new Date().toISOString().slice(0, 10);
    state.errors.unshift({
      area: document.getElementById("error-area").value,
      topic: document.getElementById("error-topic").value.trim(),
      type: document.getElementById("error-type").value,
      lesson: document.getElementById("error-lesson").value.trim(),
      date: today
    });
    saveState();
    e.target.reset();
    renderErrors();
  });

  // --- Backup JSON (Exportar / Importar) ---
  document.getElementById("btn-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guia-enem-2027-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("input-import").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!imported || typeof imported !== "object") throw new Error("Formato inválido");
        state = {
          currentCycle: imported.currentCycle || "ciclo-1",
          totalMinutes: Number(imported.totalMinutes) || 0,
          topicStatus: imported.topicStatus || {},
          schedule: Array.isArray(imported.schedule) ? imported.schedule : state.schedule,
          essays: Array.isArray(imported.essays) ? imported.essays : [],
          errors: Array.isArray(imported.errors) ? imported.errors : []
        };
        saveState();
        renderAll();
        alert("Backup importado com sucesso!");
      } catch (err) {
        alert("Não foi possível importar o arquivo. Verifique se é um backup válido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  // --- Banco de Questões (MySQL API) ---
  const qState = {
    offset: 0,
    limit: 12,
    total: 0,
    selectedId: null,
    currentQuestion: null,
    answeredLetter: null,
    searchTimer: null
  };

  const DISCIPLINE_TO_AREA = {
    linguagens: "Linguagens / Redação",
    "ciencias-humanas": "Ciências Humanas",
    "ciencias-natureza": "Ciências da Natureza",
    matematica: "Matemática"
  };

  async function initSystemSync() {
    try {
      const healthRes = await fetch("/api/health");
      if (!healthRes.ok) throw new Error("API indisponível");
      const health = await healthRes.json();

      apiConnected = true;
      setDbStatus(`MySQL • ${health.totalQuestions} questões`, true);

      // Carregar ou migrar estado de estudo do MySQL
      const stateRes = await fetch(`/api/study-state/${STORAGE_KEY}`);
      if (stateRes.ok) {
        const remote = await stateRes.json();
        if (remote.exists && remote.payload) {
          state = normalizeState(remote.payload);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          renderAll();
        } else if (localStorage.getItem(STORAGE_KEY)) {
          // Migra dados existentes do localStorage para o MySQL
          syncStateToApi();
        }
      }

      // Popular filtro de anos no Banco de Questões
      const examsRes = await fetch("/api/exams");
      if (examsRes.ok) {
        const exams = await examsRes.json();
        const yearSelect = document.getElementById("q-filter-year");
        if (yearSelect) {
          exams.forEach((ex) => {
            const opt = document.createElement("option");
            opt.value = ex.year;
            opt.textContent = `${ex.year} (${ex.total_questions} q.)`;
            yearSelect.appendChild(opt);
          });
        }
      }

      loadQuestions();
    } catch (_err) {
      apiConnected = false;
      setDbStatus("Modo Offline (localStorage)", false);
    }
  }

  async function loadQuestions() {
    const listEl = document.getElementById("questions-list");
    const totalBadge = document.getElementById("q-total-badge");
    if (!listEl) return;

    const year = document.getElementById("q-filter-year")?.value || "";
    const discipline = document.getElementById("q-filter-discipline")?.value || "";
    const language = document.getElementById("q-filter-language")?.value || "";
    const q = document.getElementById("q-filter-search")?.value.trim() || "";

    const params = new URLSearchParams({
      limit: String(qState.limit),
      offset: String(qState.offset)
    });
    if (year) params.set("year", year);
    if (discipline) params.set("discipline", discipline);
    if (language) params.set("language", language);
    if (q) params.set("q", q);

    listEl.innerHTML = `<div class="empty-state">Buscando questões no MySQL...</div>`;

    try {
      const res = await fetch(`/api/questions?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao consultar questões");
      const payload = await res.json();
      qState.total = payload.total;

      if (totalBadge) {
        totalBadge.textContent = `${payload.total} questões encontradas`;
      }

      const prevBtn = document.getElementById("q-prev-page");
      const nextBtn = document.getElementById("q-next-page");
      const pageInfo = document.getElementById("q-page-info");
      const currentPage = Math.floor(qState.offset / qState.limit) + 1;
      const totalPages = Math.max(1, Math.ceil(qState.total / qState.limit));
      if (prevBtn) prevBtn.disabled = qState.offset <= 0;
      if (nextBtn) nextBtn.disabled = qState.offset + qState.limit >= qState.total;
      if (pageInfo) pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

      if (!payload.questions.length) {
        listEl.innerHTML = `<div class="empty-state">Nenhuma questão encontrada para esses filtros.</div>`;
        return;
      }

      listEl.innerHTML = "";
      payload.questions.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `question-item${qState.selectedId === item.id ? " active" : ""}`;
        const langLabel = item.language ? ` • ${item.language}` : "";
        btn.innerHTML = `
          <div class="question-item-head">
            <span>${escapeHtml(item.title)}</span>
            <span class="badge">${escapeHtml(item.discipline || "geral")}${escapeHtml(langLabel)}</span>
          </div>
          <div class="question-item-preview">${escapeHtml(item.preview || "Clique para abrir a questão.")}</div>
        `;
        btn.dataset.qid = String(item.id);
        btn.addEventListener("click", () => openQuestion(item.id));
        listEl.appendChild(btn);
      });
    } catch (_err) {
      listEl.innerHTML = `<div class="empty-state">Inicie o servidor (npm start) para consultar o MySQL.</div>`;
    }
  }

  async function openQuestion(id) {
    const detailEl = document.getElementById("question-detail");
    if (!detailEl) return;

    qState.selectedId = id;
    qState.answeredLetter = null;
    detailEl.innerHTML = `<div class="empty-state">Carregando questão...</div>`;

    document.querySelectorAll(".question-item").forEach((el) => {
      el.classList.toggle("active", Number(el.dataset.qid) === id);
    });

    try {
      const res = await fetch(`/api/questions/${id}`);
      if (!res.ok) throw new Error("Falha ao abrir questão");
      const question = await res.json();
      qState.currentQuestion = question;
      renderQuestionDetail();
    } catch (_err) {
      detailEl.innerHTML = `<div class="empty-state">Não foi possível carregar os detalhes da questão.</div>`;
    }
  }

  function renderQuestionDetail() {
    const detailEl = document.getElementById("question-detail");
    const q = qState.currentQuestion;
    if (!detailEl || !q) return;

    const answered = qState.answeredLetter;
    const isCorrect = answered && answered === q.correct_alternative;
    const langTag = q.language ? ` • ${q.language}` : "";

    const altsHtml = (q.alternatives || [])
      .map((alt) => {
        let cls = "alt-option";
        if (answered) {
          if (alt.is_correct || alt.letter === q.correct_alternative) cls += " is-correct";
          else if (alt.letter === answered) cls += " is-wrong";
        }
        return `
          <button type="button" class="${cls}" data-letter="${escapeHtml(alt.letter)}">
            <span class="alt-letter">${escapeHtml(alt.letter)}</span>
            <span>${escapeHtml(alt.text || (alt.file_url ? "[Alternativa em imagem]" : ""))}</span>
          </button>
        `;
      })
      .join("");

    const feedbackHtml = answered
      ? `
        <div class="question-feedback ${isCorrect ? "ok" : "err"}">
          <span>${isCorrect ? "Acertou! Gabarito: " + escapeHtml(q.correct_alternative) : "Errou. Gabarito oficial: " + escapeHtml(q.correct_alternative)}</span>
          <button type="button" class="btn btn-secondary" id="btn-send-to-errors">Enviar para Caderno de Erros</button>
        </div>
      `
      : "";

    detailEl.innerHTML = `
      <div class="record-head">
        <strong>${escapeHtml(q.title)}</strong>
        <span class="badge">${escapeHtml(q.discipline || "geral")}${escapeHtml(langTag)}</span>
      </div>
      ${q.context ? `<div class="question-context">${escapeHtml(q.context)}</div>` : ""}
      ${q.alternatives_intro ? `<div class="question-intro">${escapeHtml(q.alternatives_intro)}</div>` : ""}
      <div class="alternatives-list">${altsHtml}</div>
      ${feedbackHtml}
    `;

    detailEl.querySelectorAll(".alt-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        qState.answeredLetter = btn.dataset.letter;
        renderQuestionDetail();
      });
    });

    const errBtn = document.getElementById("btn-send-to-errors");
    if (errBtn) {
      errBtn.addEventListener("click", () => {
        const areaSelect = document.getElementById("error-area");
        const topicInput = document.getElementById("error-topic");
        if (areaSelect && DISCIPLINE_TO_AREA[q.discipline]) {
          areaSelect.value = DISCIPLINE_TO_AREA[q.discipline];
        }
        if (topicInput) {
          topicInput.value = `${q.title} (marquei ${answered}, gabarito ${q.correct_alternative})`;
        }
        switchTab("errors");
        topicInput?.focus();
      });
    }
  }

  ["q-filter-year", "q-filter-discipline", "q-filter-language"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", () => {
      qState.offset = 0;
      loadQuestions();
    });
  });

  document.getElementById("q-filter-search")?.addEventListener("input", () => {
    clearTimeout(qState.searchTimer);
    qState.searchTimer = setTimeout(() => {
      qState.offset = 0;
      loadQuestions();
    }, 300);
  });

  document.getElementById("q-prev-page")?.addEventListener("click", () => {
    if (qState.offset >= qState.limit) {
      qState.offset -= qState.limit;
      loadQuestions();
    }
  });

  document.getElementById("q-next-page")?.addEventListener("click", () => {
    if (qState.offset + qState.limit < qState.total) {
      qState.offset += qState.limit;
      loadQuestions();
    }
  });

  function renderAll() {
    renderCountdown();
    renderDashboard();
    renderSchedule();
    renderTopics();
    renderEssays();
    renderErrors();
  }

  initTopicFilters();
  renderAll();
  initSystemSync();
})();
