export function normalizeSocialUrl(
  rawInput: string | undefined,
  platform: 'facebook' | 'tiktok' | 'instagram'
): string {
  const raw = (rawInput || '').trim();
  if (!raw) return '';

  // Block dangerous schemes
  const lower = raw.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) {
    return '';
  }

  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return raw;
  }

  if (
    lower.includes('facebook.com') ||
    lower.includes('fb.com') ||
    lower.includes('tiktok.com') ||
    lower.includes('instagram.com')
  ) {
    return `https://${raw.replace(/^\/+/, '')}`;
  }

  const handle = raw.replace(/^@+/, '').replace(/^\/+/, '');
  if (!handle) return '';

  switch (platform) {
    case 'facebook':
      return `https://facebook.com/${encodeURIComponent(handle)}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${encodeURIComponent(handle)}`;
    case 'instagram':
      return `https://instagram.com/${encodeURIComponent(handle)}`;
  }
}
