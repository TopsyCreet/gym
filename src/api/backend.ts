import { findGymByCode } from '../data/gyms';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://your-supabase-functions.example.com';
const useRemoteReferral = !API_BASE.includes('your-supabase-functions.example.com');

type ReferralResponse = { gymId: string; name: string; location?: string; description?: string };

export async function validateReferral(code: string): Promise<ReferralResponse | null> {
  const normalized = code.trim();
  if (!normalized) return null;

  if (!useRemoteReferral) {
    const gym = findGymByCode(normalized);
    return gym ? { gymId: gym.id, name: gym.name, location: gym.location, description: gym.description } : null;
  }

  try {
    const res = await fetch(`${API_BASE}/referral/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: normalized })
    });

    if (!res.ok) {
      const gym = findGymByCode(normalized);
      return gym ? { gymId: gym.id, name: gym.name, location: gym.location, description: gym.description } : null;
    }
    return res.json();
  } catch {
    const gym = findGymByCode(normalized);
    return gym ? { gymId: gym.id, name: gym.name, location: gym.location, description: gym.description } : null;
  }
}

export async function startCheckin(lat: number, lng: number, gymId: string, token: string) {
  const res = await fetch(`${API_BASE}/checkin/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ lat, lng, gymId })
  });
  return res.json();
}

export async function completeCheckin(checkinId: string, lat: number, lng: number, nonce: string, token: string) {
  const res = await fetch(`${API_BASE}/checkin/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ checkinId, lat, lng, nonce })
  });
  return res.json();
}

// Small note: token should be the Supabase access token (or a session JWT) from the client auth flow.
// Update `VITE_API_BASE` in your .env to point at your Supabase functions base URL.
