// Mock data for laws until database is fully configured
export interface Law {
  id: string
  title: string
  article: string
  content: string
  hierarchy_level: number
  order_index: number
}

export const mockLaws: Law[] = [
  {
    id: '1',
    title: 'Constituição Federal de 1988',
    article: 'Art. 1º',
    content: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos: I - a soberania; II - a cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo político. Parágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.',
    hierarchy_level: 1,
    order_index: 1
  },
  {
    id: '2',
    title: 'Constituição Federal de 1988',
    article: 'Art. 2º',
    content: 'São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.',
    hierarchy_level: 1,
    order_index: 2
  },
  {
    id: '3',
    title: 'Constituição Federal de 1988',
    article: 'Art. 3º',
    content: 'Constituem objetivos fundamentais da República Federativa do Brasil: I - construir uma sociedade livre, justa e solidária; II - garantir o desenvolvimento nacional; III - erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais; IV - promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação.',
    hierarchy_level: 1,
    order_index: 3
  },
  {
    id: '4',
    title: 'Constituição Federal de 1988',
    article: 'Art. 4º',
    content: 'A República Federativa do Brasil rege-se nas suas relações internacionais pelos seguintes princípios: I - independência nacional; II - prevalência dos direitos humanos; III - autodeterminação dos povos; IV - não-intervenção; V - igualdade entre os Estados; VI - defesa da paz; VII - solução pacífica dos conflitos; VIII - repúdio ao terrorismo e ao racismo; IX - cooperação entre os povos para o progresso da humanidade; X - concessão de asilo político. Parágrafo único. A República Federativa do Brasil buscará a integração econômica, política, social e cultural dos povos da América Latina, visando à formação de uma comunidade latino-americana de nações.',
    hierarchy_level: 1,
    order_index: 4
  },
  {
    id: '5',
    title: 'Constituição Federal de 1988',
    article: 'Art. 5º',
    content: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes: I - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição; II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei; III - ninguém será submetido a tortura nem a tratamento desumano ou degradante; IV - é livre a manifestação do pensamento, sendo vedado o anonimato; V - é assegurado o direito de resposta, proporcional ao agravo, além da indenização por dano material, moral ou à imagem; VI - é inviolável a liberdade de consciência e de crença, sendo assegurado o livre exercício dos cultos religiosos e garantida, na forma da lei, a proteção aos locais de culto e a suas liturgias; VII - é assegurada, nos termos da lei, a prestação de assistência religiosa nas entidades civis e militares de internação coletiva; VIII - ninguém será privado de direitos por motivo de crença religiosa ou de convicção filosófica ou política, salvo se as invocar para eximir-se de obrigação legal a todos imposta e recusar-se a cumprir prestação alternativa, fixada em lei; IX - é livre a expressão da atividade intelectual, artística, científica e de comunicação, independentemente de censura ou licença; X - são invioláveis a intimidade, a vida privada, a honra e a imagem das pessoas, assegurado o direito a indenização pelo dano material ou moral decorrente de sua violação.',
    hierarchy_level: 1,
    order_index: 5
  },
  {
    id: '18',
    title: 'Constituição Federal de 1988',
    article: 'Art. 18',
    content: 'A organização político-administrativa da República Federativa do Brasil compreende a União, os Estados, o Distrito Federal e os Municípios, todos autônomos, nos termos desta Constituição. § 1º Brasília é a Capital Federal. § 2º Os Territórios Federais integram a União, e sua criação, transformação em Estado ou reintegração ao Estado de origem serão reguladas em lei complementar. § 3º Os Estados podem incorporar-se entre si, subdividir-se ou desmembrar-se para se anexarem a outros, ou formarem novos Estados ou Territórios Federais, mediante aprovação da população diretamente interessada, através de plebiscito, e do Congresso Nacional, por lei complementar. § 4º A criação, a incorporação, a fusão e o desmembramento de Municípios, far-se-ão por lei estadual, dentro do período determinado por Lei Complementar Federal, e dependerão de consulta prévia, mediante plebiscito, às populações dos Municípios envolvidos, após divulgação dos Estudos de Viabilidade Municipal, apresentados e publicados na forma da lei.',
    hierarchy_level: 1,
    order_index: 18
  },
  {
    id: '19',
    title: 'Constituição Federal de 1988',
    article: 'Art. 19',
    content: 'É vedado à União, aos Estados, ao Distrito Federal e aos Municípios: I - estabelecer cultos religiosos ou igrejas, subvencioná-los, embaraçar-lhes o funcionamento ou manter com eles ou seus representantes relações de dependência ou aliança, ressalvada, na forma da lei, a colaboração de interesse público; II - recusar fé aos documentos públicos; III - criar distinções entre brasileiros ou preferências entre si.',
    hierarchy_level: 1,
    order_index: 19
  },
  {
    id: '20',
    title: 'Constituição Federal de 1988',
    article: 'Art. 20',
    content: 'São bens da União: I - os que atualmente lhe pertencem e os que lhe vierem a ser atribuídos; II - as terras devolutas indispensáveis à defesa das fronteiras, das fortificações e construções militares, das vias federais de comunicação e à preservação ambiental, definidas em lei; III - os lagos, rios e quaisquer correntes de água em terrenos de seu domínio, ou que banhem mais de um Estado, sirvam de limites com outros países, ou se estendam a território estrangeiro ou dele provenham, bem como os terrenos marginais e as praias fluviais; IV - as ilhas fluviais e lacustres nas zonas limítrofes com outros países; as praias marítimas; as ilhas oceânicas e as costeiras, excluídas, destas, as que contenham a sede de Municípios, exceto aquelas áreas afetadas ao serviço público e a unidade ambiental federal, e as referidas no art. 26, II; V - os recursos naturais da plataforma continental e da zona econômica exclusiva; VI - o mar territorial; VII - os terrenos de marinha e seus acrescidos; VIII - os potenciais de energia hidráulica; IX - os recursos minerais, inclusive os do subsolo; X - as cavidades naturais subterrâneas e os sítios arqueológicos e pré-históricos; XI - as terras tradicionalmente ocupadas pelos índios.',
    hierarchy_level: 1,
    order_index: 20
  }
]

// Search function for mock data
export function searchMockLaws(query: string): Law[] {
  if (!query || query.trim().length < 2) {
    return []
  }

  const searchTerm = query.toLowerCase().trim()
  
  return mockLaws.filter(law => {
    return (
      law.article.toLowerCase().includes(searchTerm) ||
      law.content.toLowerCase().includes(searchTerm) ||
      law.title.toLowerCase().includes(searchTerm)
    )
  }).slice(0, 10) // Limit to 10 results
}

// Get law by article number
export function getMockLawByArticle(articleNumber: string): Law | null {
  const article = `art. ${articleNumber}`
  return mockLaws.find(law => 
    law.article.toLowerCase().includes(article.toLowerCase())
  ) || null
}

