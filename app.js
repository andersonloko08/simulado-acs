// State
let questoesDB = [];
let simuladoAtual = [];
let respostasUsuario = {}; // { questaoIndex: { selecionada, correta, conferida } }
let totalQuestions = 40;

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
        const response = await fetch("simulado_completo.json");
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

    // Select questions
    const qtde = Math.min(totalQuestions, questoesDB.length);
    simuladoAtual = shuffleArray(questoesDB).slice(0, qtde);
    respostasUsuario = {};

    renderQuiz();
    updateProgress();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

// Render Quiz
function renderQuiz() {
    let html = '';

    simuladoAtual.forEach((q, index) => {
        respostasUsuario[index] = {
            correta: q.resposta,
            selecionada: null,
            conferida: false
        };

        html += `
        <div class="question-card slide-up" style="animation-delay: ${index * 0.05}s" id="q-card-${index}">
            <h3>Questão ${index + 1}</h3>
            <div class="question-text">${escapeHtml(q.pergunta)}</div>
            
            <div class="options-grid" id="options-${index}">
        `;

        for (const [key, value] of Object.entries(q.alternativas)) {
            html += `
                <label class="option-label" id="label-${index}-${key}" onclick="selectOption(${index}, '${key}')">
                    <input type="radio" name="q${index}" value="${key}">
                    <div class="option-content">
                        <span class="option-letter">${key}</span>
                        <span class="option-text">${escapeHtml(value)}</span>
                    </div>
                </label>
            `;
        }

        html += `
            </div>
            
            <button id="btn-check-${index}" class="primary-btn w-100" onclick="checkAnswer(${index})" disabled>
                <i class="fa-solid fa-clipboard-check"></i> Conferir Resposta
            </button>

            <div id="feedback-${index}" class="feedback-box"></div>
        </div>
        `;
    });

    elQuizContent.innerHTML = html;
}

// Select Option Interaction
window.selectOption = function(qIndex, optionKey) {
    if (respostasUsuario[qIndex].conferida) return; // Prevent change after check

    // Update state
    respostasUsuario[qIndex].selecionada = optionKey;

    // Update UI visually
    const optionsContainer = document.getElementById(`options-${qIndex}`);
    const labels = optionsContainer.querySelectorAll('.option-label');
    labels.forEach(l => l.classList.remove('selected'));
    
    const selectedLabel = document.getElementById(`label-${qIndex}-${optionKey}`);
    selectedLabel.classList.add('selected');
    selectedLabel.querySelector('input').checked = true;

    // Enable check button
    const btnCheck = document.getElementById(`btn-check-${qIndex}`);
    btnCheck.disabled = false;
};

// Check Single Answer
window.checkAnswer = function(qIndex) {
    const state = respostasUsuario[qIndex];
    if (state.conferida || !state.selecionada) return;

    state.conferida = true;
    updateProgress();

    const q = simuladoAtual[qIndex];
    const isCorrect = state.selecionada === state.correta;

    // Disable all options and check button
    const optionsContainer = document.getElementById(`options-${qIndex}`);
    const labels = optionsContainer.querySelectorAll('.option-label');
    labels.forEach(l => {
        l.classList.add('disabled');
        l.style.cursor = 'default';
        l.onclick = null;
    });

    const btnCheck = document.getElementById(`btn-check-${qIndex}`);
    btnCheck.style.display = 'none';

    // Highlight correct and wrong
    const selectedLabel = document.getElementById(`label-${qIndex}-${state.selecionada}`);
    const correctLabel = document.getElementById(`label-${qIndex}-${state.correta}`);

    if (isCorrect) {
        selectedLabel.style.borderColor = 'var(--success)';
        selectedLabel.style.backgroundColor = 'var(--success-light)';
    } else {
        selectedLabel.style.borderColor = 'var(--danger)';
        selectedLabel.style.backgroundColor = 'var(--danger-light)';
        
        // Also show correct one
        if (correctLabel) {
            correctLabel.style.borderColor = 'var(--success)';
            correctLabel.style.borderWidth = '2px';
            correctLabel.style.borderStyle = 'dashed';
        }
    }

    // Show Feedback
    const feedbackBox = document.getElementById(`feedback-${qIndex}`);
    
    let feedbackHtml = '';
    if (isCorrect) {
        feedbackHtml = `
            <div class="feedback-header"><i class="fa-solid fa-circle-check"></i> Você Acertou!</div>
        `;
        feedbackBox.classList.add('feedback-ok');
    } else {
        feedbackHtml = `
            <div class="feedback-header"><i class="fa-solid fa-circle-xmark"></i> Você Errou</div>
            <div class="feedback-correct-answer">A resposta correta é a letra <strong>${state.correta}</strong></div>
        `;
        feedbackBox.classList.add('feedback-bad');
    }

    if (q.comentario && q.comentario.trim() !== '') {
        feedbackHtml += `<div class="feedback-comment"><strong>Comentário:</strong> ${escapeHtml(q.comentario)}</div>`;
    }

    feedbackBox.innerHTML = feedbackHtml;
    feedbackBox.classList.add('show');
};

// Update Progress Bar
function updateProgress() {
    let conferidas = 0;
    for (const key in respostasUsuario) {
        if (respostasUsuario[key].conferida) conferidas++;
    }
    
    const total = simuladoAtual.length;
    const percentage = total > 0 ? (conferidas / total) * 100 : 0;
    
    elProgressBar.style.width = `${percentage}%`;
    elQuestionCounter.innerHTML = `<i class="fa-solid fa-list-ol"></i> ${conferidas}/${total}`;
}

// Finish Quiz
window.finish = function() {
    // Auto-check any un-checked answered questions
    simuladoAtual.forEach((_, index) => {
        if (respostasUsuario[index].selecionada && !respostasUsuario[index].conferida) {
            checkAnswer(index);
        }
    });

    // Calculate score
    let acertos = 0;
    const total = simuladoAtual.length;

    for (const key in respostasUsuario) {
        const state = respostasUsuario[key];
        if (state.conferida && state.selecionada === state.correta) {
            acertos++;
        }
    }

    const percentage = total > 0 ? Math.round((acertos / total) * 100) : 0;

    // Show result
    document.getElementById('score-correct').innerText = acertos;
    document.getElementById('score-total').innerText = total;
    document.getElementById('score-percentage').innerText = `${percentage}%`;

    // Configure circle chart color based on score
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
    
    // Trigger animation for the circle chart
    setTimeout(() => {
        circlePath.setAttribute('stroke-dasharray', `${percentage}, 100`);
    }, 100);

    elResultModal.classList.add('active');
};