// State
let questoesDB = [];
let simuladoAtual = [];
let respostasUsuario = {}; // { questaoIndex: { selecionada, correta, conferida } }
let totalQuestions = 40;
let currentQuestionIndex = 0; // Para navegação

// DOM Elements
const elHome = document.getElementById('home');
const elQuiz = document.getElementById('quiz');
const elStats = document.getElementById('stats');
const elStartBtn = document.getElementById('start-btn');
const elQuizContent = document.getElementById('quiz-content');
const elProgressBar = document.getElementById('progress-bar');
const elQuestionCounter = document.getElementById('question-counter');
const elResultModal = document.getElementById('result-modal');

// Theme Management
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggleBtn.addEventListener('click', () => {
    let theme = document.body.getAttribute('data-theme');
    if (theme === 'dark') {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});

// Initialization
async function initApp() {
    try {
        const response = await fetch("simulado_completo.json?v=3");
        if (!response.ok) throw new Error("Erro ao carregar as questões");
        const data = await response.json();
        
        questoesDB = data.questoes || [];
        
        if (questoesDB.length > 0) {
            elStats.innerHTML = `<div class="stat-box"><i class="fa-solid fa-database"></i> Banco atualizado com <strong>${questoesDB.length}</strong> questões.</div>`;
            elStartBtn.disabled = false;
            elStartBtn.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar Simulado';
            
            // Atualizar contadores por matéria
            document.getElementById('count-pt').innerText = `(${questoesDB.filter(q => q.disciplina === "Língua Portuguesa").length})`;
            document.getElementById('count-rl').innerText = `(${questoesDB.filter(q => q.disciplina === "Raciocínio Lógico").length})`;
            document.getElementById('count-info').innerText = `(${questoesDB.filter(q => q.disciplina === "Informática Básica").length})`;
            document.getElementById('count-ce').innerText = `(${questoesDB.filter(q => q.disciplina === "Conhecimentos Específicos").length})`;

            // Adicionar listeners para atualização dinâmica do total
            document.querySelectorAll('.quiz-options input, .quiz-options select').forEach(el => {
                el.addEventListener('change', updateAvailableCount);
            });
            updateAvailableCount();
            
        } else {
            throw new Error("Banco de questões vazio.");
        }
    } catch (error) {
        console.error(error);
        elStats.innerHTML = `<div class="stat-box" style="color: var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Erro ao carregar as questões. Tente recarregar a página ou verifique se o arquivo simulado_completo.json está acessível.</div>`;
    }
}

function updateAvailableCount() {
    const includeImages = document.getElementById('opt-images').checked;
    const includeVF = document.getElementById('opt-vf').checked;
    const includeMulti = document.getElementById('opt-multipla').checked;
    const includeInterp = document.getElementById('opt-interpretação').checked;
    
    const isCustom = document.querySelector('input[name="mode-count"][value="custom"]').checked;
    const inputCount = document.getElementById('opt-count');
    const selectedSubjects = Array.from(document.querySelectorAll('input[name="subject"]:checked')).map(cb => cb.value);

    const anyFormatSelected = includeImages || includeVF || includeMulti || includeInterp;

    // Função interna para filtrar o pool baseado em qualquer formato (Lógica de OU)
    const filterByFormat = (itemPool) => {
        if (!anyFormatSelected) return itemPool;
        return itemPool.filter(q => {
            const isVF = q.pergunta.includes("(V)") || q.pergunta.includes("(F)") || (q.tags && q.tags.includes("V/F"));
            const isInterp = q.pergunta.toLowerCase().includes("texto") || q.pergunta.toLowerCase().includes("leia") || (q.tags && q.tags.includes("Interpretação"));
            const isMulti = !isVF && !isInterp;
            const hasImage = !!q.imagem;

            // Se a questão bater com QUALQUER um dos formatos marcados, ela passa
            if (includeImages && hasImage) return true;
            if (includeVF && isVF) return true;
            if (includeInterp && isInterp) return true;
            if (includeMulti && isMulti) return true;

            return false;
        });
    };

    // Atualizar contadores individuais por matéria
    const subjects = [
        { id: 'count-pt', name: "Língua Portuguesa" },
        { id: 'count-rl', name: "Raciocínio Lógico" },
        { id: 'count-info', name: "Informática Básica" },
        { id: 'count-ce', name: "Conhecimentos Específicos" }
    ];

    subjects.forEach(s => {
        const subjectPool = questoesDB.filter(q => q.disciplina === s.name);
        const filteredSubjectPool = filterByFormat(subjectPool);
        const countEl = document.getElementById(s.id);
        if (countEl) {
            countEl.innerText = `(${filteredSubjectPool.length})`;
            countEl.style.color = filteredSubjectPool.length === 0 ? 'var(--danger)' : 'var(--text-muted)';
        }
    });

    // Pool final baseado em matérias selecionadas
    let pool = questoesDB.filter(q => selectedSubjects.includes(q.disciplina));
    pool = filterByFormat(pool);

    const available = pool.length;
    inputCount.max = available;
    
    // Validar modo Padrão Edital (40 questões)
    const radio40 = document.querySelector('input[name="mode-count"][value="40"]');
    const label40 = radio40.closest('label');
    const warning40 = document.getElementById('count-warning');
    
    if (available < 40) {
        radio40.disabled = true;
        label40.style.opacity = "0.5";
        label40.style.cursor = "not-allowed";
        if (warning40) warning40.style.display = "block";
        
        // Se estava marcado, força a troca para personalizado
        if (radio40.checked) {
            document.querySelector('input[name="mode-count"][value="custom"]').checked = true;
            toggleCountMode();
        }
    } else {
        radio40.disabled = false;
        label40.style.opacity = "1";
        label40.style.cursor = "pointer";
        if (warning40) warning40.style.display = "none";
    }

    // Se a mudança veio de um FILTRO (não do próprio input de número), resetamos para o máximo
    const lastEvent = window.event;
    const isFilterChange = lastEvent && lastEvent.target && lastEvent.target.type === 'checkbox';

    if (isCustom && isFilterChange) {
        inputCount.value = available;
    }

    // Garante que o valor manual nunca ultrapasse o disponível
    if (parseInt(inputCount.value) > available) {
        inputCount.value = available;
    }

    const totalDesired = isCustom ? parseInt(inputCount.value) || 1 : 40;
    const finalCount = Math.min(available, totalDesired);
    
    const startBtn = document.getElementById('start-btn');
    if (available === 0) {
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Nenhuma questão encontrada';
    } else {
        startBtn.disabled = false;
        startBtn.innerHTML = `<i class="fa-solid fa-play"></i> Iniciar com ${finalCount} questões`;
    }
}

window.toggleCountMode = function() {
    const isCustom = document.querySelector('input[name="mode-count"][value="custom"]').checked;
    document.getElementById('opt-count').disabled = !isCustom;
    updateAvailableCount();
};

initApp();

// Utility: Shuffle Array
function shuffleArray(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

window.reportError = function(index) {
    const q = simuladoAtual[index];
    
    // Configurações do Google Form do usuário
    const googleFormBase = "https://docs.google.com/forms/d/e/1FAIpQLScyGPcChIm3d0RRrfHJ1GUthap-7VlwED1vmosnK2tH4D5gWA/viewform";
    const entryId = "entry.1494229105";      // Campo: ID da Questão
    const entrySubject = "entry.858055000";  // Campo: Disciplina
    const entryDesc = "entry.679365778";     // Campo: Descrição do Erro
    
    const finalUrl = `${googleFormBase}?${entryId}=${q.id}&${entrySubject}=${encodeURIComponent(q.disciplina)}&${entryDesc}=${encodeURIComponent("(Descreva aqui o erro encontrado na questão)")}`;
    
    window.open(finalUrl, '_blank');
};

// Start Quiz
window.startQuiz = function() {
    const includeImages = document.getElementById('opt-images') ? document.getElementById('opt-images').checked : false;
    const includeVF = document.getElementById('opt-vf') ? document.getElementById('opt-vf').checked : false;
    const includeMulti = document.getElementById('opt-multipla') ? document.getElementById('opt-multipla').checked : false;
    const includeInterp = document.getElementById('opt-interpretação') ? document.getElementById('opt-interpretação').checked : false;
    const totalDesired = parseInt(document.getElementById('opt-count').value) || 40;
    const selectedSubjects = Array.from(document.querySelectorAll('input[name="subject"]:checked')).map(cb => cb.value);

    if (selectedSubjects.length === 0) {
        alert("Por favor, selecione pelo menos uma matéria!");
        return;
    }

    // Se NENHUM formato estiver marcado, consideramos que quer TODOS (fallback)
    const anyFormatSelected = includeImages || includeVF || includeMulti || includeInterp;

    // Filtrar o pool de questões
    let pool = questoesDB.filter(q => selectedSubjects.includes(q.disciplina));
    
    if (anyFormatSelected) {
        pool = pool.filter(q => {
            const isVF = q.pergunta.includes("(V)") || q.pergunta.includes("(F)") || (q.tags && q.tags.includes("V/F"));
            const isInterp = q.pergunta.toLowerCase().includes("texto") || q.pergunta.toLowerCase().includes("leia") || (q.tags && q.tags.includes("Interpretação"));
            const isMulti = !isVF && !isInterp;
            const hasImage = !!q.imagem;

            if (includeImages && hasImage) return true;
            if (includeVF && isVF) return true;
            if (includeInterp && isInterp) return true;
            if (includeMulti && isMulti) return true;
            
            return false;
        });
    }

    // Seleção de questões proporcional
    let selectedQuestions = [];
    const ratios = {
        "Língua Portuguesa": 10/40,
        "Raciocínio Lógico": 5/40,
        "Informática Básica": 5/40,
        "Conhecimentos Específicos": 20/40
    };

    // Ajustar ratios se alguma matéria não foi selecionada
    let activeRatios = {};
    let ratioSum = 0;
    selectedSubjects.forEach(s => {
        activeRatios[s] = ratios[s] || (1 / selectedSubjects.length);
        ratioSum += activeRatios[s];
    });

    // Normalizar ratios para somarem 1
    selectedSubjects.forEach(s => {
        activeRatios[s] = activeRatios[s] / ratioSum;
    });

    // Sortear de cada matéria ativa
    selectedSubjects.forEach(s => {
        const countForSubject = Math.round(totalDesired * activeRatios[s]);
        const subjectPool = pool.filter(q => q.disciplina === s);
        
        if (subjectPool.length > 0) {
            const shuffled = shuffleArray([...subjectPool]);
            selectedQuestions.push(...shuffled.slice(0, countForSubject));
        }
    });

    // Se faltar questões por arredondamento ou falta no pool, completa com o que tiver
    if (selectedQuestions.length < totalDesired) {
        const remainingPool = shuffleArray(pool.filter(q => !selectedQuestions.includes(q) && selectedSubjects.includes(q.disciplina)));
        selectedQuestions.push(...remainingPool.slice(0, totalDesired - selectedQuestions.length));
    }

    // Embaralhar a ordem final
    simuladoAtual = shuffleArray(selectedQuestions);
    respostasUsuario = {};
    
    // Initialize user answers state
    simuladoAtual.forEach((q, index) => {
        respostasUsuario[index] = {
            correta: q.resposta,
            selecionada: null,
            conferida: false
        };
    });

    // UI Transition
    elHome.classList.remove('active');
    setTimeout(() => {
        elHome.style.display = 'none';
        elQuiz.style.display = 'block';
        setTimeout(() => elQuiz.classList.add('active'), 50);
        
        currentQuestionIndex = 0;
        renderNavGrid();
        renderQuestion(currentQuestionIndex);
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
}

// Render Navigation Grid
function renderNavGrid() {
    const gridEl = document.getElementById('question-nav-grid');
    if (!gridEl) return;
    
    let html = '';
    for (let i = 0; i < simuladoAtual.length; i++) {
        const state = respostasUsuario[i];
        let classes = 'question-nav-btn';
        if (state.conferida) classes += ' answered';
        if (i === currentQuestionIndex) classes += ' active';
        
        html += `<button class="${classes}" onclick="jumpToQuestion(${i})" id="nav-btn-${i}">${i + 1}</button>`;
    }
    gridEl.innerHTML = html;
}

window.jumpToQuestion = function(index) {
    currentQuestionIndex = index;
    renderQuestion(currentQuestionIndex);
    updateNavGridSelection();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function updateNavGridSelection() {
    for (let i = 0; i < simuladoAtual.length; i++) {
        const btn = document.getElementById(`nav-btn-${i}`);
        if (!btn) continue;
        const state = respostasUsuario[i];
        
        btn.className = 'question-nav-btn';
        if (state.conferida) btn.classList.add('answered');
        if (i === currentQuestionIndex) btn.classList.add('active');
    }
}

function escapeHtml(unsafe) {
    if(!unsafe) return '';
    return unsafe.toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Render Single Question
function renderQuestion(index) {
    const q = simuladoAtual[index];
    const state = respostasUsuario[index];
    
    let html = `
    <div class="question-card slide-up" id="q-card-${index}">
        <div class="question-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 0.85rem; color: var(--primary); font-weight: bold; text-transform: uppercase;">
                <i class="fa-solid fa-book-open"></i> ${escapeHtml(q.disciplina || 'Questão')}
            </span>
            <div class="question-tags" style="display: flex; gap: 5px;">
                ${(q.tags || []).map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
                ${q.imagem ? '<span class="tag-badge"><i class="fa-solid fa-image"></i> Imagem</span>' : ''}
                ${q.pergunta.includes('(V)') || q.pergunta.includes('(F)') ? '<span class="tag-badge">V/F</span>' : '<span class="tag-badge">Múltipla Escolha</span>'}
            </div>
        </div>
        <h3>Questão ${index + 1} de ${simuladoAtual.length}</h3>
        <div class="question-text">${escapeHtml(q.pergunta)}</div>
        ${q.imagem ? `<div class="question-image-container"><img src="${q.imagem}" class="question-image" onclick="window.open('${q.imagem}', '_blank')" title="Clique para ampliar" alt="Imagem da questão"></div>` : ''}
        
        <div class="options-grid" id="options-${index}">
    `;

    for (const [key, value] of Object.entries(q.alternativas)) {
        // Pre-selection and styling logic if already answered
        let labelClass = "option-label";
        let isSelected = state.selecionada === key ? "selected" : "";
        let isChecked = state.selecionada === key ? "checked" : "";
        
        // Se a questão já foi conferida, mostrar estilos de certo/errado
        let extraStyles = "";
        if (state.conferida) {
            labelClass += " disabled";
            
            if (key === state.correta) {
                extraStyles = `style="border-color: var(--success); border-width: 2px; border-style: dashed; background: var(--success-light);"`;
            } else if (state.selecionada === key && key !== state.correta) {
                extraStyles = `style="border-color: var(--danger); background: var(--danger-light);"`;
            }
        }

        html += `
            <label class="option-label ${isSelected} ${labelClass}" id="label-${index}-${key}" ${state.conferida ? "" : `onclick="selectOption(${index}, '${key}')"`} ${extraStyles}>
                <input type="radio" name="q${index}" value="${key}" ${isChecked} ${state.conferida ? "disabled" : ""}>
                <div class="option-content">
                    <span class="option-letter">${key}</span>
                    <span class="option-text">${escapeHtml(value)}</span>
                </div>
            </label>
        `;
    }

    html += `
        </div>

        <div class="question-footer" style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed var(--option-border); display: flex; justify-content: space-between; align-items: center;">
            <button onclick="reportError(${index})" class="report-btn" title="Reportar erro nesta questão">
                <i class="fa-solid fa-triangle-exclamation"></i> Reportar Erro
            </button>
            <button id="check-btn-${index}" onclick="checkAnswer(${index})" class="primary-btn check-btn" ${state.selecionada && !state.conferida ? "" : "disabled"} ${state.conferida ? 'style="display:none;"' : ''}>
                <i class="fa-solid fa-check-double"></i> Conferir Resposta
            </button>
        </div>
        
        <div id="feedback-${index}" class="feedback-box"></div>
    </div>
    `;

    elQuizContent.innerHTML = html;
    
    // Atualiza feedback se já estiver conferida
    if (state.conferida) {
        showFeedbackUI(index);
    }
    
    updateNavigationControls();
}

// Navigation Controls
function updateNavigationControls() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    btnPrev.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === simuladoAtual.length - 1) {
        btnNext.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Finalizar Tudo';
        btnNext.className = 'nav-btn success-btn';
        btnNext.onclick = finish;
    } else {
        btnNext.innerHTML = 'Próxima <i class="fa-solid fa-arrow-right"></i>';
        btnNext.className = 'nav-btn primary-btn';
        btnNext.onclick = nextQuestion;
    }
    
    updateProgress();
}

window.nextQuestion = function() {
    if (currentQuestionIndex < simuladoAtual.length - 1) {
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.prevQuestion = function() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion(currentQuestionIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.confirmFinish = function() {
    let unAnswered = 0;
    for (const key in respostasUsuario) {
        if (!respostasUsuario[key].conferida) unAnswered++;
    }
    
    let msg = "Tem certeza que deseja encerrar o simulado?";
    if (unAnswered > 0) {
        msg = `Atenção: Há ${unAnswered} questões ainda não respondidas! Deseja mesmo encerrar o simulado assim mesmo? Elas serão contabilizadas como erros.`;
    } else {
        msg += " Todas as questões foram respondidas.";
    }

    if (confirm(msg)) {
        finish();
    }
};

// Select Option Interaction
window.selectOption = function(qIndex, optionKey) {
    if (respostasUsuario[qIndex].conferida) return;

    respostasUsuario[qIndex].selecionada = optionKey;

    const optionsContainer = document.getElementById(`options-${qIndex}`);
    const labels = optionsContainer.querySelectorAll('.option-label');
    labels.forEach(l => l.classList.remove('selected'));
    
    const selectedLabel = document.getElementById(`label-${qIndex}-${optionKey}`);
    selectedLabel.classList.add('selected');
    selectedLabel.querySelector('input').checked = true;

    const btnCheck = document.getElementById(`check-btn-${qIndex}`);
    if (btnCheck) btnCheck.disabled = false;
    
    updateNavGridSelection();
};

// Check Single Answer
window.checkAnswer = function(qIndex) {
    const state = respostasUsuario[qIndex];
    if (state.conferida || !state.selecionada) return;

    state.conferida = true;
    updateProgress();

    // Re-render UI to apply disabled states and colors easily
    renderQuestion(qIndex);
};

// Show Feedback UI
function showFeedbackUI(qIndex) {
    const state = respostasUsuario[qIndex];
    const q = simuladoAtual[qIndex];
    const isCorrect = state.selecionada === state.correta;
    const feedbackBox = document.getElementById(`feedback-${qIndex}`);
    
    let feedbackHtml = '';
    if (isCorrect) {
        feedbackHtml = `<div class="feedback-header"><i class="fa-solid fa-circle-check"></i> Você Acertou!</div>`;
        feedbackBox.className = 'feedback-box feedback-ok show';
    } else {
        feedbackHtml = `
            <div class="feedback-header"><i class="fa-solid fa-circle-xmark"></i> Você Errou</div>
            <div class="feedback-correct-answer">A resposta correta é a letra <strong>${state.correta}</strong></div>
        `;
        feedbackBox.className = 'feedback-box feedback-bad show';
    }

    if (q.comentario && q.comentario.trim() !== '') {
        feedbackHtml += `<div class="feedback-comment"><strong>Comentário:</strong> ${escapeHtml(q.comentario)}</div>`;
    }

    feedbackBox.innerHTML = feedbackHtml;
}

// Update Progress Bar
function updateProgress() {
    let respondidas = 0;
    for (const key in respostasUsuario) {
        if (respostasUsuario[key].conferida) respondidas++;
    }
    
    const total = simuladoAtual.length;
    const percentage = total > 0 ? (respondidas / total) * 100 : 0;
    
    elProgressBar.style.width = `${percentage}%`;
    elQuestionCounter.innerHTML = `<i class="fa-solid fa-list-ol"></i> ${currentQuestionIndex + 1}/${total}`;
    
    if (typeof updateNavGridSelection === 'function') {
        updateNavGridSelection();
    }
}

// Finish Quiz
window.finish = function() {
    // Auto-check removed per user request: only count if button clicked
    /*
    simuladoAtual.forEach((_, index) => {
        if (respostasUsuario[index].selecionada && !respostasUsuario[index].conferida) {
            respostasUsuario[index].conferida = true;
        }
    });
    */

    const pesos = {
        "Língua Portuguesa": 2.0,
        "Raciocínio Lógico": 2.0,
        "Informática Básica": 2.0,
        "Conhecimentos Específicos": 3.0
    };

    let acertos = 0;
    const total = simuladoAtual.length;
    let subjectStats = {};
    let totalPontos = 0;
    let maxPontos = 0;

    // Iniciar contadores
    simuladoAtual.forEach(q => {
        const peso = pesos[q.disciplina] || 1;
        if (!subjectStats[q.disciplina]) {
            subjectStats[q.disciplina] = { total: 0, correct: 0, peso: peso, pontosPossiveis: 0, pontosGanhos: 0 };
        }
        subjectStats[q.disciplina].total++;
        subjectStats[q.disciplina].pontosPossiveis += peso;
        maxPontos += peso;
    });

    for (const key in respostasUsuario) {
        const state = respostasUsuario[key];
        const q = simuladoAtual[key];
        // Only count if it was explicitly confirmed by clicking the button
        if (state.conferida && state.selecionada === state.correta) {
            acertos++;
            subjectStats[q.disciplina].correct++;
            subjectStats[q.disciplina].pontosGanhos += subjectStats[q.disciplina].peso;
            totalPontos += subjectStats[q.disciplina].peso;
        }
    }

    // Montar HTML do detalhamento por matéria
    let breakdownHtml = '<h4 style="margin: 0 0 20px 0; font-size: 1.4rem; font-weight: 800; color: var(--text-color); border-bottom: 2px solid var(--primary); padding-bottom: 10px;">Desempenho por Matéria</h4>';
    for (const [subj, stats] of Object.entries(subjectStats)) {
        const perc = Math.round((stats.correct / stats.total) * 100) || 0;
        let color = perc >= 50 ? 'var(--success)' : 'var(--danger)';
        breakdownHtml += `
            <div style="display: flex; flex-direction: column; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(0,0,0,0.08);">
                <span style="font-size: 1.3rem; font-weight: bold; margin-bottom: 8px; color: var(--text-color);">${subj}</span>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 1.1rem; color: var(--text-muted); line-height: 1.4;">
                        Peso ${stats.peso.toFixed(1)} / Questão <br>
                        <strong>${stats.correct}</strong> de ${stats.total} acertos
                    </span>
                    <span style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                        <span style="color: ${color}; font-size: 1.6rem; font-weight: 900;">${stats.pontosGanhos.toFixed(1)} <small style="font-size: 0.9rem; opacity: 0.8;">pts</small></span>
                        <span style="font-size: 1.2rem; font-weight: bold; color: ${color}; background: ${perc >= 50 ? 'var(--success-light)' : 'var(--danger-light)'}; padding: 2px 8px; border-radius: 6px;">${perc}%</span>
                    </span>
                </div>
            </div>
        `;
    }
    const breakdownEl = document.getElementById('subject-breakdown');
    if (breakdownEl) breakdownEl.innerHTML = breakdownHtml;

    const percentage = maxPontos > 0 ? Math.round((totalPontos / maxPontos) * 100) : 0;

    let respondidas = 0;
    for (const key in respostasUsuario) {
        if (respostasUsuario[key].conferida) respondidas++;
    }
    const completionPercentage = total > 0 ? Math.round((respondidas / total) * 100) : 0;

    // Atualizar UI com pontos em vez de acertos puros
    document.getElementById('score-correct').innerText = totalPontos.toFixed(1) + " pts";
    document.getElementById('score-total').innerText = maxPontos.toFixed(1) + " pts";
    
    // Fix para SVG text: usar textContent em vez de innerText
    const scorePctEl = document.getElementById('score-percentage');
    if (scorePctEl) scorePctEl.textContent = `${percentage}%`;

    const answeredCountEl = document.getElementById('answered-count');
    if (answeredCountEl) answeredCountEl.innerText = respondidas;
    const answeredPctEl = document.getElementById('answered-percentage');
    if (answeredPctEl) answeredPctEl.innerText = `${completionPercentage}%`;

    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    
    let color = 'var(--danger)';
    if (percentage >= 80) {
        color = 'var(--success)';
        resultIcon.innerHTML = '<i class="fa-solid fa-trophy" style="color: gold;"></i>';
        resultTitle.innerText = 'Excelente Resultado!';
    } else if (percentage >= 50) {
        color = 'var(--warning)';
        resultIcon.innerHTML = '<i class="fa-solid fa-medal" style="color: silver;"></i>';
        resultTitle.innerText = 'Bom Trabalho!';
    } else {
        resultIcon.innerHTML = '<i class="fa-solid fa-book-open"></i>';
        resultTitle.innerText = 'Continue Estudando!';
    }

    const scorePctTextEl = document.getElementById('score-percentage-text');
    if (scorePctTextEl) {
        scorePctTextEl.style.color = color;
    }

    elQuiz.classList.remove('active');
    elResultModal.classList.add('active');
};

window.closeModal = function() {
    elResultModal.classList.remove('active');
    setTimeout(() => {
        elResultModal.style.display = 'none';
        elQuiz.style.display = 'none';
        elHome.style.display = 'block';
        setTimeout(() => {
            elHome.classList.add('active');
            location.reload(); 
        }, 50);
    }, 400);
};