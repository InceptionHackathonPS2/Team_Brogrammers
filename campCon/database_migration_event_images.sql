-- Migration: Add Image Support to Events
-- Run this to add image_url fields to events table

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

