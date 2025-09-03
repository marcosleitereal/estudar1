-- Migration 004: Vector Search Functions
-- Created: 2025-09-02
-- Description: Create SQL functions for vector similarity search and other utilities

-- Function to search law chunks by vector similarity
CREATE OR REPLACE FUNCTION search_law_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  law_id uuid,
  ref text,
  content text,
  similarity float,
  law_ref text,
  source_title text,
  source_org text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lc.id,
    lc.law_id,
    lc.ref,
    lc.content,
    1 - (lc.embedding <=> query_embedding) AS similarity,
    l.ref AS law_ref,
    s.title AS source_title,
    s.org AS source_org
  FROM law_chunks lc
  JOIN laws l ON l.id = lc.law_id
  JOIN sources s ON s.id = l.source_id
  WHERE 1 - (lc.embedding <=> query_embedding) > match_threshold
  ORDER BY lc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to search súmulas by vector similarity
CREATE OR REPLACE FUNCTION search_sumulas(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  tribunal text,
  numero integer,
  texto text,
  similarity float,
  fonte_url text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.tribunal,
    s.numero,
    s.texto,
    1 - (s.embedding <=> query_embedding) AS similarity,
    s.fonte_url
  FROM sumulas s
  WHERE s.embedding IS NOT NULL
    AND 1 - (s.embedding <=> query_embedding) > match_threshold
  ORDER BY s.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to search enunciados by vector similarity
CREATE OR REPLACE FUNCTION search_enunciados(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  org text,
  numero integer,
  texto text,
  similarity float,
  fonte_url text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.org,
    e.numero,
    e.texto,
    1 - (e.embedding <=> query_embedding) AS similarity,
    e.fonte_url
  FROM enunciados e
  WHERE e.embedding IS NOT NULL
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to search jurisprudência by vector similarity
CREATE OR REPLACE FUNCTION search_juris(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  tribunal text,
  classe text,
  numero text,
  relator text,
  data_julg date,
  ementa text,
  similarity float,
  fonte_url text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.tribunal,
    j.classe,
    j.numero,
    j.relator,
    j.data_julg,
    j.ementa,
    1 - (j.embedding <=> query_embedding) AS similarity,
    j.fonte_url
  FROM juris j
  WHERE j.embedding IS NOT NULL
    AND 1 - (j.embedding <=> query_embedding) > match_threshold
  ORDER BY j.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get flashcards due for review
CREATE OR REPLACE FUNCTION get_due_flashcards(
  user_uuid uuid,
  review_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  flashcard_id uuid,
  front text,
  back text,
  law_ref text,
  deck_name text,
  ease integer,
  interval_days integer,
  due_date date,
  lapses integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id AS flashcard_id,
    f.front,
    f.back,
    f.law_ref,
    d.name AS deck_name,
    sr.ease,
    sr.interval_days,
    sr.due_date,
    sr.lapses
  FROM flashcards f
  JOIN decks d ON d.id = f.deck_id
  JOIN srs_reviews sr ON sr.flashcard_id = f.id
  WHERE f.user_id = user_uuid
    AND sr.due_date <= review_date
  ORDER BY sr.due_date ASC, d.prioridade DESC;
END;
$$;

-- Function to update SRS review (SM-2 algorithm)
CREATE OR REPLACE FUNCTION update_srs_review(
  flashcard_uuid uuid,
  quality integer -- 0-3 (0=wrong, 1=hard, 2=good, 3=easy)
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_ease integer;
  current_interval integer;
  current_lapses integer;
  new_ease integer;
  new_interval integer;
  new_lapses integer;
  new_due_date date;
BEGIN
  -- Get current SRS data
  SELECT ease, interval_days, lapses
  INTO current_ease, current_interval, current_lapses
  FROM srs_reviews
  WHERE flashcard_id = flashcard_uuid;

  -- Calculate new values based on SM-2 algorithm
  IF quality < 2 THEN
    -- Wrong answer: reset interval, increase lapses
    new_interval := 1;
    new_lapses := current_lapses + 1;
    new_ease := GREATEST(130, current_ease - 20);
  ELSE
    -- Correct answer: increase interval based on ease
    new_lapses := current_lapses;
    
    IF current_interval = 1 THEN
      new_interval := 6;
    ELSIF current_interval = 6 THEN
      new_interval := 6;
    ELSE
      new_interval := ROUND(current_interval * (current_ease / 100.0));
    END IF;
    
    -- Adjust ease based on quality
    CASE quality
      WHEN 2 THEN new_ease := current_ease; -- Good: no change
      WHEN 3 THEN new_ease := current_ease + 15; -- Easy: increase ease
    END CASE;
    
    -- Clamp ease between 130 and 250
    new_ease := GREATEST(130, LEAST(250, new_ease));
  END IF;

  new_due_date := CURRENT_DATE + new_interval;

  -- Update SRS review
  UPDATE srs_reviews
  SET
    ease = new_ease,
    interval_days = new_interval,
    due_date = new_due_date,
    last_date = CURRENT_DATE,
    lapses = new_lapses,
    updated_at = NOW()
  WHERE flashcard_id = flashcard_uuid;
END;
$$;

-- Function to execute raw SQL (for migrations)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid uuid)
RETURNS TABLE (
  total_flashcards bigint,
  due_flashcards bigint,
  total_notes bigint,
  total_highlights bigint,
  quiz_attempts bigint,
  avg_quiz_score numeric,
  study_streak integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM flashcards WHERE user_id = user_uuid) AS total_flashcards,
    (SELECT COUNT(*) FROM srs_reviews sr 
     JOIN flashcards f ON f.id = sr.flashcard_id 
     WHERE f.user_id = user_uuid AND sr.due_date <= CURRENT_DATE) AS due_flashcards,
    (SELECT COUNT(*) FROM notes WHERE user_id = user_uuid) AS total_notes,
    (SELECT COUNT(*) FROM highlights WHERE user_id = user_uuid) AS total_highlights,
    (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = user_uuid) AS quiz_attempts,
    (SELECT AVG(score) FROM quiz_attempts WHERE user_id = user_uuid) AS avg_quiz_score,
    0 AS study_streak; -- TODO: implement streak calculation
END;
$$;

