-- Create storage bucket for people service images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('people-images', 'people-images', false)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload their own people service images
CREATE POLICY "Users can upload their own people service images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'people-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to update their own people service images
CREATE POLICY "Users can update their own people service images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'people-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to delete their own people service images
CREATE POLICY "Users can delete their own people service images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'people-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow authenticated users to view people service images
CREATE POLICY "Authenticated users can view people service images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'people-images' 
  AND auth.role() = 'authenticated'
);