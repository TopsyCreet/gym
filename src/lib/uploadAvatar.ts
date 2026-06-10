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

// Upload a base64 data URI to Supabase Storage.
// Used to recover avatars that couldn't be uploaded during the email-confirmation signup flow.
export async function uploadAvatarFromBase64(base64: string, userId: string): Promise<string | null> {
  if (!supabase || !base64.startsWith('data:')) return null;
  try {
    const [header, b64data] = base64.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
    const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
    const binary = atob(b64data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const path = `${userId}.${ext}`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: mime });
    if (error) return null;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}
