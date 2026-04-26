let questoes = [];
let respostas = [];

fetch("simulado_completo.json")
    .then(r => r.json())
    .then(data => {
        questoes = data.questoes;
        mostrarStats();
    });

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function iniciarSimulado() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("simulado").style.display = "block";

    let selecionadas = shuffle([...questoes]).slice(0, 40);
    respostas = selecionadas.map(q => q.resposta);

    let html = "";

    selecionadas.forEach((q, i) => {

        html += `
        <div class="questao" id="q${i}">
            <h4>Questão ${i+1}</h4>
            <p>${q.pergunta}</p>
        `;

        for (let l in q.alternativas) {
            html += `
                <label>
                    <input type="radio" name="q${i}" value="${l}">
                    ${l}) ${q.alternativas[l]}
                </label><br>
            `;
        }

        html += `
            <button onclick="corrigir(${i}, '${q.resposta}', \`${q.comentario || ""}\`)">
                Enviar
            </button>

            <div id="res${i}"></div>
        </div>
        `;
    });

    html += `
        <button onclick="finalizar()">📊 Finalizar Simulado</button>
    `;

    document.getElementById("simulado").innerHTML = html;
}

function corrigir(i, correta, comentario) {
    let opcoes = document.getElementsByName("q" + i);
    let marcada = null;

    for (let o of opcoes) {
        if (o.checked) marcada = o.value;
    }

    let res = document.getElementById("res" + i);

    if (marcada === correta) {
        res.innerHTML = "✅ Correto<br>" + comentario;
    } else {
        res.innerHTML = "❌ Errado<br>✔ Correta: " + correta + "<br>" + comentario;
    }
}

function finalizar() {
    let acertos = 0;
    let total = respostas.length;

    for (let i = 0; i < total; i++) {
        let opcoes = document.getElementsByName("q" + i);

        for (let o of opcoes) {
            if (o.checked && o.value === respostas[i]) {
                acertos++;
            }
        }
    }

    let nota = (acertos / total) * 100;

    salvarHistorico(acertos, total);

    document.getElementById("resultado").innerHTML = `
        <div class="popup">
            <h2>📊 Resultado</h2>
            <p>✔ Acertos: ${acertos}/${total}</p>
            <p>📈 Nota: ${nota.toFixed(1)}%</p>
            <button onclick="location.reload()">🔄 Novo Simulado</button>
        </div>
    `;
}

function salvarHistorico(acertos, total) {
    let historico = JSON.parse(localStorage.getItem("hist")) || [];

    historico.push({
        data: new Date().toISOString(),
        acertos,
        total
    });

    localStorage.setItem("hist", JSON.stringify(historico));
}

function mostrarStats() {
    let historico = JSON.parse(localStorage.getItem("hist")) || [];

    let html = `<h3>📊 Histórico</h3>`;

    historico.slice(-5).forEach(h => {
        html += `<p>${h.acertos}/${h.total}</p>`;
    });

    document.getElementById("stats").innerHTML = html;
}