-- Supabase schema for Irongate

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Gyms table
CREATE TABLE IF NOT EXISTS gyms (
  id text PRIMARY KEY,
  name text NOT NULL,
  referral_code text UNIQUE NOT NULL,
  location text,
  description text
);

-- Profiles table linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  avatar text,
  rank_title text,
  schedule jsonb,
  workout_plan jsonb,
  gym_id text REFERENCES gyms(id),
  xp int DEFAULT 0,
  level int DEFAULT 1,
  streak int DEFAULT 0,
  longest_streak int DEFAULT 0,
  check_ins int DEFAULT 0,
  challenges_completed int DEFAULT 0,
  attendance_history jsonb DEFAULT '{}'::jsonb,
  achievements jsonb DEFAULT '[]'::jsonb,
  last_checkin_date date
);

-- Checkins table to track start/complete events and verification
CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id text REFERENCES gyms(id),
  start_at timestamptz,
  start_lat double precision,
  start_lng double precision,
  nonce text,
  complete_at timestamptz,
  complete_lat double precision,
  complete_lng double precision,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Seed gyms
INSERT INTO gyms (id, name, referral_code, location, description) VALUES
('gym-1', 'Iron Gate Fitness', 'IRONGATE', 'Lagos Central', 'Premium strength and conditioning gym with dedicated coaching.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO gyms (id, name, referral_code, location, description) VALUES
('gym-2', 'Shadow Vault Gym', 'SHADOW', 'Victoria Island', 'High-intensity training for elite athletes and ambition-driven warriors.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO gyms (id, name, referral_code, location, description) VALUES
('gym-3', 'Titan Forge Club', 'TITAN', 'Lekki', 'Modern facility with powerlifting, cardio, and recovery zones.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO gyms (id, name, referral_code, location, description) VALUES
('gym-4', 'Apex Strength Hub', 'APEX', 'Ikeja', 'Community-focused gym built for goal crushers and grind-minded members.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO gyms (id, name, referral_code, location, description) VALUES
('gym-5', 'Vanguard Fitness House', 'VANGUARD', 'Surulere', 'Balanced training space for strength, endurance, and mobility.')
ON CONFLICT (id) DO NOTHING;
