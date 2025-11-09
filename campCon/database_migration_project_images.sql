-- Migration: Add Image Support to Projects
-- Run this to add image_url field to projects table

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Also add image_urls (array) if you want multiple images
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

