import requests
import re
import json
from bs4 import BeautifulSoup
import time

BASE_URL = "https://www.pciconcursos.com.br/simulados/saude-publica/agente-comunitario-saude"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

PAGINAS = [0, 1, 2, 3]  # ajuste aqui se quiser mais


# -----------------------------
# Utils
# -----------------------------

def fix_encoding(text):
    try:
        return text.encode('latin1').decode('utf-8')
    except:
        return text


def clean(text):
    return re.sub(r'\s+', ' ', fix_encoding(text or "")).strip()


# -----------------------------
# Fetch
# -----------------------------

def fetch_html(pagina):
    url = f"{BASE_URL}/{pagina}"
    print(f"🌐 Baixando página {pagina}...")

    res = requests.get(url, headers=HEADERS)

    if res.status_code != 200:
        raise Exception(f"Erro HTTP {res.status_code} na página {pagina}")

    return res.text


# -----------------------------
# Extract JS
# -----------------------------

def extract_js(html):
    gabarito = re.search(r'simGabaritos\s*=\s*({.*?})\s*;', html, re.S)
    comentarios = re.search(r'simComentariosIA\s*=\s*({.*?})\s*;', html, re.S)

    if not gabarito or not comentarios:
        raise Exception("Erro ao extrair JS")

    return (
        json.loads(gabarito.group(1)),
        json.loads(comentarios.group(1))
    )


# -----------------------------
# Parse
# -----------------------------

def parse(html, gabaritos, comentarios):
    soup = BeautifulSoup(html, 'html.parser')
    questoes = []

    for q in soup.select('.sim-questao'):
        sid = q.get('data-sid')

        enunciado = clean(q.select_one('.sim-enunciado').get_text())

        alternativas = {}
        for alt in q.select('.btn-sim-alt'):
            letra = alt.get('data-letra')

            span = alt.select_one('.sim-letra')
            if span:
                span.extract()

            alternativas[letra] = clean(alt.get_text())

        questoes.append({
            "id": sid,
            "pergunta": enunciado,
            "alternativas": alternativas,
            "resposta": gabaritos.get(sid),
            "comentario": clean(comentarios.get(sid, "")),
        })

    return questoes


# -----------------------------
# Main pipeline
# -----------------------------

def main():
    todas = {}
    
    for p in PAGINAS:
        html = fetch_html(p)

        gabaritos, comentarios = extract_js(html)
        questoes = parse(html, gabaritos, comentarios)

        print(f"✔ Página {p}: {len(questoes)} questões")

        for q in questoes:
            todas[q["id"]] = q  # remove duplicadas automaticamente

        time.sleep(1)  # evita bloqueio

    resultado = list(todas.values())

    print(f"\n📊 TOTAL FINAL: {len(resultado)} questões únicas")

    with open("simulado_completo.json", "w", encoding="utf-8") as f:
        json.dump({
            "total": len(resultado),
            "questoes": resultado
        }, f, ensure_ascii=False, indent=2)

    print("✅ Arquivo gerado: simulado_completo.json")


if __name__ == "__main__":
    main()