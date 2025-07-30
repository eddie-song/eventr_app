-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow authenticated users to view avatars (restricted access)
CREATE POLICY "Authenticated users can view avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
); 

-- Create a storage bucket for recommendation images
insert into storage.buckets (id, name, public) values ('recommendations', 'recommendations', false)
  on conflict (id) do nothing;

-- Policy to allow authenticated users to upload their own recommendation images
CREATE POLICY "Users can upload their own recommendation images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'recommendations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to update their own recommendation images
CREATE POLICY "Users can update their own recommendation images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'recommendations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to delete their own recommendation images
CREATE POLICY "Users can delete their own recommendation images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'recommendations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow public read access to recommendation images
CREATE POLICY "Public can view recommendation images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'recommendations'
); 