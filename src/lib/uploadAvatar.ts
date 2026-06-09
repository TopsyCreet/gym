import { supabase } from './supabaseClient';

export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
  if (!supabase) return null;
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}.${ext}`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return null;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}
