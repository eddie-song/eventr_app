-- Create business-location-images storage bucket
-- This bucket stores images for business locations

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-location-images',
  'business-location-images',
  false, -- private bucket
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security for the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload business location images
CREATE POLICY "Allow authenticated users to upload business location images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-location-images' 
    AND auth.role() = 'authenticated'
  );

-- Policy to allow authenticated users to view business location images
CREATE POLICY "Allow authenticated users to view business location images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'business-location-images' 
    AND auth.role() = 'authenticated'
  );

-- Policy to allow users to update their own business location images
CREATE POLICY "Allow users to update their own business location images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'business-location-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy to allow users to delete their own business location images
CREATE POLICY "Allow users to delete their own business location images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'business-location-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Grant necessary permissions to authenticated users
GRANT ALL ON storage.objects TO authenticated; 