const GRAPH_PHOTO_URL = 'https://graph.microsoft.com/v1.0/me/photo/$value';

export const PROFILE_PHOTO_TTL_MS = 24 * 60 * 60 * 1000;
export const PROFILE_PHOTO_STORAGE_KEY_PREFIX = 'validador-profile-photo';

export function isProfilePhotoFresh(photoUpdatedAt?: string, now = Date.now()) {
  if (!photoUpdatedAt) return false;
  const updatedAt = Date.parse(photoUpdatedAt);
  return Number.isFinite(updatedAt) && now - updatedAt < PROFILE_PHOTO_TTL_MS;
}

export function getProfilePhotoStorageKey(identifier?: string | null) {
  return `${PROFILE_PHOTO_STORAGE_KEY_PREFIX}:${identifier?.trim() || 'anonymous'}`;
}

export function readProfilePhotoFromStorage(identifier?: string | null) {
  if (typeof window === 'undefined') return undefined;

  const key = getProfilePhotoStorageKey(identifier);
  const rawSession = window.sessionStorage.getItem(key);
  const rawLocal = window.localStorage.getItem(key);
  const raw = rawSession ?? rawLocal;
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as { photo?: string; updatedAt?: string };
    if (!parsed.photo) return undefined;
    if (parsed.updatedAt && !isProfilePhotoFresh(parsed.updatedAt)) {
      window.sessionStorage.removeItem(key);
      window.localStorage.removeItem(key);
      return undefined;
    }
    return parsed.photo;
  } catch {
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
    return undefined;
  }
}

export function persistProfilePhotoToStorage(
  photo: string | undefined,
  identifier?: string | null,
  storage: 'session' | 'local' = 'session',
) {
  if (typeof window === 'undefined' || !photo) return;

  const key = getProfilePhotoStorageKey(identifier);
  const payload = JSON.stringify({
    photo,
    updatedAt: new Date().toISOString(),
  });

  if (storage === 'local') {
    window.localStorage.setItem(key, payload);
    return;
  }

  window.sessionStorage.setItem(key, payload);
}

export function clearProfilePhotoFromStorage(identifier?: string | null) {
  if (typeof window === 'undefined') return;
  const key = getProfilePhotoStorageKey(identifier);
  window.sessionStorage.removeItem(key);
  window.localStorage.removeItem(key);
}

export async function getUserProfilePhoto(accessToken: string) {
  const response = await fetch(GRAPH_PHOTO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (response.status === 404) return undefined;
  if (!response.ok)
    throw new Error(`Microsoft Graph photo error: ${response.status}`);
  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const bytes = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${bytes.toString('base64')}`;
}
