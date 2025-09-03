-- Migration 003: Imports, Citations and Row Level Security
-- Created: 2025-09-02
-- Description: Create tables for imports, citations and configure RLS policies

-- Imports table (ETL job tracking)
CREATE TABLE imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('scrape', 'lexml', 'upload')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    stats JSONB DEFAULT '{}',
    run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Citations table (for Q&A references)
CREATE TABLE citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kind TEXT NOT NULL CHECK (kind IN ('law', 'sumula', 'enunciado', 'juri')),
    ref TEXT NOT NULL, -- human-readable reference
    url TEXT,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for imports and citations
CREATE INDEX idx_imports_source_id ON imports(source_id);
CREATE INDEX idx_imports_status ON imports(status);
CREATE INDEX idx_imports_run_at ON imports(run_at);
CREATE INDEX idx_citations_kind ON citations(kind);
CREATE INDEX idx_citations_ref ON citations(ref);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies for public content (read-only for all users)
CREATE POLICY "Public content is readable by all users" ON sources
    FOR SELECT USING (true);

CREATE POLICY "Public content is readable by all users" ON laws
    FOR SELECT USING (true);

CREATE POLICY "Public content is readable by all users" ON law_chunks
    FOR SELECT USING (true);

CREATE POLICY "Public content is readable by all users" ON sumulas
    FOR SELECT USING (true);

CREATE POLICY "Public content is readable by all users" ON enunciados
    FOR SELECT USING (true);

CREATE POLICY "Public content is readable by all users" ON juris
    FOR SELECT USING (true);

CREATE POLICY "Public content is readable by all users" ON citations
    FOR SELECT USING (true);

-- RLS Policies for admin-only content modification
CREATE POLICY "Only admins can modify sources" ON sources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify laws" ON laws
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify law_chunks" ON law_chunks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify sumulas" ON sumulas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify enunciados" ON enunciados
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify juris" ON juris
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for user-specific content
CREATE POLICY "Users can manage their own notes" ON notes
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own highlights" ON highlights
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own decks" ON decks
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own flashcards" ON flashcards
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own srs_reviews" ON srs_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM flashcards 
            WHERE flashcards.id = srs_reviews.flashcard_id 
            AND flashcards.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own questions" ON questions
    FOR ALL USING (user_id = auth.uid() OR origin = 'bank');

CREATE POLICY "Users can view quiz_sets" ON quiz_sets
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage quiz_sets" ON quiz_sets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can manage their own quiz_attempts" ON quiz_attempts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own sessions" ON sessions
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for imports (admin only)
CREATE POLICY "Only admins can manage imports" ON imports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON flashcards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_srs_reviews_updated_at BEFORE UPDATE ON srs_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

