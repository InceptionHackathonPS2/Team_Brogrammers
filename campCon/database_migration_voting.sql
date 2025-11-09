-- Migration: Add Voting and Threaded Comments
-- Run this AFTER running the main database_schema.sql
-- This adds voting tables and updates comment tables for threading

-- ============================================
-- UPDATE EXISTING COMMENT TABLES
-- ============================================

-- Add parent_id to project_comments for threading
ALTER TABLE project_comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES project_comments(id) ON DELETE CASCADE;

-- Add parent_id to event_comments for threading
ALTER TABLE event_comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES event_comments(id) ON DELETE CASCADE;

-- ============================================
-- CREATE VOTING TABLES
-- ============================================

-- Project votes (upvotes/downvotes)
CREATE TABLE IF NOT EXISTS project_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Event votes (upvotes/downvotes)
CREATE TABLE IF NOT EXISTS event_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ============================================
-- ADD INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_project_comments_parent ON project_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_project_votes_project ON project_votes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_votes_user ON project_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_event_comments_parent ON event_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_event_votes_event ON event_votes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_votes_user ON event_votes(user_id);

