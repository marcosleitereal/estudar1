-- =====================================================
-- ESTUDAR.PRO - DADOS DA CONSTITUIÇÃO FEDERAL
-- Execute após o setup-complete.sql
-- =====================================================

-- Inserir artigos da Constituição Federal
DO $$
DECLARE
    cf_source_id UUID;
BEGIN
    -- Buscar ID da fonte da Constituição Federal
    SELECT id INTO cf_source_id FROM sources WHERE name = 'Constituição Federal de 1988' LIMIT 1;
    
    -- Se não encontrar, criar
    IF cf_source_id IS NULL THEN
        INSERT INTO sources (name, type, description) 
        VALUES ('Constituição Federal de 1988', 'constitution', 'Constituição da República Federativa do Brasil de 1988')
        RETURNING id INTO cf_source_id;
    END IF;

    -- Inserir artigos da CF/88
    INSERT INTO laws (source_id, title, article, content, hierarchy_level, order_index) VALUES
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 1º', 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos: I - a soberania; II - a cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo político. Parágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.', 1, 1),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 2º', 'São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.', 1, 2),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 3º', 'Constituem objetivos fundamentais da República Federativa do Brasil: I - construir uma sociedade livre, justa e solidária; II - garantir o desenvolvimento nacional; III - erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais; IV - promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação.', 1, 3),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 4º', 'A República Federativa do Brasil rege-se nas suas relações internacionais pelos seguintes princípios: I - independência nacional; II - prevalência dos direitos humanos; III - autodeterminação dos povos; IV - não-intervenção; V - igualdade entre os Estados; VI - defesa da paz; VII - solução pacífica dos conflitos; VIII - repúdio ao terrorismo e ao racismo; IX - cooperação entre os povos para o progresso da humanidade; X - concessão de asilo político. Parágrafo único. A República Federativa do Brasil buscará a integração econômica, política, social e cultural dos povos da América Latina, visando à formação de uma comunidade latino-americana de nações.', 1, 4),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 5º', 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes: I - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição; II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei; III - ninguém será submetido a tortura nem a tratamento desumano ou degradante; IV - é livre a manifestação do pensamento, sendo vedado o anonimato; V - é assegurado o direito de resposta, proporcional ao agravo, além da indenização por dano material, moral ou à imagem; VI - é inviolável a liberdade de consciência e de crença, sendo assegurado o livre exercício dos cultos religiosos e garantida, na forma da lei, a proteção aos locais de culto e a suas liturgias; VII - é assegurada, nos termos da lei, a prestação de assistência religiosa nas entidades civis e militares de internação coletiva; VIII - ninguém será privado de direitos por motivo de crença religiosa ou de convicção filosófica ou política, salvo se as invocar para eximir-se de obrigação legal a todos imposta e recusar-se a cumprir prestação alternativa, fixada em lei; IX - é livre a expressão da atividade intelectual, artística, científica e de comunicação, independentemente de censura ou licença; X - são invioláveis a intimidade, a vida privada, a honra e a imagem das pessoas, assegurado o direito a indenização pelo dano material ou moral decorrente de sua violação.', 1, 5),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 6º', 'São direitos sociais a educação, a saúde, a alimentação, o trabalho, a moradia, o transporte, o lazer, a segurança, a previdência social, a proteção à maternidade e à infância, a assistência aos desamparados, na forma desta Constituição.', 1, 6),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 7º', 'São direitos dos trabalhadores urbanos e rurais, além de outros que visem à melhoria de sua condição social: I - relação de emprego protegida contra despedida arbitrária ou sem justa causa, nos termos de lei complementar, que preverá indenização compensatória, dentre outros direitos; II - seguro-desemprego, em caso de desemprego involuntário; III - fundo de garantia do tempo de serviço; IV - salário mínimo, fixado em lei, nacionalmente unificado, capaz de atender a suas necessidades vitais básicas e às de sua família com moradia, alimentação, educação, saúde, lazer, vestuário, higiene, transporte e previdência social, com reajustes periódicos que lhe preservem o poder aquisitivo, sendo vedada sua vinculação para qualquer fim; V - piso salarial proporcional à extensão e à complexidade do trabalho; VI - irredutibilidade do salário, salvo o disposto em convenção ou acordo coletivo; VII - garantia de salário, nunca inferior ao mínimo, para os que percebem remuneração variável; VIII - décimo terceiro salário com base na remuneração integral ou no valor da aposentadoria; IX - remuneração do trabalho noturno superior à do diurno; X - proteção do salário na forma da lei, constituindo crime sua retenção dolosa; XI - participação nos lucros, ou resultados, desvinculada da remuneração, e, excepcionalmente, participação na gestão da empresa, conforme definido em lei; XII - salário-família pago em razão do dependente do trabalhador de baixa renda nos termos da lei; XIII - duração do trabalho normal não superior a oito horas diárias e quarenta e quatro semanais, facultada a compensação de horários e a redução da jornada, mediante acordo ou convenção coletiva de trabalho; XIV - jornada de seis horas para o trabalho realizado em turnos ininterruptos de revezamento, salvo negociação coletiva; XV - repouso semanal remunerado, preferencialmente aos domingos; XVI - remuneração do serviço extraordinário superior, no mínimo, em cinquenta por cento à do normal; XVII - gozo de férias anuais remuneradas com, pelo menos, um terço a mais do que o salário normal; XVIII - licença à gestante, sem prejuízo do emprego e do salário, com a duração de cento e vinte dias; XIX - licença-paternidade, nos termos fixados em lei; XX - proteção do mercado de trabalho da mulher, mediante incentivos específicos, nos termos da lei; XXI - aviso prévio proporcional ao tempo de serviço, sendo no mínimo de trinta dias, nos termos da lei; XXII - redução dos riscos inerentes ao trabalho, por meio de normas de saúde, higiene e segurança; XXIII - adicional de remuneração para as atividades penosas, insalubres ou perigosas, na forma da lei; XXIV - aposentadoria; XXV - assistência gratuita aos filhos e dependentes desde o nascimento até 5 (cinco) anos de idade em creches e pré-escolas; XXVI - reconhecimento das convenções e acordos coletivos de trabalho; XXVII - proteção em face da automação, na forma da lei; XXVIII - seguro contra acidentes de trabalho, a cargo do empregador, sem excluir a indenização a que este está obrigado, quando incorrer em dolo ou culpa; XXIX - ação, quanto aos créditos resultantes das relações de trabalho, com prazo prescricional de cinco anos para os trabalhadores urbanos e rurais, até o limite de dois anos após a extinção do contrato de trabalho; XXX - proibição de diferença de salários, de exercício de funções e de critério de admissão por motivo de sexo, idade, cor ou estado civil; XXXI - proibição de qualquer discriminação no tocante a salário e critérios de admissão do trabalhador portador de deficiência; XXXII - proibição de distinção entre trabalho manual, técnico e intelectual ou entre os profissionais respectivos; XXXIII - proibição de trabalho noturno, perigoso ou insalubre a menores de dezoito e de qualquer trabalho a menores de dezesseis anos, salvo na condição de aprendiz, a partir de quatorze anos; XXXIV - igualdade de direitos entre o trabalhador com vínculo empregatício permanente e o trabalhador avulso.', 1, 7),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 8º', 'É livre a associação profissional ou sindical, observado o seguinte: I - a lei não poderá exigir autorização do Estado para a fundação de sindicato, ressalvado o registro no órgão competente, vedadas ao Poder Público a interferência e a intervenção na organização sindical; II - é vedada a criação de mais de uma organização sindical, em qualquer grau, representativa de categoria profissional ou econômica, na mesma base territorial, que será definida pelos trabalhadores ou empregadores interessados, não podendo ser inferior à área de um Município; III - ao sindicato cabe a defesa dos direitos e interesses coletivos ou individuais da categoria, inclusive em questões judiciais ou administrativas; IV - a assembleia geral fixará a contribuição que, em se tratando de categoria profissional, será descontada em folha, para custeio do sistema confederativo da representação sindical respectiva, independentemente da contribuição prevista em lei; V - ninguém será obrigado a filiar-se ou a manter-se filiado a sindicato; VI - é obrigatória a participação dos sindicatos nas negociações coletivas de trabalho; VII - o aposentado filiado tem direito a votar e ser votado nas organizações sindicais; VIII - é vedada a dispensa do empregado sindicalizado a partir do registro da candidatura a cargo de direção ou representação sindical e, se eleito, ainda que suplente, até um ano após o final do mandato, salvo se cometer falta grave nos termos da lei.', 1, 8),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 9º', 'É assegurado o direito de greve, competindo aos trabalhadores decidir sobre a oportunidade de exercê-lo e sobre os interesses que devam por meio dele defender. § 1º A lei definirá os serviços ou atividades essenciais e disporá sobre o atendimento das necessidades inadiáveis da comunidade. § 2º Os abusos cometidos sujeitam os responsáveis às penas da lei.', 1, 9),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 10', 'É assegurada a participação dos trabalhadores e empregadores nos colegiados dos órgãos públicos em que seus interesses profissionais ou previdenciários sejam objeto de discussão e deliberação.', 1, 10),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 11', 'Nas empresas de mais de duzentos empregados, é assegurada a eleição de um representante destes com a finalidade exclusiva de promover-lhes o entendimento direto com os empregadores.', 1, 11),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 12', 'São brasileiros: I - natos: a) os nascidos na República Federativa do Brasil, ainda que de pais estrangeiros, desde que estes não estejam a serviço de seu país; b) os nascidos no estrangeiro, de pai brasileiro ou mãe brasileira, desde que qualquer deles esteja a serviço da República Federativa do Brasil; c) os nascidos no estrangeiro de pai brasileiro ou de mãe brasileira, desde que sejam registrados em repartição brasileira competente ou venham a residir na República Federativa do Brasil e optem, em qualquer tempo, depois de atingida a maioridade, pela nacionalidade brasileira; II - naturalizados: a) os que, na forma da lei, adquiram a nacionalidade brasileira, exigidas aos originários de países de língua portuguesa apenas residência por um ano ininterrupto e idoneidade moral; b) os estrangeiros de qualquer nacionalidade, residentes na República Federativa do Brasil há mais de quinze anos ininterruptos e sem condenação penal, desde que requeiram a nacionalidade brasileira.', 1, 12),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 13', 'A língua portuguesa é o idioma oficial da República Federativa do Brasil. § 1º São símbolos da República Federativa do Brasil a bandeira, o hino, as armas e o selo nacionais. § 2º Os Estados, o Distrito Federal e os Municípios poderão ter símbolos próprios.', 1, 13),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 14', 'A soberania popular será exercida pelo sufrágio universal e pelo voto direto e secreto, com valor igual para todos, e, nos termos da lei, mediante: I - plebiscito; II - referendo; III - iniciativa popular. § 1º O alistamento eleitoral e o voto são: I - obrigatórios para os maiores de dezoito anos; II - facultativos para: a) os analfabetos; b) os maiores de setenta anos; c) os maiores de dezesseis e menores de dezoito anos. § 2º Não podem alistar-se como eleitores os estrangeiros e, durante o período do serviço militar obrigatório, os conscritos. § 3º São condições de elegibilidade, na forma da lei: I - a nacionalidade brasileira; II - o pleno exercício dos direitos políticos; III - o alistamento eleitoral; IV - o domicílio eleitoral na circunscrição; V - a filiação partidária; VI - a idade mínima de: a) trinta e cinco anos para Presidente e Vice-Presidente da República e Senador; b) trinta anos para Governador e Vice-Governador de Estado e do Distrito Federal; c) vinte e um anos para Deputado Federal, Deputado Estadual ou Distrital, Prefeito, Vice-Prefeito e juiz de paz; d) dezoito anos para Vereador.', 1, 14),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 15', 'É vedada a cassação de direitos políticos, cuja perda ou suspensão só se dará nos casos de: I - cancelamento da naturalização por sentença transitada em julgado; II - incapacidade civil absoluta; III - condenação criminal transitada em julgado, enquanto durarem seus efeitos; IV - recusa de cumprir obrigação a todos imposta ou prestação alternativa, nos termos do art. 5º, VIII; V - improbidade administrativa, nos termos do art. 37, § 4º.', 1, 15),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 16', 'A lei que alterar o processo eleitoral entrará em vigor na data de sua publicação, não se aplicando à eleição que ocorra até um ano da data de sua vigência.', 1, 16),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 17', 'É livre a criação, fusão, incorporação e extinção de partidos políticos, resguardados a soberania nacional, o regime democrático, o pluripartidarismo, os direitos fundamentais da pessoa humana e observados os seguintes preceitos: I - caráter nacional; II - proibição de recebimento de recursos financeiros de entidade ou governo estrangeiros ou de subordinação a estes; III - prestação de contas à Justiça Eleitoral; IV - funcionamento parlamentar de acordo com a lei. § 1º É assegurada aos partidos políticos autonomia para definir sua estrutura interna, organização e funcionamento e para adotar os critérios de escolha e o regime de suas coligações eleitorais, sem obrigatoriedade de vinculação entre as candidaturas em âmbito nacional, estadual, distrital ou municipal, devendo seus estatutos estabelecer normas de disciplina e fidelidade partidária. § 2º Os partidos políticos, após adquirirem personalidade jurídica, na forma da lei civil, registrarão seus estatutos no Tribunal Superior Eleitoral. § 3º Os partidos políticos têm direito a recursos do fundo partidário e acesso gratuito ao rádio e à televisão, na forma da lei. § 4º É vedada a utilização pelos partidos políticos de organização paramilitar.', 1, 17),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 18', 'A organização político-administrativa da República Federativa do Brasil compreende a União, os Estados, o Distrito Federal e os Municípios, todos autônomos, nos termos desta Constituição. § 1º Brasília é a Capital Federal. § 2º Os Territórios Federais integram a União, e sua criação, transformação em Estado ou reintegração ao Estado de origem serão reguladas em lei complementar. § 3º Os Estados podem incorporar-se entre si, subdividir-se ou desmembrar-se para se anexarem a outros, ou formarem novos Estados ou Territórios Federais, mediante aprovação da população diretamente interessada, através de plebiscito, e do Congresso Nacional, por lei complementar. § 4º A criação, a incorporação, a fusão e o desmembramento de Municípios, far-se-ão por lei estadual, dentro do período determinado por Lei Complementar Federal, e dependerão de consulta prévia, mediante plebiscito, às populações dos Municípios envolvidos, após divulgação dos Estudos de Viabilidade Municipal, apresentados e publicados na forma da lei.', 1, 18),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 19', 'É vedado à União, aos Estados, ao Distrito Federal e aos Municípios: I - estabelecer cultos religiosos ou igrejas, subvencioná-los, embaraçar-lhes o funcionamento ou manter com eles ou seus representantes relações de dependência ou aliança, ressalvada, na forma da lei, a colaboração de interesse público; II - recusar fé aos documentos públicos; III - criar distinções entre brasileiros ou preferências entre si.', 1, 19),
    
    (cf_source_id, 'Constituição Federal de 1988', 'Art. 20', 'São bens da União: I - os que atualmente lhe pertencem e os que lhe vierem a ser atribuídos; II - as terras devolutas indispensáveis à defesa das fronteiras, das fortificações e construções militares, das vias federais de comunicação e à preservação ambiental, definidas em lei; III - os lagos, rios e quaisquer correntes de água em terrenos de seu domínio, ou que banhem mais de um Estado, sirvam de limites com outros países, ou se estendam a território estrangeiro ou dele provenham, bem como os terrenos marginais e as praias fluviais; IV - as ilhas fluviais e lacustres nas zonas limítrofes com outros países; as praias marítimas; as ilhas oceânicas e as costeiras, excluídas, destas, as que contenham a sede de Municípios, exceto aquelas áreas afetadas ao serviço público e a unidade ambiental federal, e as referidas no art. 26, II; V - os recursos naturais da plataforma continental e da zona econômica exclusiva; VI - o mar territorial; VII - os terrenos de marinha e seus acrescidos; VIII - os potenciais de energia hidráulica; IX - os recursos minerais, inclusive os do subsolo; X - as cavidades naturais subterrâneas e os sítios arqueológicos e pré-históricos; XI - as terras tradicionalmente ocupadas pelos índios.', 1, 20)
    ON CONFLICT DO NOTHING;

END $$;

-- Inserir algumas súmulas importantes
INSERT INTO sumulas (number, court, type, content) VALUES
(1, 'STF', 'regular', 'É vedada a imposição de prisão civil por dívida, salvo ao responsável pelo inadimplemento voluntário e inescusável de obrigação alimentícia e ao depositário infiel.'),
(2, 'STF', 'regular', 'É inconstitucional a lei ou ato normativo estadual ou distrital que disponha sobre sistemas de consórcios e sorteios, inclusive bingos e loterias.'),
(3, 'STF', 'regular', 'A competência do Tribunal do Júri prevalece sobre o foro por prerrogativa de função estabelecido exclusivamente pela Constituição estadual.'),
(11, 'STF', 'vinculante', 'Só por lei se pode sujeitar a exame psicotécnico a habilitação de candidato a cargo público.'),
(13, 'STF', 'vinculante', 'A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa jurídica investido em cargo de direção, chefia ou assessoramento, para o exercício de cargo em comissão ou de confiança ou, ainda, de função gratificada na administração pública direta e indireta em qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios, compreendido o ajuste mediante designações recíprocas, viola a Constituição Federal.'),
(1, 'STJ', 'regular', 'O foro do domicílio ou da residência do alimentando é o competente para a ação de investigação de paternidade, quando cumulada com a de alimentos.'),
(2, 'STJ', 'regular', 'A falta de defesa constitui nulidade absoluta, mas o seu suprimento pode ser feito por defensor dativo.'),
(3, 'STJ', 'regular', 'A competência para processar e julgar ação de indenização por dano moral decorrente da publicação pela imprensa, é do foro do local onde foi feita a publicação.')
ON CONFLICT (number, court) DO NOTHING;

-- Inserir algumas questões de exemplo
INSERT INTO questions (content, type, options, correct_answer, explanation, difficulty, subject, tags) VALUES
('Segundo o Art. 1º da Constituição Federal, quais são os fundamentos da República Federativa do Brasil?', 'multiple_choice', 
'{"a": "Soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa, pluralismo político", 
  "b": "Independência nacional, prevalência dos direitos humanos, autodeterminação dos povos", 
  "c": "Construir uma sociedade livre, justa e solidária, garantir o desenvolvimento nacional", 
  "d": "Separação dos poderes, federalismo, república"}', 
'a', 'O Art. 1º da CF/88 estabelece cinco fundamentos: I - a soberania; II - a cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo político.', 'medium', 'Direito Constitucional', '{"constituição", "fundamentos", "república"}'),

('Os Poderes da União são independentes e harmônicos entre si.', 'true_false', '{}', 'true', 'Conforme o Art. 2º da CF/88: "São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário."', 'easy', 'Direito Constitucional', '{"poderes", "união", "separação"}'),

('Qual artigo da Constituição Federal trata da organização político-administrativa do Brasil?', 'multiple_choice',
'{"a": "Art. 16", "b": "Art. 17", "c": "Art. 18", "d": "Art. 19"}',
'c', 'O Art. 18 da CF/88 estabelece que a organização político-administrativa da República Federativa do Brasil compreende a União, os Estados, o Distrito Federal e os Municípios, todos autônomos.', 'medium', 'Direito Constitucional', '{"organização", "federação", "autonomia"}'),

('Brasília é a Capital Federal segundo qual parágrafo do Art. 18?', 'multiple_choice',
'{"a": "§ 1º", "b": "§ 2º", "c": "§ 3º", "d": "§ 4º"}',
'a', 'O § 1º do Art. 18 da CF/88 estabelece que "Brasília é a Capital Federal."', 'easy', 'Direito Constitucional', '{"brasília", "capital", "art18"}'),

('Segundo o Art. 2º, quais são os três Poderes da União?', 'multiple_choice',
'{"a": "Executivo, Legislativo e Judiciário", "b": "Federal, Estadual e Municipal", "c": "União, Estados e Municípios", "d": "Presidente, Congresso e STF"}',
'a', 'O Art. 2º da CF/88 estabelece que "São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário."', 'easy', 'Direito Constitucional', '{"poderes", "união", "tripartição"})
ON CONFLICT DO NOTHING;

-- Inserir alguns flashcards de exemplo
DO $$
DECLARE
    deck_id UUID;
BEGIN
    -- Criar deck de Direito Constitucional
    INSERT INTO decks (name, description, subject, is_public, user_id) 
    VALUES ('Principios Fundamentais', 'Flashcards sobre os principios fundamentais da CF/88', 'Direito Constitucional', true, '00000000-0000-0000-0000-000000000000')
    RETURNING id INTO deck_id;

    -- Inserir flashcards
    INSERT INTO flashcards (deck_id, user_id, front, back, type, tags) VALUES
    (deck_id, '00000000-0000-0000-0000-000000000000', 'Quais são os 5 fundamentos da República Federativa do Brasil (Art. 1º)?', 'I - a soberania; II - a cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo político.', 'basic', '{"fundamentos", "art1", "república"}'),
    
    (deck_id, '00000000-0000-0000-0000-000000000000', 'Art. 2º - Quais são os Poderes da União?', 'Legislativo, Executivo e Judiciário - independentes e harmônicos entre si.', 'basic', '{"poderes", "art2", "separação"}'),
    
    (deck_id, '00000000-0000-0000-0000-000000000000', 'Art. 18 - A organização político-administrativa do Brasil compreende:', 'A União, os Estados, o Distrito Federal e os Municípios, todos autônomos.', 'basic', '{"organização", "art18", "federação"}'),
    
    (deck_id, '00000000-0000-0000-0000-000000000000', 'Complete: "{{c1::Brasília}} é a Capital Federal" (Art. 18, § 1º)', 'Brasília é a Capital Federal', 'cloze', '{"brasília", "capital", "art18"}'),
    
    (deck_id, '00000000-0000-0000-0000-000000000000', 'Art. 1º, parágrafo único - De onde emana todo o poder?', 'Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.', 'basic', '{"poder", "povo", "democracia"}');

END $$;

-- =====================================================
-- DADOS POPULADOS COM SUCESSO!
-- =====================================================

