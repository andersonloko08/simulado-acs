# Simulado ACS PRO - Itaperuçu/PR (Edital 002-2026)

## 🎯 Objetivo do Projeto
O principal objetivo deste projeto é fornecer uma ferramenta de estudo interativa e direcionada para a preparação de candidatos ao cargo de **Agente Comunitário de Saúde (ACS)** da Prefeitura Municipal de Itaperuçu/PR.

A plataforma foi arquitetada para simular **fielmente** o ambiente e as regras da prova objetiva de Nível Médio estipuladas pelo **Edital N.º 002-2026** (Banca MSCONCURSOS), garantindo um treinamento focado e eficiente.

## ✨ Principais Funcionalidades
* **Gerador Aleatório Inteligente:** Toda vez que um novo simulado é iniciado, o sistema sorteia 40 questões do banco de dados, respeitando rigorosamente as proporções exigidas pelo edital:
  * 10 Questões de Língua Portuguesa
  * 5 Questões de Raciocínio Lógico
  * 5 Questões de Informática Básica
  * 20 Questões de Conhecimentos Específicos
* **Simulação Realista:** Interface limpa em *Glassmorphism*, modo claro/escuro e bloqueio de alternativas após a escolha para simular a marcação a caneta no cartão-resposta.
* **Correção em Tempo Real:** Feedback imediato com gabarito e comentários explicativos logo após o término da questão.
* **Analytics Individual:** No final do simulado, o usuário não recebe apenas a nota geral, mas também o detalhamento dos seus acertos separados por disciplina, ajudando a identificar seus pontos fracos e fortes.

## 🚀 Tecnologias Utilizadas
- **HTML5, CSS3 (Vanilla) e JavaScript:** Sem necessidade de frameworks complexos, tornando o projeto extremamente rápido e ideal para ser hospedado gratuitamente no GitHub Pages.
- **Python:** Utilizado como linguagem de apoio para gerar o banco de questões em JSON (`add_more_questions.py` e `gerarSimulado.py`).

## 💻 Como Rodar o Projeto
Como o projeto não utiliza banco de dados no backend (usa um arquivo JSON estático), basta:
1. Clonar este repositório.
2. Abrir o arquivo `index.html` em qualquer navegador web moderno.
3. Clicar em "Iniciar Simulado".
