-- Função para busca semântica por similaridade de embeddings
CREATE OR REPLACE FUNCTION search_chunks_by_similarity(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  law_id uuid,
  similarity float,
  law_title text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lc.id,
    lc.content,
    lc.law_id,
    (lc.embedding <=> query_embedding) * -1 + 1 AS similarity,
    l.title AS law_title
  FROM law_chunks lc
  LEFT JOIN laws l ON lc.law_id = l.id
  WHERE lc.embedding IS NOT NULL
    AND (lc.embedding <=> query_embedding) * -1 + 1 > match_threshold
  ORDER BY lc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Função alternativa usando produto escalar
CREATE OR REPLACE FUNCTION search_chunks_by_similarity_dot(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  law_id uuid,
  similarity float,
  law_title text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lc.id,
    lc.content,
    lc.law_id,
    (lc.embedding <#> query_embedding) * -1 AS similarity,
    l.title AS law_title
  FROM law_chunks lc
  LEFT JOIN laws l ON lc.law_id = l.id
  WHERE lc.embedding IS NOT NULL
    AND (lc.embedding <#> query_embedding) * -1 > match_threshold
  ORDER BY lc.embedding <#> query_embedding DESC
  LIMIT match_count;
END;
$$;

-- Função para busca híbrida (semântica + textual)
CREATE OR REPLACE FUNCTION hybrid_search_chunks(
  query_text text,
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  law_id uuid,
  similarity float,
  law_title text,
  search_type text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Busca semântica
  SELECT
    lc.id,
    lc.content,
    lc.law_id,
    (lc.embedding <=> query_embedding) * -1 + 1 AS similarity,
    l.title AS law_title,
    'semantic'::text AS search_type
  FROM law_chunks lc
  LEFT JOIN laws l ON lc.law_id = l.id
  WHERE lc.embedding IS NOT NULL
    AND (lc.embedding <=> query_embedding) * -1 + 1 > match_threshold
  
  UNION ALL
  
  -- Busca textual
  SELECT
    lc.id,
    lc.content,
    lc.law_id,
    0.8::float AS similarity,
    l.title AS law_title,
    'textual'::text AS search_type
  FROM law_chunks lc
  LEFT JOIN laws l ON lc.law_id = l.id
  WHERE lc.content ILIKE '%' || query_text || '%'
    AND (lc.embedding IS NULL OR (lc.embedding <=> query_embedding) * -1 + 1 <= match_threshold)
  
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

