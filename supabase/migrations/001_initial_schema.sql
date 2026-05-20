CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- profiles extends auth.users
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stories (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL DEFAULT 'Untitled',
  genre            TEXT NOT NULL,
  tone             TEXT NOT NULL,
  reading_age      TEXT NOT NULL,
  protagonist      TEXT NOT NULL,
  setting          TEXT NOT NULL,
  chapter_count    INT  NOT NULL CHECK (chapter_count BETWEEN 3 AND 10),
  status           TEXT NOT NULL DEFAULT 'pending',
  story_bible      JSONB,
  cover_image_url  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chapters (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id       UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_number INT  NOT NULL,
  title          TEXT,
  content        TEXT,
  image_url      TEXT,
  audio_url      TEXT,
  status         TEXT NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (story_id, chapter_number)
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_all_own_stories" ON stories FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_read_own_chapters" ON chapters FOR SELECT
  USING (story_id IN (SELECT id FROM stories WHERE user_id = auth.uid()));

-- Service role bypasses RLS for chapter writes from backend
CREATE POLICY "service_role_all_chapters" ON chapters FOR ALL USING (true);

-- Auto-update stories.updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
