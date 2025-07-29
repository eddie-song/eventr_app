# Setting Up People Images Bucket

This guide will help you manually set up the storage bucket for people service images in your Supabase project.

## Prerequisites

- Access to your Supabase project dashboard
- Supabase project with Storage enabled
- Database access to run SQL migrations

## Step 1: Run the Database Migration

First, you need to add the `image_url` column to the `person` table:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL migration:

```sql
-- Migration: Add image_url column to person table
-- This migration adds support for people service images

-- Add image_url column to person table
ALTER TABLE person 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN person.image_url IS 'URL to the service image for this person/service provider';
```

## Step 2: Create the Storage Bucket

1. In your Supabase Dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Configure the bucket with these settings:
   - **Name**: `people-images`
   - **Public bucket**: `false` (private bucket for security)
   - **File size limit**: `5MB` (or your preferred limit)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

## Step 3: Set Up Row Level Security (RLS) Policies

1. In the Storage section, click on the `people-images` bucket
2. Go to the **Policies** tab
3. Add the following policies:

### Policy 1: Users can upload their own people service images
- **Policy name**: `Users can upload their own people service images`
- **Target roles**: `authenticated`
- **Using expression**:
```sql
bucket_id = 'people-images' 
AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 2: Users can update their own people service images
- **Policy name**: `Users can update their own people service images`
- **Target roles**: `authenticated`
- **Using expression**:
```sql
bucket_id = 'people-images' 
AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 3: Users can delete their own people service images
- **Policy name**: `Users can delete their own people service images`
- **Target roles**: `authenticated`
- **Using expression**:
```sql
bucket_id = 'people-images' 
AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 4: Authenticated users can view people service images
- **Policy name**: `Authenticated users can view people service images`
- **Target roles**: `authenticated`
- **Using expression**:
```sql
bucket_id = 'people-images' 
AND auth.role() = 'authenticated'
```

## Step 4: Alternative - Run SQL Setup Script

If you prefer to run the complete setup via SQL, you can execute the provided SQL file:

1. Go to **SQL Editor** in your Supabase Dashboard
2. Copy and paste the contents of `src/schema/setup/people-images-bucket.sql`
3. Execute the script

## Step 5: Test the Setup

1. Create a new people service with an image
2. Verify the image uploads successfully
3. Check that the image displays correctly in the people listing
4. Verify that only authenticated users can access the images

## File Structure

The following files have been created/updated to support people images:

- `src/schema/setup/people-images-bucket.sql` - Storage bucket setup
- `src/schema/migrations/add_image_url_to_person.sql` - Database migration
- `src/services/imageUploadService.js` - Updated with people image functions
- `src/dashboard/components/create.js` - Updated with image upload UI
- `src/dashboard/components/people.js` - Updated to display service images
- `src/services/personService.js` - Updated to handle imageUrl field

## Usage

Once set up, users can:

1. **Upload images** when creating people services
2. **View service images** in the people listing
3. **Images are stored securely** with user-based access control
4. **Automatic signed URLs** are generated for display

## Troubleshooting

### Common Issues:

1. **"Storage bucket not found" error**
   - Ensure the bucket name is exactly `people-images`
   - Check that the bucket was created successfully

2. **"Row-level security policy" error**
   - Verify all RLS policies are correctly configured
   - Check that the bucket is private (not public)

3. **"Permission denied" error**
   - Ensure the user is authenticated
   - Check that the RLS policies are active

4. **Images not displaying**
   - Check that the `image_url` column was added to the `person` table
   - Verify the image URLs are being stored correctly

### Verification Commands:

```sql
-- Check if image_url column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'person' AND column_name = 'image_url';

-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'people-images';

-- Check RLS policies
SELECT * FROM storage.policies WHERE bucket_id = 'people-images';
```

## Security Notes

- The bucket is private by default for security
- Images are organized by user ID in folders
- Only authenticated users can access images
- Users can only manage their own images
- Signed URLs expire after 1 year for uploads, 1 hour for display

## Next Steps

After setting up the bucket, you may want to:

1. Add image optimization features
2. Implement image resizing
3. Add support for multiple images per service
4. Create image moderation features
5. Add image compression options