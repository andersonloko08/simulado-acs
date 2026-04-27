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
        } else {
            throw new Error("Banco de questões vazio.");
        }
    } catch (error) {
        console.error(error);
        elStats.innerHTML = `<div class="stat-box" style="color: var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Erro ao carregar as questões. Tente recarregar a página ou verifique se o arquivo simulado_completo.json está acessível.</div>`;
    }
}

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

// Start Quiz
window.startQuiz = function() {
    // Hide home, show quiz
    elHome.classList.remove('active');
    setTimeout(() => {
        elHome.style.display = 'none';
        elQuiz.style.display = 'block';
        setTimeout(() => elQuiz.classList.add('active'), 50);
    }, 400); // Wait for fade out

    // Select questions based on Edital rules
    const qPt = questoesDB.filter(q => q.disciplina === "Língua Portuguesa");
    const qRl = questoesDB.filter(q => q.disciplina === "Raciocínio Lógico");
    const qInfo = questoesDB.filter(q => q.disciplina === "Informática Básica");
    const qCe = questoesDB.filter(q => q.disciplina === "Conhecimentos Específicos");

    const selPt = shuffleArray(qPt).slice(0, 10);
    const selRl = shuffleArray(qRl).slice(0, 5);
    const selInfo = shuffleArray(qInfo).slice(0, 5);
    const selCe = shuffleArray(qCe).slice(0, 20);

    // Grouping questions by subject to match real exam feel
    simuladoAtual = [...selPt, ...selRl, ...selInfo, ...selCe];
    respostasUsuario = {};
    
    // Initialize user answers state
    simuladoAtual.forEach((q, index) => {
        respostasUsuario[index] = {
            correta: q.resposta,
            selecionada: null,
            conferida: false
        };
    });

    currentQuestionIndex = 0;
    renderNavGrid();
    renderQuestion(currentQuestionIndex);
    updateProgress();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render Navigation Grid
function renderNavGrid() {
    const gridEl = document.getElementById('question-nav-grid');
    if (!gridEl) return;
    
    let html = '';
    for (let i = 0; i < simuladoAtual.length; i++) {
        const state = respostasUsuario[i];
        let classes = 'question-nav-btn';
        if (state.selecionada) classes += ' answered';
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
        if (state.selecionada) btn.classList.add('answered');
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
        <div class="question-meta" style="font-size: 0.85rem; color: var(--primary); font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">
            <i class="fa-solid fa-book-open"></i> ${escapeHtml(q.disciplina || 'Questão')}
        </div>
        <h3>Questão ${index + 1} de ${simuladoAtual.length}</h3>
        <div class="question-text">${escapeHtml(q.pergunta)}</div>
        
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
        
        <button id="btn-check-${index}" class="primary-btn w-100" onclick="checkAnswer(${index})" ${state.selecionada && !state.conferida ? "" : "disabled"} style="${state.conferida ? 'display:none;' : ''}">
            <i class="fa-solid fa-clipboard-check"></i> Conferir Resposta
        </button>

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
        if (!respostasUsuario[key].selecionada) unAnswered++;
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

    const btnCheck = document.getElementById(`btn-check-${qIndex}`);
    btnCheck.disabled = false;
    
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
        if (respostasUsuario[key].selecionada !== null) respondidas++;
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
    // Auto-check any un-checked answered questions
    simuladoAtual.forEach((_, index) => {
        if (respostasUsuario[index].selecionada && !respostasUsuario[index].conferida) {
            respostasUsuario[index].conferida = true;
        }
    });

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
        if (state.selecionada === state.correta) {
            acertos++;
            subjectStats[q.disciplina].correct++;
            subjectStats[q.disciplina].pontosGanhos += subjectStats[q.disciplina].peso;
            totalPontos += subjectStats[q.disciplina].peso;
        }
    }

    // Montar HTML do detalhamento por matéria
    let breakdownHtml = '<h4 style="margin: 0 0 10px 0; font-size: 0.9rem; color: var(--text);">Desempenho por Disciplina (com Pesos):</h4>';
    for (const [subj, stats] of Object.entries(subjectStats)) {
        const perc = Math.round((stats.correct / stats.total) * 100) || 0;
        let color = perc >= 50 ? 'var(--success)' : 'var(--danger)';
        breakdownHtml += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.05);">
                <span style="display: flex; flex-direction: column;">
                    <strong>${subj}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Peso ${stats.peso.toFixed(1)} / Questão</span>
                </span>
                <span style="display: flex; flex-direction: column; text-align: right;">
                    <span style="color: ${color}; font-weight: bold;">${stats.pontosGanhos.toFixed(1)} / ${stats.pontosPossiveis.toFixed(1)} pts</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${stats.correct}/${stats.total} acertos (${perc}%)</span>
                </span>
            </div>
        `;
    }
    const breakdownEl = document.getElementById('subject-breakdown');
    if (breakdownEl) breakdownEl.innerHTML = breakdownHtml;

    const percentage = maxPontos > 0 ? Math.round((totalPontos / maxPontos) * 100) : 0;

    let respondidas = 0;
    for (const key in respostasUsuario) {
        if (respostasUsuario[key].selecionada !== null) respondidas++;
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

    const circlePath = document.getElementById('score-circle-path');
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

    circlePath.style.stroke = color;
    
    setTimeout(() => {
        circlePath.setAttribute('stroke-dasharray', `${percentage}, 100`);
    }, 100);

    elResultModal.classList.add('active');
};