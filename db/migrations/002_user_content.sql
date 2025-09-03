-- Migration 002: User Content Tables
-- Created: 2025-09-02
-- Description: Create tables for user-generated content (notes, highlights, flashcards, etc.)

-- Notes table (user personal notes)
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    law_id UUID REFERENCES laws(id) ON DELETE SET NULL,
    chunk_id UUID REFERENCES law_chunks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    markdown TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Highlights table (text selections)
CREATE TABLE highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    law_id UUID NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
    range JSONB NOT NULL, -- selection range information
    quote TEXT NOT NULL, -- highlighted text
    color TEXT DEFAULT 'yellow',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decks table (flashcard collections)
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    disciplina TEXT,
    prioridade INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    origin_ref TEXT, -- reference to source (law, sumula, etc.)
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    law_ref TEXT, -- human-readable reference (e.g., "CF/88 art. 5º")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SRS Reviews table (Spaced Repetition System)
CREATE TABLE srs_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    ease INTEGER DEFAULT 250, -- SM-2 ease factor (x100)
    interval_days INTEGER DEFAULT 1,
    due_date DATE DEFAULT CURRENT_DATE,
    last_date DATE,
    lapses INTEGER DEFAULT 0, -- number of times forgotten
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(flashcard_id)
);

-- Questions table (quiz questions)
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    origin TEXT NOT NULL DEFAULT 'own' CHECK (origin IN ('own', 'bank')),
    stem TEXT NOT NULL, -- question text
    options JSONB NOT NULL, -- array of answer options
    answer CHAR(1) NOT NULL CHECK (answer IN ('A', 'B', 'C', 'D', 'E')),
    explanation TEXT,
    tags TEXT[] DEFAULT '{}',
    law_ref TEXT, -- reference to related law
    difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz sets table (collections of questions)
CREATE TABLE quiz_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    filters JSONB, -- criteria for question selection
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts table (user quiz results)
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_set_id UUID REFERENCES quiz_sets(id) ON DELETE SET NULL,
    answers JSONB NOT NULL, -- user answers and question IDs
    score NUMERIC(5,2), -- percentage score
    total_questions INTEGER,
    correct_answers INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER
);

-- Study sessions table (tracking user activity)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('leitura', 'revisao', 'quiz')),
    duration_min INTEGER,
    metadata JSONB, -- additional session data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user content tables
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_law_id ON notes(law_id);
CREATE INDEX idx_notes_tags ON notes USING gin(tags);
CREATE INDEX idx_notes_text_search ON notes USING gin(to_tsvector('portuguese', title || ' ' || markdown));

CREATE INDEX idx_highlights_user_id ON highlights(user_id);
CREATE INDEX idx_highlights_law_id ON highlights(law_id);

CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_decks_disciplina ON decks(disciplina);

CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX idx_flashcards_origin_ref ON flashcards(origin_ref);

CREATE INDEX idx_srs_reviews_flashcard_id ON srs_reviews(flashcard_id);
CREATE INDEX idx_srs_reviews_due_date ON srs_reviews(due_date);

CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_origin ON questions(origin);
CREATE INDEX idx_questions_tags ON questions USING gin(tags);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_set_id ON quiz_attempts(quiz_set_id);
CREATE INDEX idx_quiz_attempts_started_at ON quiz_attempts(started_at);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_kind ON sessions(kind);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);

