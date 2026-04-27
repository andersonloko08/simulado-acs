# Instruções para Inserir Novas Questões no Simulado ACS

Este documento serve como uma **"Skill" (habilidade)** ou guia de instruções para qualquer Agente de Inteligência Artificial (ou humano) que deseje adicionar novas perguntas ao banco de dados dinâmico do simulado.

## Onde os Dados São Armazenados?

O banco de questões é completamente estático e fica localizado no arquivo JSON na raiz do projeto:
`simulado_completo.json`

## Como Inserir uma Nova Questão

Para inserir uma nova questão, você precisa **adicionar um novo objeto JSON** dentro do array `"questoes"`. 

### Estrutura (Schema) Obrigatória:

```json
{
  "id": "GERAR_UM_ID_UNICO_AQUI",
  "pergunta": "Texto completo da pergunta da prova. Pode incluir textos longos.",
  "alternativas": {
    "A": "Texto da alternativa A",
    "B": "Texto da alternativa B",
    "C": "Texto da alternativa C",
    "D": "Texto da alternativa D",
    "E": "Texto da alternativa E"
  },
  "resposta": "A",
  "comentario": "Texto explicando detalhadamente o porquê dessa alternativa ser a correta e base legal se houver.",
  "disciplina": "NOME_DA_DISCIPLINA_EXATO"
}
```

### Regras Críticas para IAs e Desenvolvedores

1. **Disciplinas Permitidas**:
   Para que a prova mantenha o padrão do edital e o cálculo de notas funcione, o campo `"disciplina"` deve ser *exatamente* um destes:
   - `Língua Portuguesa`
   - `Raciocínio Lógico`
   - `Informática Básica`
   - `Conhecimentos Específicos`
   *(Qualquer variação, como falta de acento ou plural errado, quebrará o cálculo do simulado).*

2. **Formatação das Alternativas**:
   - É altamente recomendado usar 5 alternativas de "A" até "E" (padrão de concursos de nível médio da MSCONCURSOS). 
   - Se for uma prova de 4 alternativas, use "A" a "D", o sistema renderiza automaticamente o número correto de opções.

3. **ID Único**:
   Gere sempre um ID numérico em formato de string que seja único, ex: `"9873491"`.

4. **Campo `resposta`**:
   O campo resposta DEVE OBRIGATORIAMENTE ser exatamente a Letra (Maiúscula) correspondente na propriedade `"alternativas"`. Exemplo: `"A"`.

5. **Ajustar o Contador `"total"`**:
   No início do arquivo `simulado_completo.json`, há a chave `"total": 162`. Toda vez que você injetar uma nova questão no array `"questoes"`, você **deve** incrementar esse `"total"` correspondente à nova quantidade de objetos dentro do array.

### Exemplo Rápido (Prompt Sugerido)

Se você é o usuário e quer pedir para a IA incluir uma questão que você viu em uma prova passada, pode usar o seguinte prompt:

> *"AI, por favor adicione esta questão de [Insira a Disciplina] no arquivo simulado_completo.json, crie um comentário explicativo se não houver, e siga as instruções definidas em INSTRUCOES_NOVAS_QUESTOES.md."*

A IA irá ler este arquivo e formatar o JSON impecavelmente.
