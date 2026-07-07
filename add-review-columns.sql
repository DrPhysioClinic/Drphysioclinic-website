ALTER TABLE testimonials
ADD COLUMN google_review_id text UNIQUE,
ADD COLUMN review_created_at timestamptz,
ADD COLUMN review_updated_at timestamptz,
ADD COLUMN source text DEFAULT 'manual';
