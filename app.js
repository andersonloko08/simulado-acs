let questoes = [];
let respostas = [];

fetch("simulado_completo.json")
    .then(r => r.json())
    .then(data => {
        questoes = data.questoes;
        loadStats();
    });

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

/* =========================
   INICIAR SIMULADO
========================= */

function startQuiz() {
    document.getElementById("home").classList.remove("active");
    document.getElementById("quiz").classList.add("active");

    let selecionadas = shuffle([...questoes]).slice(0, 40);
    respostas = selecionadas.map(q => q.resposta);

    let html = "";

    selecionadas.forEach((q, i) => {

        html += `
        <div class="question">
            <h3>Questão ${i+1}</h3>
            <p>${q.pergunta}</p>
        `;

        for (let k in q.alternativas) {
            html += `
            <label class="option">
                <input type="radio" name="q${i}" value="${k}">
                <span>${k}) ${q.alternativas[k]}</span>
            </label>
            `;
        }

        html += `
            <button onclick="check(${i}, '${q.resposta}', \`${q.comentario || ""}\`)">
                Enviar resposta
            </button>

            <div id="f${i}"></div>
        </div>
        `;
    });

    document.getElementById("quiz").innerHTML = html;
}

/* =========================
   CORREÇÃO
========================= */

function check(i, correta, comentario) {
    let opts = document.getElementsByName("q" + i);
    let marked = null;

    for (let o of opts) {
        if (o.checked) marked = o.value;
    }

    let box = document.getElementById("f" + i);

    if (!marked) return;

    if (marked === correta) {
        box.innerHTML = `<div class="feedback ok">✅ Correto<br>${comentario}</div>`;
    } else {
        box.innerHTML = `<div class="feedback bad">❌ Errado<br>✔ Correta: ${correta}<br>${comentario}</div>`;
    }
}

/* =========================
   FINALIZAR
========================= */

function finish() {
    let acertos = 0;

    for (let i = 0; i < respostas.length; i++) {
        let opts = document.getElementsByName("q" + i);

        for (let o of opts) {
            if (o.checked && o.value === respostas[i]) {
                acertos++;
            }
        }
    }

    let total = respostas.length;
    let nota = (acertos / total) * 100;

    let result = document.getElementById("result");

    result.style.display = "block";
    result.innerHTML = `
        <h2>Resultado</h2>
        <p>Acertos: ${acertos}/${total}</p>
        <p>Nota: ${nota.toFixed(1)}%</p>
        <button onclick="location.reload()">Novo simulado</button>
    `;
}

/* =========================
   STATS (BÁSICO)
========================= */

function loadStats() {
    let stats = document.getElementById("stats");
    stats.innerHTML = "";
}