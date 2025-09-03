-- =====================================================
-- ESTUDAR.PRO - SETUP COMPLETO DO BANCO DE DADOS
-- Execute este arquivo no SQL Editor do Supabase
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de usuários (estende auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    stats JSONB DEFAULT '{}'::jsonb
);

-- Tabela de fontes de documentos legais
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('law', 'code', 'constitution', 'sumula', 'jurisprudence')),
    url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de leis e artigos
CREATE TABLE IF NOT EXISTS laws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    number TEXT,
    article TEXT,
    paragraph TEXT,
    inciso TEXT,
    alinea TEXT,
    content TEXT NOT NULL,
    hierarchy_level INTEGER DEFAULT 0,
    parent_id UUID REFERENCES laws(id),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de chunks para busca vetorial
CREATE TABLE IF NOT EXISTS law_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_id UUID REFERENCES laws(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de súmulas
CREATE TABLE IF NOT EXISTS sumulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    court TEXT NOT NULL CHECK (court IN ('STF', 'STJ', 'TST', 'TSE')),
    type TEXT DEFAULT 'regular' CHECK (type IN ('regular', 'vinculante')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de enunciados
CREATE TABLE IF NOT EXISTS enunciados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    organ TEXT NOT NULL,
    event TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de jurisprudência
CREATE TABLE IF NOT EXISTS juris (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court TEXT NOT NULL,
    case_number TEXT,
    date DATE,
    summary TEXT,
    content TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELAS DE USUÁRIO
-- =====================================================

-- Tabela de notas pessoais
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    law_id UUID REFERENCES laws(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de destaques
CREATE TABLE IF NOT EXISTS highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    law_id UUID REFERENCES laws(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    color TEXT DEFAULT 'yellow',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de decks de flashcards
CREATE TABLE IF NOT EXISTS decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de flashcards
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    type TEXT DEFAULT 'basic' CHECK (type IN ('basic', 'cloze')),
    tags TEXT[],
    difficulty INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de revisões SRS
CREATE TABLE IF NOT EXISTS srs_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quality INTEGER NOT NULL CHECK (quality BETWEEN 0 AND 5),
    easiness FLOAT DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    repetition INTEGER DEFAULT 0,
    next_review TIMESTAMPTZ NOT NULL,
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de questões
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'true_false')),
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    subject TEXT,
    tags TEXT[],
    source_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de conjuntos de quiz
CREATE TABLE IF NOT EXISTS quiz_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    question_ids UUID[],
    time_limit INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tentativas de quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_set_id UUID REFERENCES quiz_sets(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    time_taken INTEGER,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de sessões de estudo
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('flashcard', 'quiz', 'reading')),
    duration INTEGER,
    items_studied INTEGER DEFAULT 0,
    performance JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- Tabela de importações
CREATE TABLE IF NOT EXISTS imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    source_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    progress INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    run_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Tabela de citações
CREATE TABLE IF NOT EXISTS citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kind TEXT NOT NULL CHECK (kind IN ('law', 'sumula', 'jurisprudence')),
    ref TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_laws_source_id ON laws(source_id);
CREATE INDEX IF NOT EXISTS idx_laws_parent_id ON laws(parent_id);
CREATE INDEX IF NOT EXISTS idx_laws_content_fts ON laws USING gin(to_tsvector('portuguese', content));
CREATE INDEX IF NOT EXISTS idx_law_chunks_law_id ON law_chunks(law_id);
CREATE INDEX IF NOT EXISTS idx_law_chunks_embedding ON law_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_sumulas_court ON sumulas(court);
CREATE INDEX IF NOT EXISTS idx_sumulas_number ON sumulas(number);
CREATE INDEX IF NOT EXISTS idx_juris_court ON juris(court);
CREATE INDEX IF NOT EXISTS idx_juris_date ON juris(date);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_law_id ON notes(law_id);
CREATE INDEX IF NOT EXISTS idx_highlights_user_id ON highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_srs_reviews_user_id ON srs_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_srs_reviews_next_review ON srs_reviews(next_review);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);
CREATE INDEX IF NOT EXISTS idx_imports_status ON imports(status);
CREATE INDEX IF NOT EXISTS idx_imports_run_at ON imports(run_at);
CREATE INDEX IF NOT EXISTS idx_citations_kind ON citations(kind);
CREATE INDEX IF NOT EXISTS idx_citations_ref ON citations(ref);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE laws ENABLE ROW LEVEL SECURITY;
ALTER TABLE law_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sumulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE enunciados ENABLE ROW LEVEL SECURITY;
ALTER TABLE juris ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

-- Políticas para conteúdo público (leis, súmulas, etc.)
CREATE POLICY "Public content is readable by all users" ON laws FOR SELECT USING (true);
CREATE POLICY "Public content is readable by all users" ON law_chunks FOR SELECT USING (true);
CREATE POLICY "Public content is readable by all users" ON sumulas FOR SELECT USING (true);
CREATE POLICY "Public content is readable by all users" ON enunciados FOR SELECT USING (true);
CREATE POLICY "Public content is readable by all users" ON juris FOR SELECT USING (true);
CREATE POLICY "Public content is readable by all users" ON citations FOR SELECT USING (true);

-- Políticas para modificação apenas por admins
CREATE POLICY "Only admins can modify laws" ON laws FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Only admins can modify law_chunks" ON law_chunks FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Only admins can modify sumulas" ON sumulas FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Only admins can modify enunciados" ON enunciados FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Only admins can modify juris" ON juris FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Políticas para conteúdo do usuário
CREATE POLICY "Users can manage their own highlights" ON highlights FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own decks" ON decks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own flashcards" ON flashcards FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own reviews" ON srs_reviews FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own quiz attempts" ON quiz_attempts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own sessions" ON sessions FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- FUNÇÕES PARA BUSCA E SRS
-- =====================================================

-- Função para busca híbrida (full-text + vetorial)
CREATE OR REPLACE FUNCTION hybrid_search(
    query_text TEXT,
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.78,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    law_id UUID,
    content TEXT,
    similarity FLOAT,
    law_title TEXT,
    law_article TEXT
) 
LANGUAGE SQL STABLE
AS $$
    WITH semantic_search AS (
        SELECT 
            lc.id,
            lc.law_id,
            lc.content,
            1 - (lc.embedding <=> query_embedding) AS similarity
        FROM law_chunks lc
        WHERE 1 - (lc.embedding <=> query_embedding) > match_threshold
        ORDER BY lc.embedding <=> query_embedding
        LIMIT match_count
    ),
    keyword_search AS (
        SELECT 
            lc.id,
            lc.law_id,
            lc.content,
            ts_rank_cd(to_tsvector('portuguese', lc.content), plainto_tsquery('portuguese', query_text)) AS similarity
        FROM law_chunks lc
        WHERE to_tsvector('portuguese', lc.content) @@ plainto_tsquery('portuguese', query_text)
        ORDER BY similarity DESC
        LIMIT match_count
    )
    SELECT 
        COALESCE(s.id, k.id) AS id,
        COALESCE(s.law_id, k.law_id) AS law_id,
        COALESCE(s.content, k.content) AS content,
        COALESCE(s.similarity, k.similarity * 0.5) AS similarity,
        l.title AS law_title,
        l.article AS law_article
    FROM semantic_search s
    FULL OUTER JOIN keyword_search k ON s.id = k.id
    JOIN laws l ON l.id = COALESCE(s.law_id, k.law_id)
    ORDER BY similarity DESC
    LIMIT match_count;
$$;

-- Função para calcular próxima revisão SRS
CREATE OR REPLACE FUNCTION calculate_next_review(
    quality INTEGER,
    easiness FLOAT,
    interval_days INTEGER,
    repetition INTEGER
)
RETURNS TABLE (
    new_easiness FLOAT,
    new_interval INTEGER,
    new_repetition INTEGER,
    next_review_date TIMESTAMPTZ
)
LANGUAGE SQL IMMUTABLE
AS $$
    WITH srs_calc AS (
        SELECT 
            CASE 
                WHEN quality < 3 THEN 
                    GREATEST(1.3, easiness - 0.8 + 0.28 * quality - 0.02 * quality * quality)
                ELSE 
                    easiness - 0.8 + 0.28 * quality - 0.02 * quality * quality
            END AS calc_easiness,
            CASE 
                WHEN quality < 3 THEN 0
                ELSE repetition + 1
            END AS calc_repetition
    )
    SELECT 
        calc_easiness,
        CASE 
            WHEN quality < 3 THEN 1
            WHEN calc_repetition = 1 THEN 1
            WHEN calc_repetition = 2 THEN 6
            ELSE ROUND(interval_days * calc_easiness)::INTEGER
        END AS calc_interval,
        calc_repetition,
        NOW() + (
            CASE 
                WHEN quality < 3 THEN 1
                WHEN calc_repetition = 1 THEN 1
                WHEN calc_repetition = 2 THEN 6
                ELSE ROUND(interval_days * calc_easiness)::INTEGER
            END || ' days'
        )::INTERVAL
    FROM srs_calc;
$$;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir fonte da Constituição Federal
INSERT INTO sources (id, name, type, description) VALUES 
(uuid_generate_v4(), 'Constituição Federal de 1988', 'constitution', 'Constituição da República Federativa do Brasil de 1988')
ON CONFLICT DO NOTHING;

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_laws_updated_at BEFORE UPDATE ON laws FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sumulas_updated_at BEFORE UPDATE ON sumulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enunciados_updated_at BEFORE UPDATE ON enunciados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_juris_updated_at BEFORE UPDATE ON juris FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON flashcards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_sets_updated_at BEFORE UPDATE ON quiz_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SETUP COMPLETO!
-- =====================================================

