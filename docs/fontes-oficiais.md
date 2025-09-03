# Fontes Oficiais de Dados Jurídicos Brasileiros

## 1. Lei Seca (Legislação Principal)

### Planalto (Presidência da República)
- **URL Base**: http://www.planalto.gov.br/ccivil_03/
- **Conteúdo**: CF/88, CC, CPC, CP, CPP, CDC, CLT, etc.
- **Formato**: HTML estruturado
- **Atualização**: Oficial, sempre atualizada
- **API**: Não possui API oficial, scraping necessário

### LexML (Portal da Legislação)
- **URL Base**: https://www.lexml.gov.br/
- **Conteúdo**: Toda legislação federal, estadual e municipal
- **Formato**: XML/RDF estruturado
- **API**: Possui API REST
- **Vantagem**: Metadados estruturados

## 2. Legislação Extravagante

### Estatutos e Leis Esparsas
- **Fonte**: Planalto + LexML
- **Exemplos**: ECA, Estatuto do Idoso, Lei Maria da Penha, etc.
- **Estratégia**: Importação por categoria/tema

## 3. Súmulas

### STF (Supremo Tribunal Federal)
- **URL**: https://portal.stf.jus.br/jurisprudencia/
- **Súmulas**: Vinculantes + Não vinculantes
- **Formato**: HTML + PDF
- **Total**: ~750 súmulas

### STJ (Superior Tribunal de Justiça)
- **URL**: https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/
- **Súmulas**: Todas as súmulas do STJ
- **Formato**: HTML estruturado
- **Total**: ~650 súmulas

## 4. Enunciados e Orientações Jurisprudenciais

### TST (Tribunal Superior do Trabalho)
- **URL**: https://www.tst.jus.br/
- **Conteúdo**: OJs, Súmulas, Precedentes Normativos
- **Formato**: HTML/PDF

### CJF (Conselho da Justiça Federal)
- **URL**: https://www.cjf.jus.br/
- **Conteúdo**: Enunciados das Jornadas de Direito Civil
- **Formato**: PDF/HTML

### FONAJE (Fórum Nacional de Juizados Especiais)
- **URL**: https://www.fonaje.org.br/
- **Conteúdo**: Enunciados dos Juizados Especiais

## 5. Jurisprudência (Ementas)

### STF
- **URL**: https://portal.stf.jus.br/
- **API**: Possui API para consulta
- **Conteúdo**: Acórdãos, decisões monocráticas

### STJ
- **URL**: https://www.stj.jus.br/
- **Conteúdo**: Jurisprudência completa
- **Formato**: HTML estruturado

### TST
- **URL**: https://www.tst.jus.br/
- **Conteúdo**: Decisões trabalhistas

### TRFs (Tribunais Regionais Federais)
- **URLs**: Cada TRF tem seu portal
- **Conteúdo**: Jurisprudência regional

## 6. Estratégia de Implementação

### Fase 1: Lei Seca (Prioridade Máxima)
1. **Constituição Federal 1988** - Planalto
2. **Código Civil** - Planalto
3. **Código Penal** - Planalto
4. **CPC** - Planalto
5. **CPP** - Planalto
6. **CDC** - Planalto
7. **CLT** - Planalto

### Fase 2: Súmulas (Alta Prioridade)
1. **STF** - Todas as súmulas
2. **STJ** - Todas as súmulas
3. **TST** - Súmulas trabalhistas

### Fase 3: Enunciados (Média Prioridade)
1. **CJF** - Jornadas de Direito Civil
2. **FONAJE** - Juizados Especiais
3. **TST** - OJs e Precedentes

### Fase 4: Jurisprudência (Baixa Prioridade)
1. **STF** - Principais decisões
2. **STJ** - Jurisprudência selecionada
3. **TST** - Decisões relevantes

## 7. Tecnologias e Ferramentas

### Web Scraping
- **BeautifulSoup** - Para parsing HTML
- **Scrapy** - Para scraping em larga escala
- **Selenium** - Para sites com JavaScript

### APIs
- **LexML API** - Para metadados estruturados
- **STF API** - Para jurisprudência

### Processamento
- **OpenAI API** - Para estruturação e limpeza
- **spaCy** - Para NLP em português
- **PostgreSQL** - Para armazenamento

### Versionamento
- **Git** - Para controle de versão dos dados
- **Timestamps** - Para rastreamento de atualizações

## 8. Cronograma de Implementação

### Semana 1: Infraestrutura
- Setup dos scrapers
- Estrutura do banco de dados
- Sistema de versionamento

### Semana 2: Lei Seca
- Importação da CF/88
- Importação dos códigos principais
- Testes e validação

### Semana 3: Súmulas
- STF e STJ
- Estruturação e indexação
- Integração com busca

### Semana 4: Finalização
- Enunciados e OJs
- Jurisprudência selecionada
- Deploy e documentação

## 9. Métricas de Sucesso

### Cobertura Legal
- ✅ 100% da legislação principal brasileira
- ✅ 100% das súmulas STF/STJ
- ✅ 90% dos enunciados relevantes
- ✅ Jurisprudência selecionada dos tribunais superiores

### Qualidade dos Dados
- ✅ Dados sempre atualizados
- ✅ Estruturação consistente
- ✅ Metadados completos
- ✅ Busca semântica funcional

### Performance
- ✅ Busca em < 500ms
- ✅ Atualização automática diária
- ✅ Interface responsiva
- ✅ 99.9% de uptime

