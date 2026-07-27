const GRAPH_PHOTO_URL = 'https://graph.microsoft.com/v1.0/me/photo/$value';

export const PROFILE_PHOTO_TTL_MS = 24 * 60 * 60 * 1000;

export function isProfilePhotoFresh(photoUpdatedAt?: string, now = Date.now()) {
  if (!photoUpdatedAt) return false;
  const updatedAt = Date.parse(photoUpdatedAt);
  return Number.isFinite(updatedAt) && now - updatedAt < PROFILE_PHOTO_TTL_MS;
}

export async function getUserProfilePhoto(accessToken: string) {
  const response = await fetch(GRAPH_PHOTO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Microsoft Graph photo error: ${response.status}`);
  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const bytes = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${bytes.toString('base64')}`;
}
