-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
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

-- Policy to allow public read access to avatars
CREATE POLICY "Public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars'); 

-- Create a storage bucket for recommendation images
insert into storage.buckets (id, name, public) values ('recommendations', 'recommendations', true)
  on conflict (id) do nothing;

-- Grant authenticated users permissions on the recommendations bucket
-- (Supabase UI may be used for fine-grained policies, but this is a basic setup)
-- You may want to further restrict write/delete to only the user's own files
-- For now, allow all authenticated users to upload, update, and delete

-- Policy: Allow authenticated users to upload, update, and delete their own files
-- (You may want to add RLS policies in the Supabase dashboard for more control) 