import json

ARQUIVO_JSON = "simulado_completo.json"
ARQUIVO_HTML = "simulado_interativo.html"
QTD_QUESTOES = 40


def carregar_questoes():
    with open(ARQUIVO_JSON, encoding="utf-8") as f:
        dados = json.load(f)["questoes"]
    return dados[:QTD_QUESTOES]


def gerar_html(questoes):
    html = """
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>Simulado Interativo</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<style>
body {
    font-family: Arial;
    margin: 0;
    background: #eef2f7;
}

header {
    background: #111827;
    color: white;
    padding: 15px;
    text-align: center;
    position: sticky;
    top: 0;
}

.container {
    max-width: 900px;
    margin: auto;
    padding: 20px;
}

.menu {
    position: fixed;
    right: 10px;
    top: 80px;
    background: white;
    padding: 10px;
    border-radius: 10px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.menu a {
    display: block;
    text-decoration: none;
    padding: 5px;
    color: #1f2937;
}

.questao {
    background: white;
    padding: 18px;
    margin-bottom: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.enunciado {
    font-weight: bold;
    margin-bottom: 10px;
}

.alternativa {
    display: block;
    margin: 6px 0;
    cursor: pointer;
}

button {
    margin-top: 10px;
    padding: 10px;
    width: 100%;
    border: none;
    background: #2563eb;
    color: white;
    border-radius: 8px;
    cursor: pointer;
}

.resposta {
    margin-top: 10px;
    padding: 10px;
    border-radius: 8px;
    display: none;
}

.correto {
    background: #dcfce7;
    color: #166534;
}

.errado {
    background: #fee2e2;
    color: #991b1b;
}

</style>
</head>

<body>

<header>
    <h2>📘 Simulado Interativo</h2>
</header>

<div class="menu">
"""

    # MENU DE NAVEGAÇÃO
    for i in range(len(questoes)):
        html += f'<a href="#q{i}">Questão {i+1}</a>'

    html += """
</div>

<div class="container">
"""

    # QUESTÕES
    for i, q in enumerate(questoes):
        html += f"""
<div class="questao" id="q{i}">

<h3>Questão {i+1}</h3>

<div class="enunciado">{q['pergunta']}</div>

<div>
"""

        for letra, texto in q["alternativas"].items():
            html += f"""
<label class="alternativa">
<input type="radio" name="q{i}" value="{letra}">
{letra}) {texto}
</label>
"""

        comentario = q.get("comentario", "")
        correta = q["resposta"]

        html += f"""
<button onclick="corrigir({i}, '{correta}', `{comentario}`)">
Enviar resposta
</button>

<div id="res{i}" class="resposta"></div>

</div>
</div>
"""

    html += """
</div>

<script>

function corrigir(i, correta, comentario) {

    let opcoes = document.getElementsByName("q" + i);
    let marcada = null;

    for (let opt of opcoes) {
        if (opt.checked) marcada = opt.value;
    }

    let box = document.getElementById("res" + i);

    if (!marcada) {
        box.style.display = "block";
        box.className = "resposta errado";
        box.innerHTML = "⚠ Selecione uma alternativa.";
        return;
    }

    if (marcada === correta) {
        box.className = "resposta correto";
        box.innerHTML = "✅ Correto!<br><br>🧠 " + comentario;
    } else {
        box.className = "resposta errado";
        box.innerHTML = "❌ Errado<br>✔ Correta: " + correta + "<br><br>🧠 " + comentario;
    }

    box.style.display = "block";
}

</script>

</body>
</html>
"""

    return html


def main():
    questoes = carregar_questoes()

    html = gerar_html(questoes)

    with open(ARQUIVO_HTML, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ Simulado interativo gerado: {ARQUIVO_HTML}")


if __name__ == "__main__":
    main()