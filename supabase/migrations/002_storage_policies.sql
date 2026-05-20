-- Run after creating buckets "chapter-images" and "chapter-audio" in Supabase dashboard

-- chapter-images: public read, authenticated write
CREATE POLICY "public_read_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chapter-images');

CREATE POLICY "auth_insert_images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chapter-images' AND auth.role() = 'authenticated');

-- chapter-audio: public read, authenticated write
CREATE POLICY "public_read_audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chapter-audio');

CREATE POLICY "auth_insert_audio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chapter-audio' AND auth.role() = 'authenticated');
