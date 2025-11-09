# Project Images Setup Guide

## Overview
Projects now support image uploads and display. Images can be uploaded via file upload or by providing a URL.

## Database Setup

### Option 1: Fresh Install
If you haven't run `database_schema.sql` yet, just run it - it already includes the image fields.

### Option 2: Existing Database
If you already have the `projects` table, run this SQL to add image support:

```sql
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
```

Or run `database_migration_project_images.sql`.

## Image Storage Options

### Option 1: Supabase Storage (Recommended)
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `project-images`
3. Set the bucket to **Public**
4. Configure policies to allow uploads:
   - Go to Storage → Policies
   - Create policy: "Allow authenticated users to upload"
   - Create policy: "Allow public to read"

### Option 2: Direct URL
You can also use image URLs directly without uploading to Supabase storage. Just paste the image URL in the form.

## Features

### 1. Image Upload in Project Creation
- Upload image file (JPG, PNG, etc.)
- Or paste image URL
- Preview before submitting

### 2. Image Display
- Images show on project cards
- Full-size images in project detail view
- Support for multiple images (image_urls array)

### 3. Project Detail View
- Click on any project card to open detailed view
- Shows all project attributes:
  - Title and description
  - Tags and required skills
  - Team members
  - GitHub repository link
  - Project images
  - Created date and status

### 4. GitHub Repository Link
- Displays GitHub link on project card
- Clickable link in project detail view
- Opens in new tab

## Usage

### Creating a Project with Image
1. Click "New Project"
2. Fill in project details
3. Upload an image file or paste image URL
4. Click "Create Project"

### Viewing Project Details
1. Click on any project card
2. View all project information
3. Click GitHub link to open repository
4. Close modal to return to projects list

## Troubleshooting

### Images Not Showing
- Check if image URL is valid
- For Supabase storage, ensure bucket is public
- Check browser console for errors

### Upload Failing
- Ensure Supabase storage bucket exists
- Check storage policies allow uploads
- Fallback: Use direct image URL instead

### GitHub Link Not Showing
- Ensure repo_link is saved in `project_private_data` table
- Check project detail view for the link

