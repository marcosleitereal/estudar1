-- Migration 001: Initial Schema
-- Created: 2025-09-02
-- Description: Create initial tables for Estudar.Pro platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sources table (for legal documents)
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kind TEXT NOT NULL CHECK (kind IN ('constituição', 'código', 'lei', 'súmula', 'enunciado', 'jurisprudência', 'doutrina', 'nota')),
    title TEXT NOT NULL,
    org TEXT NOT NULL,
    year INTEGER,
    url TEXT,
    version_label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Laws table (for legal articles and paragraphs)
CREATE TABLE laws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    ref TEXT NOT NULL, -- e.g., "CF/88 art. 25 §3º"
    hierarchy JSONB, -- hierarchical structure (Título/Capítulo/Seção/Artigo/§/Inciso)
    text_html TEXT,
    text_plain TEXT NOT NULL,
    effective_from DATE,
    effective_to DATE,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Law chunks for RAG (vector search)
CREATE TABLE law_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_id UUID NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
    ref TEXT NOT NULL,
    content TEXT NOT NULL,
    tokens INTEGER,
    embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
    meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Súmulas table
CREATE TABLE sumulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tribunal TEXT NOT NULL CHECK (tribunal IN ('STF', 'STJ', 'TST', 'TCU', 'TRF1', 'TRF2', 'TRF3', 'TRF4', 'TRF5')),
    numero INTEGER NOT NULL,
    texto TEXT NOT NULL,
    fonte_url TEXT,
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tribunal, numero)
);

-- Enunciados table
CREATE TABLE enunciados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org TEXT NOT NULL, -- TST, CJF, etc.
    numero INTEGER NOT NULL,
    texto TEXT NOT NULL,
    fonte_url TEXT,
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org, numero)
);

-- Jurisprudência table
CREATE TABLE juris (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tribunal TEXT NOT NULL,
    classe TEXT, -- e.g., "RE", "AgR", "HC"
    numero TEXT,
    relator TEXT,
    data_julg DATE,
    ementa TEXT NOT NULL,
    fonte_url TEXT,
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sources_kind ON sources(kind);
CREATE INDEX idx_sources_org ON sources(org);
CREATE INDEX idx_laws_source_id ON laws(source_id);
CREATE INDEX idx_laws_ref ON laws(ref);
CREATE INDEX idx_laws_is_current ON laws(is_current);
CREATE INDEX idx_law_chunks_law_id ON law_chunks(law_id);
CREATE INDEX idx_law_chunks_ref ON law_chunks(ref);
CREATE INDEX idx_sumulas_tribunal ON sumulas(tribunal);
CREATE INDEX idx_sumulas_numero ON sumulas(numero);
CREATE INDEX idx_enunciados_org ON enunciados(org);
CREATE INDEX idx_juris_tribunal ON juris(tribunal);
CREATE INDEX idx_juris_data_julg ON juris(data_julg);

-- Vector similarity search indexes
CREATE INDEX idx_law_chunks_embedding ON law_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_sumulas_embedding ON sumulas USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_enunciados_embedding ON enunciados USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_juris_embedding ON juris USING ivfflat (embedding vector_cosine_ops);

-- Full-text search indexes for Portuguese
CREATE INDEX idx_laws_text_search ON laws USING gin(to_tsvector('portuguese', text_plain));
CREATE INDEX idx_sumulas_text_search ON sumulas USING gin(to_tsvector('portuguese', texto));
CREATE INDEX idx_enunciados_text_search ON enunciados USING gin(to_tsvector('portuguese', texto));
CREATE INDEX idx_juris_text_search ON juris USING gin(to_tsvector('portuguese', ementa));

