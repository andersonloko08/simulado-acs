import json

ARQUIVO_JSON = "simulado_completo.json"

novas_questoes = [
    # --- LÍNGUA PORTUGUESA (NÍVEL MÉDIO) ---
    {
        "id": "pt_11",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Assinale a alternativa em que a regência do verbo 'aspirar' exige preposição, no sentido de 'almejar'.",
        "alternativas": {
            "A": "Ele aspirou o perfume das flores com satisfação.",
            "B": "O funcionário aspira a um cargo de chefia na empresa.",
            "C": "O médico precisou aspirar o paciente com cuidado.",
            "D": "O atleta aspirava o ar puro da montanha."
        },
        "resposta": "B",
        "comentario": "O verbo aspirar no sentido de 'almejar', 'desejar' é transitivo indireto e exige a preposição 'a'. No sentido de sorver, respirar, é transitivo direto (sem preposição)."
    },
    {
        "id": "pt_12",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Na frase 'Ele é tão rápido QUANTO um leopardo', a conjunção em destaque estabelece relação de:",
        "alternativas": {
            "A": "Causa",
            "B": "Condição",
            "C": "Comparação",
            "D": "Proporção"
        },
        "resposta": "C",
        "comentario": "A estrutura 'tão... quanto' estabelece claramente uma relação de comparação de igualdade."
    },
    {
        "id": "pt_13",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Marque a alternativa em que todas as palavras estão grafadas corretamente.",
        "alternativas": {
            "A": "Pexinxa, chuchu, xadrez.",
            "B": "Pechincha, xuxu, chadrez.",
            "C": "Pechincha, chuchu, xadrez.",
            "D": "Pexinxa, xuxu, chadrez."
        },
        "resposta": "C",
        "comentario": "Pechincha escreve-se com 'ch'. Chuchu escreve-se com 'ch'. Xadrez escreve-se com 'x'."
    },
    {
        "id": "pt_14",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Assinale a opção em que há um pleonasmo vicioso.",
        "alternativas": {
            "A": "Chovia uma chuva fina e triste.",
            "B": "A mim me parece que ele está mentindo.",
            "C": "Vamos entrar para dentro, pois está esfriando.",
            "D": "Vi com meus próprios olhos."
        },
        "resposta": "C",
        "comentario": "Pleonasmo vicioso é a repetição desnecessária e sem valor literário, como 'entrar para dentro', 'subir para cima', 'descer para baixo'."
    },
    {
        "id": "pt_15",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Qual das alternativas apresenta um substantivo no plural grafado de forma INCORRETA?",
        "alternativas": {
            "A": "Cidadãos",
            "B": "Alemães",
            "C": "Escrivões",
            "D": "Capitães"
        },
        "resposta": "C",
        "comentario": "O plural de escrivão é 'escrivães', assim como capitães e alemães. 'Cidadãos' está correto."
    },
    {
        "id": "pt_16",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Em 'João quebrou a janela', a voz passiva correspondente seria:",
        "alternativas": {
            "A": "João foi quebrado pela janela.",
            "B": "A janela estava quebrando João.",
            "C": "A janela foi quebrada por João.",
            "D": "A janela quebrou a si mesma."
        },
        "resposta": "C",
        "comentario": "Na voz passiva, o objeto direto (a janela) torna-se o sujeito paciente, e o sujeito (João) vira o agente da passiva (por João)."
    },
    {
        "id": "pt_17",
        "disciplina": "Língua Portuguesa",
        "pergunta": "A palavra 'Passarinho' possui:",
        "alternativas": {
            "A": "10 letras e 10 fonemas",
            "B": "10 letras e 9 fonemas",
            "C": "10 letras e 8 fonemas",
            "D": "9 letras e 9 fonemas"
        },
        "resposta": "C",
        "comentario": "A palavra tem 10 letras e dois dígrafos (ss, nh). Cada dígrafo representa 1 fonema. Logo, 10 - 2 = 8 fonemas."
    },
    {
        "id": "pt_18",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Na obra 'Memórias Póstumas de Brás Cubas', a principal escola literária brasileira retratada é:",
        "alternativas": {
            "A": "Romantismo",
            "B": "Realismo",
            "C": "Naturalismo",
            "D": "Parnasianismo"
        },
        "resposta": "B",
        "comentario": "A obra de Machado de Assis, publicada em 1881, marca o início do Realismo no Brasil."
    },
    {
        "id": "pt_19",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Qual das palavras abaixo NÃO segue a mesma regra de acentuação de 'Árvore'?",
        "alternativas": {
            "A": "Pássaro",
            "B": "Mágico",
            "C": "Fácil",
            "D": "Matemática"
        },
        "resposta": "C",
        "comentario": "Árvore é proparoxítona. Pássaro, mágico e matemática também são. Fácil é uma palavra paroxítona terminada em 'L'."
    },
    {
        "id": "pt_20",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Qual alternativa classifica corretamente a oração: 'Espero QUE VOCÊ CHEGUE CEDO'?",
        "alternativas": {
            "A": "Oração Coordenada Sindética Explicativa",
            "B": "Oração Subordinada Substantiva Objetiva Direta",
            "C": "Oração Subordinada Adjetiva Restritiva",
            "D": "Oração Subordinada Adverbial Condicional"
        },
        "resposta": "B",
        "comentario": "A oração atua como objeto direto do verbo 'Espero' (Quem espera, espera algo). Espero [isso]."
    },
    {
        "id": "pt_21",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Identifique a classe gramatical da palavra destacada: O BEM sempre vence no final.",
        "alternativas": {
            "A": "Adjetivo",
            "B": "Advérbio",
            "C": "Substantivo",
            "D": "Preposição"
        },
        "resposta": "C",
        "comentario": "A palavra 'bem', embora usualmente advérbio, está substantivada pelo uso do artigo 'O' antes dela."
    },
    {
        "id": "pt_22",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Nas orações 'O pneu do carro FURou' e 'A lâmina FURou minha mão', o significado da palavra em destaque exemplifica o uso de:",
        "alternativas": {
            "A": "Polissemia",
            "B": "Homonímia",
            "C": "Paronímia",
            "D": "Sinonímia"
        },
        "resposta": "A",
        "comentario": "Polissemia é a propriedade de uma mesma palavra ter vários significados relacionados pelo contexto (furar no sentido de esvaziar, e furar no sentido de perfurar)."
    },
    {
        "id": "pt_23",
        "disciplina": "Língua Portuguesa",
        "pergunta": "O verbo 'assistir' exige preposição no sentido de ver. Qual frase está CORRETA?",
        "alternativas": {
            "A": "O pai não quis assistir o jogo na TV.",
            "B": "Nós assistimos à peça teatral ontem.",
            "C": "Eles assistiram o acidente da calçada.",
            "D": "O professor assiste o aluno em dúvida."
        },
        "resposta": "B",
        "comentario": "No sentido de presenciar/ver, exige-se a preposição 'a'. Portanto, com a palavra feminina 'peça', ocorre crase: 'à peça'. A alternativa D está correta para 'assistir' no sentido de ajudar, não de ver."
    },
    {
        "id": "pt_24",
        "disciplina": "Língua Portuguesa",
        "pergunta": "Marque a alternativa correta em relação ao emprego dos 'porquês'.",
        "alternativas": {
            "A": "Porquê você está tão calado hoje?",
            "B": "Ele chorou por que caiu da bicicleta.",
            "C": "Você não comeu o lanche por quê?",
            "D": "O caminho porque passei estava alagado."
        },
        "resposta": "C",
        "comentario": "Usa-se 'por quê' (separado e com acento) quando estiver imediatamente antes da pontuação final (ponto interrogativo, exclamativo, final)."
    },
    {
        "id": "pt_25",
        "disciplina": "Língua Portuguesa",
        "pergunta": "A palavra 'GIRASSOL' é formada por qual processo de formação de palavras?",
        "alternativas": {
            "A": "Derivação prefixal",
            "B": "Derivação parassintética",
            "C": "Composição por justaposição",
            "D": "Composição por aglutinação"
        },
        "resposta": "C",
        "comentario": "Gira + Sol = Girassol. As duas palavras se uniram sem perder nenhum som (o 's' foi dobrado apenas por regra ortográfica para manter o som)."
    },

    # --- RACIOCÍNIO LÓGICO (NÍVEL MÉDIO) ---
    {
        "id": "rl_06",
        "disciplina": "Raciocínio Lógico",
        "pergunta": "De acordo com as Leis de Morgan, a negação de 'Maria vai à feira OU João vai ao cinema' é:",
        "alternativas": {
            "A": "Maria não vai à feira OU João não vai ao cinema.",
            "B": "Maria não vai à feira E João não vai ao cinema.",
            "C": "Maria vai à feira E João vai ao cinema.",
            "D": "Se Maria não vai à feira, então João vai ao cinema."
        },
        "resposta": "B",
        "comentario": "A negação de (p ∨ q) é (~p ∧ ~q). Troca-se o 'OU' por 'E', e nega-se ambas as proposições."
    },
    {
        "id": "rl_07",
        "disciplina": "Raciocínio Lógico",
        "pergunta": "Em um setor de saúde, 4 enfermeiros atendem 20 pacientes em 5 horas. Mantendo o ritmo, quantos pacientes 6 enfermeiros atenderão em 10 horas?",
        "alternativas": {
            "A": "30",
            "B": "40",
            "C": "50",
            "D": "60"
        },
        "resposta": "D",
        "comentario": "Regra de 3 composta. (Pacientes/Enf/Horas): 20/4/5 -> X/6/10. O rendimento é de 1 paciente por enfermeiro por hora. Logo, 6 * 10 = 60 pacientes."
    },
    {
        "id": "rl_08",
        "disciplina": "Raciocínio Lógico",
        "pergunta": "Na sequência (3, 6, 12, 24, 48...), qual é o próximo termo lógico?",
        "alternativas": {
            "A": "72",
            "B": "84",
            "C": "96",
            "D": "120"
        },
        "resposta": "C",
        "comentario": "Trata-se de uma Progressão Geométrica (PG) em que cada número é multiplicado por 2. Logo, 48 x 2 = 96."
    },
    {
        "id": "rl_09",
        "disciplina": "Raciocínio Lógico",
        "pergunta": "Quantos anagramas possui a palavra 'SUS'?",
        "alternativas": {
            "A": "3",
            "B": "4",
            "C": "5",
            "D": "6"
        },
        "resposta": "A",
        "comentario": "Calcula-se por permutação com repetição. P3 com repetição de 2 (a letra S aparece 2 vezes). P = 3! / 2! = 6 / 2 = 3. Os anagramas são: SUS, USS, SSU."
    },
    {
        "id": "rl_10",
        "disciplina": "Raciocínio Lógico",
        "pergunta": "Considere verdadeira a premissa 'Se corro, então suo'. Logo, é logicamente correto afirmar que:",
        "alternativas": {
            "A": "Se suo, então corro.",
            "B": "Se não corro, então não suo.",
            "C": "Correr é necessário para suar.",
            "D": "Se não suo, então não corro."
        },
        "resposta": "D",
        "comentario": "A única equivalência direta da condicional (p → q) é a contrapositiva (~q → ~p): Se não suo, não corro."
    },
    {
        "id": "rl_11",
        "disciplina": "Raciocínio Lógico",
        "pergunta": "Qual é a equivalência lógica para 'Estudo ou Trabalho' (p ∨ q)?",
        "alternativas": {
            "A": "Se não estudo, então trabalho.",
            "B": "Se não trabalho, então não estudo.",
            "C": "Se estudo, então trabalho.",
            "D": "Estudo e Trabalho."
        },
        "resposta": "A",
        "comentario": "Uma equivalência para (p ∨ q) é (~p → q). 'Ou estudo, ou, se não estudar, então trabalho'."
    },
    {
        "id": "rl_12",
        "disciplina": "Raciocínio Lógico",
        "pergunta": "Em uma sala com 50 Agentes Comunitários, 30 têm carro, 20 têm moto e 5 não têm nem carro nem moto. Quantos têm carro E moto simultaneamente?",
        "alternativas": {
            "A": "5",
            "B": "10",
            "C": "15",
            "D": "20"
        },
        "resposta": "A",
        "comentario": "Total de veículos distribuídos: 30(C) + 20(M) = 50. Total de agentes com veículo = 50 - 5 = 45. Logo, 50 - 45 = 5 agentes possuem ambos (interseção dos conjuntos)."
    },

    # --- INFORMÁTICA BÁSICA (NÍVEL MÉDIO) ---
    {
        "id": "info_06",
        "disciplina": "Informática Básica",
        "pergunta": "Para inserir uma quebra de página em um documento do Microsoft Word 2016 sem usar o mouse, qual é o atalho correto de teclado?",
        "alternativas": {
            "A": "Ctrl + Enter",
            "B": "Shift + Enter",
            "C": "Alt + Enter",
            "D": "Tab + Enter"
        },
        "resposta": "A",
        "comentario": "O atalho Ctrl + Enter cria imediatamente uma quebra de página, forçando o cursor a iniciar na página seguinte."
    },
    {
        "id": "info_07",
        "disciplina": "Informática Básica",
        "pergunta": "No contexto de Correio Eletrônico (e-mail), qual o campo utilizado para enviar uma cópia oculta, de modo que os demais destinatários não vejam o endereço?",
        "alternativas": {
            "A": "Para (To)",
            "B": "Cc",
            "C": "Cco",
            "D": "Anexo"
        },
        "resposta": "C",
        "comentario": "Cco significa 'Cópia Carbono Oculta' (Bcc em inglês - Blind Carbon Copy). Protege a privacidade dos destinatários ali inseridos."
    },
    {
        "id": "info_08",
        "disciplina": "Informática Básica",
        "pergunta": "O que é 'Phishing' em conceitos de segurança da informação?",
        "alternativas": {
            "A": "Um antivírus capaz de pescar ameaças antes que abram.",
            "B": "Técnica de fraude que induz o usuário a revelar dados confidenciais por meio de páginas falsas.",
            "C": "Um programa nativo do Windows 10 para limpar arquivos desnecessários.",
            "D": "Uma criptografia aplicada apenas em certificados digitais bancários."
        },
        "resposta": "B",
        "comentario": "Phishing é um tipo de ataque de engenharia social que busca 'pescar' informações de usuários distraídos."
    },
    {
        "id": "info_09",
        "disciplina": "Informática Básica",
        "pergunta": "Em uma planilha eletrônica do MS-Excel 2016, a alça de preenchimento (pequeno quadrado no canto inferior direito da célula selecionada) serve principalmente para:",
        "alternativas": {
            "A": "Apagar o conteúdo da célula.",
            "B": "Copiar a formatação ou criar uma série de dados lógicos ao ser arrastada.",
            "C": "Mesclar e centralizar o conteúdo.",
            "D": "Exibir fórmulas ocultas que estejam com erro."
        },
        "resposta": "B",
        "comentario": "A alça de preenchimento permite arrastar e copiar dados, fórmulas ou continuar sequências (ex: Janeiro, Fevereiro...)."
    },
    {
        "id": "info_10",
        "disciplina": "Informática Básica",
        "pergunta": "O que caracteriza a navegação 'Anônima' ou 'InPrivate' nos navegadores de internet?",
        "alternativas": {
            "A": "Impede o provedor de internet de saber quais sites você visita.",
            "B": "Torna seu computador invulnerável contra qualquer vírus.",
            "C": "Não armazena histórico de navegação, cookies e dados de formulários na sua máquina ao fechar a janela.",
            "D": "Muda o seu IP para um IP internacional instantaneamente."
        },
        "resposta": "C",
        "comentario": "A janela anônima apenas não salva localmente o seu histórico. Ela NÃO esconde o tráfego do seu provedor ou administrador de rede, nem protege contra vírus."
    },
    {
        "id": "info_11",
        "disciplina": "Informática Básica",
        "pergunta": "Qual a finalidade de usar 'Assinatura Digital' em um documento eletrônico?",
        "alternativas": {
            "A": "Reduzir o tamanho do arquivo PDF.",
            "B": "Comprovar a autoria e a integridade do documento.",
            "C": "Proteger o computador de cavalos de Troia.",
            "D": "Converter um arquivo de Word em imagem."
        },
        "resposta": "B",
        "comentario": "A assinatura digital utiliza criptografia assimétrica (certificados digitais) para garantir quem enviou (autenticidade) e que o documento não foi alterado (integridade)."
    },
    {
        "id": "info_12",
        "disciplina": "Informática Básica",
        "pergunta": "No MS-PowerPoint 2016, para qual modo a tecla 'F5' atua por padrão?",
        "alternativas": {
            "A": "Salvar Como.",
            "B": "Abrir nova apresentação em branco.",
            "C": "Iniciar a apresentação de slides a partir do primeiro slide.",
            "D": "Iniciar a verificação ortográfica."
        },
        "resposta": "C",
        "comentario": "O F5 inicia o modo de apresentação de slides do começo. (Shift + F5 inicia do slide atual)."
    }
]

with open(ARQUIVO_JSON, "r", encoding="utf-8") as f:
    dados = json.load(f)

for q in novas_questoes:
    dados["questoes"].append(q)

dados["total"] = len(dados["questoes"])

with open(ARQUIVO_JSON, "w", encoding="utf-8") as f:
    json.dump(dados, f, indent=2, ensure_ascii=False)

print(f"Sucesso: Adicionadas {len(novas_questoes)} novas questões!")
