-- Tabela para armazenar leis completas
CREATE TABLE IF NOT EXISTS laws (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    type TEXT NOT NULL, -- 'constituicao', 'codigo', 'lei', 'decreto', etc.
    number TEXT NOT NULL,
    year INTEGER NOT NULL,
    publication_date DATE,
    source_url TEXT NOT NULL,
    full_text TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para artigos das leis
CREATE TABLE IF NOT EXISTS law_articles (
    id SERIAL PRIMARY KEY,
    law_id TEXT NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
    article_number TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    hierarchy_level INTEGER DEFAULT 1, -- 1=artigo, 2=parágrafo, 3=inciso, etc.
    parent_id INTEGER REFERENCES law_articles(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(law_id, article_number)
);

-- Tabela para súmulas
CREATE TABLE IF NOT EXISTS sumulas (
    id TEXT PRIMARY KEY,
    number INTEGER NOT NULL,
    court TEXT NOT NULL, -- 'STF', 'STJ', 'TST', etc.
    type TEXT NOT NULL, -- 'vinculante', 'nao_vinculante', 'comum'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    publication_date DATE,
    source_url TEXT NOT NULL,
    status TEXT DEFAULT 'ativa', -- 'ativa', 'cancelada', 'superada'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(court, number)
);

-- Tabela para enunciados (CJF, FONAJE, etc.)
CREATE TABLE IF NOT EXISTS enunciados (
    id TEXT PRIMARY KEY,
    number INTEGER NOT NULL,
    organ TEXT NOT NULL, -- 'CJF', 'FONAJE', 'TST', etc.
    event TEXT, -- 'I Jornada', 'II Jornada', etc.
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    subject_area TEXT, -- 'civil', 'processual_civil', 'consumidor', etc.
    publication_date DATE,
    source_url TEXT NOT NULL,
    status TEXT DEFAULT 'ativo',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organ, number, event)
);

-- Tabela para jurisprudência (ementas)
CREATE TABLE IF NOT EXISTS jurisprudencia (
    id TEXT PRIMARY KEY,
    court TEXT NOT NULL, -- 'STF', 'STJ', 'TST', 'TRF1', etc.
    type TEXT NOT NULL, -- 'acordao', 'decisao_monocratica', 'liminar', etc.
    number TEXT NOT NULL,
    relator TEXT,
    ementa TEXT NOT NULL,
    full_text TEXT,
    decision_date DATE,
    publication_date DATE,
    subject_areas TEXT[], -- array de áreas do direito
    keywords TEXT[], -- palavras-chave
    source_url TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(court, number)
);

-- Índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_laws_type ON laws(type);
CREATE INDEX IF NOT EXISTS idx_laws_year ON laws(year);
CREATE INDEX IF NOT EXISTS idx_laws_title_search ON laws USING gin(to_tsvector('portuguese', title));
CREATE INDEX IF NOT EXISTS idx_laws_content_search ON laws USING gin(to_tsvector('portuguese', full_text));

CREATE INDEX IF NOT EXISTS idx_law_articles_law_id ON law_articles(law_id);
CREATE INDEX IF NOT EXISTS idx_law_articles_number ON law_articles(article_number);
CREATE INDEX IF NOT EXISTS idx_law_articles_content_search ON law_articles USING gin(to_tsvector('portuguese', content));

CREATE INDEX IF NOT EXISTS idx_sumulas_court ON sumulas(court);
CREATE INDEX IF NOT EXISTS idx_sumulas_type ON sumulas(type);
CREATE INDEX IF NOT EXISTS idx_sumulas_number ON sumulas(number);
CREATE INDEX IF NOT EXISTS idx_sumulas_content_search ON sumulas USING gin(to_tsvector('portuguese', content));

CREATE INDEX IF NOT EXISTS idx_enunciados_organ ON enunciados(organ);
CREATE INDEX IF NOT EXISTS idx_enunciados_subject ON enunciados(subject_area);
CREATE INDEX IF NOT EXISTS idx_enunciados_content_search ON enunciados USING gin(to_tsvector('portuguese', content));

CREATE INDEX IF NOT EXISTS idx_jurisprudencia_court ON jurisprudencia(court);
CREATE INDEX IF NOT EXISTS idx_jurisprudencia_type ON jurisprudencia(type);
CREATE INDEX IF NOT EXISTS idx_jurisprudencia_date ON jurisprudencia(decision_date);
CREATE INDEX IF NOT EXISTS idx_jurisprudencia_ementa_search ON jurisprudencia USING gin(to_tsvector('portuguese', ementa));

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_laws_updated_at BEFORE UPDATE ON laws
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_law_articles_updated_at BEFORE UPDATE ON law_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sumulas_updated_at BEFORE UPDATE ON sumulas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enunciados_updated_at BEFORE UPDATE ON enunciados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jurisprudencia_updated_at BEFORE UPDATE ON jurisprudencia
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para busca unificada em todo o conteúdo jurídico
CREATE OR REPLACE FUNCTION search_legal_content(
    search_query TEXT,
    content_types TEXT[] DEFAULT ARRAY['laws', 'sumulas', 'enunciados', 'jurisprudencia'],
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    id TEXT,
    title TEXT,
    content TEXT,
    type TEXT,
    source TEXT,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    (
        -- Buscar em leis
        SELECT 
            l.id::TEXT,
            l.title,
            COALESCE(l.full_text, '')::TEXT as content,
            'lei'::TEXT as type,
            l.source_url as source,
            ts_rank(to_tsvector('portuguese', l.title || ' ' || COALESCE(l.full_text, '')), plainto_tsquery('portuguese', search_query)) as relevance
        FROM laws l
        WHERE 'laws' = ANY(content_types)
        AND to_tsvector('portuguese', l.title || ' ' || COALESCE(l.full_text, '')) @@ plainto_tsquery('portuguese', search_query)
        
        UNION ALL
        
        -- Buscar em artigos de leis
        SELECT 
            la.id::TEXT,
            la.title,
            la.content,
            'artigo'::TEXT as type,
            l.source_url as source,
            ts_rank(to_tsvector('portuguese', la.title || ' ' || la.content), plainto_tsquery('portuguese', search_query)) as relevance
        FROM law_articles la
        JOIN laws l ON la.law_id = l.id
        WHERE 'laws' = ANY(content_types)
        AND to_tsvector('portuguese', la.title || ' ' || la.content) @@ plainto_tsquery('portuguese', search_query)
        
        UNION ALL
        
        -- Buscar em súmulas
        SELECT 
            s.id::TEXT,
            s.title,
            s.content,
            'sumula'::TEXT as type,
            s.source_url as source,
            ts_rank(to_tsvector('portuguese', s.title || ' ' || s.content), plainto_tsquery('portuguese', search_query)) as relevance
        FROM sumulas s
        WHERE 'sumulas' = ANY(content_types)
        AND to_tsvector('portuguese', s.title || ' ' || s.content) @@ plainto_tsquery('portuguese', search_query)
        
        UNION ALL
        
        -- Buscar em enunciados
        SELECT 
            e.id::TEXT,
            e.title,
            e.content,
            'enunciado'::TEXT as type,
            e.source_url as source,
            ts_rank(to_tsvector('portuguese', e.title || ' ' || e.content), plainto_tsquery('portuguese', search_query)) as relevance
        FROM enunciados e
        WHERE 'enunciados' = ANY(content_types)
        AND to_tsvector('portuguese', e.title || ' ' || e.content) @@ plainto_tsquery('portuguese', search_query)
        
        UNION ALL
        
        -- Buscar em jurisprudência
        SELECT 
            j.id::TEXT,
            COALESCE(j.number, 'Sem número')::TEXT as title,
            j.ementa as content,
            'jurisprudencia'::TEXT as type,
            j.source_url as source,
            ts_rank(to_tsvector('portuguese', j.ementa), plainto_tsquery('portuguese', search_query)) as relevance
        FROM jurisprudencia j
        WHERE 'jurisprudencia' = ANY(content_types)
        AND to_tsvector('portuguese', j.ementa) @@ plainto_tsquery('portuguese', search_query)
    )
    ORDER BY relevance DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

