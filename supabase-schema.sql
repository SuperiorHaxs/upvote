-- UpVote Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_vote_date DATE,
  total_votes INTEGER DEFAULT 0,
  judge_score INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0
);

-- Arguments table
CREATE TABLE IF NOT EXISTS arguments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  my_take TEXT NOT NULL,
  their_take TEXT NOT NULL,
  category TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '72 hours'),
  my_votes INTEGER DEFAULT 0,
  their_votes INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  is_closed BOOLEAN DEFAULT false,
  winner TEXT CHECK (winner IN ('my', 'their'))
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  argument_id UUID NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('my', 'their')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, argument_id)
);

-- Upvotes table
CREATE TABLE IF NOT EXISTS upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  argument_id UUID NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, argument_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  argument_id UUID NOT NULL REFERENCES arguments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streak logs table
CREATE TABLE IF NOT EXISTS streak_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  votes_count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Row Level Security Policies

-- Profiles: Users can read all, update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Arguments: Anyone can read, authenticated users can create
ALTER TABLE arguments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Arguments are viewable by everyone"
  ON arguments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create arguments"
  ON arguments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own arguments"
  ON arguments FOR UPDATE
  USING (auth.uid() = user_id);

-- Also allow anonymous arguments (no user_id required)
CREATE POLICY "Allow anonymous argument inserts"
  ON arguments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow argument updates"
  ON arguments FOR UPDATE
  USING (true);

-- Votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Upvotes
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Upvotes are viewable by everyone"
  ON upvotes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upvote"
  ON upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (true);

-- Streak logs
ALTER TABLE streak_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak logs"
  ON streak_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak logs"
  ON streak_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sample data (run after schema is created)
INSERT INTO arguments (title, my_take, their_take, category, my_votes, their_votes, upvote_count, is_anonymous)
VALUES
  ('My girlfriend says I spend too much time gaming',
   'Gaming is my hobby and stress relief after work. I only play 2-3 hours in the evening, which is reasonable. I always make time for our date nights and weekends together.',
   'We barely spend quality time together anymore. When I come home from work, you''re already in front of the screen. A few hours a day adds up to a lot of missed time.',
   'Relationships', 156, 203, 89, true),

  ('My roommate thinks it''s okay to eat my labeled food',
   'If food is labeled with someone''s name, it''s off limits. Period. I specifically label my groceries because I meal prep for the week.',
   'We''ve been roommates for years and used to share everything. If something''s about to expire, it''s wasteful to let it go bad.',
   'Roommates', 412, 67, 234, true),

  ('My friend says a hot dog IS a sandwich',
   'A hot dog is its own distinct food category. The bun is connected on one side, making it structurally different from a sandwich.',
   'A sandwich is any food where the filling is between bread. Hot dogs have bread on the outside and meat in the middle.',
   'Food', 187, 245, 156, true),

  ('My coworker says replying OK to emails is rude',
   'Email is for efficiency. If I understood and agree, OK conveys that perfectly. Not every message needs a paragraph response.',
   'Professional communication requires effort. OK feels dismissive. A simple Thanks for letting me know shows basic respect.',
   'Work', 298, 312, 178, true),

  ('My mom thinks I should call her every single day',
   'I''m an adult with a busy life. Weekly calls are reasonable and give us more to talk about. Quality over quantity.',
   'A quick call only takes 5 minutes. It''s about staying connected. I worry when I don''t hear from you.',
   'Family', 267, 198, 145, true),

  ('My friend says splitting the bill evenly is fair even if I ordered less',
   'If I ordered a salad and water while you got steak and cocktails, why should I subsidize your meal? Venmo exists.',
   'We''re friends going out to have a good time, not accountants. Splitting evenly keeps things simple.',
   'Money', 378, 156, 203, true),

  ('My teammate says camping in FPS games is a legitimate strategy',
   'Camping ruins the game for everyone. It''s boring to play against and boring to do. Go play a tower defense game.',
   'Holding angles and controlling areas is literally military tactics. Adapt or stay mad.',
   'Gaming', 234, 289, 167, true),

  ('My friend says water is wet',
   'Water makes other things wet but isn''t wet itself. Wetness is the state of being covered in water.',
   'Each water molecule is surrounded by other water molecules. Water is literally the wettest thing possible.',
   'Random', 342, 387, 456, true),

  ('My partner says keeping score in arguments is toxic',
   'I''m not keeping score - I''m remembering patterns. That''s called having a memory.',
   'Each disagreement should be resolved on its own merits. Bringing up past arguments creates a hostile environment.',
   'Relationships', 198, 267, 134, true),

  ('My coworker says cereal is a soup',
   'Cereal is cereal. Soup is made by cooking ingredients in liquid. The process and cultural context are completely different.',
   'Soup is a dish made by combining solid food with liquid. Cereal with milk fits this definition perfectly.',
   'Food', 156, 234, 189, true);
