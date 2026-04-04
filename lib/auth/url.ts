export function buildAuthCallbackUrl(origin: string): string {
  return `${origin.replace(/\/+$/, '')}/auth/callback`;
}

export function getPostAuthRedirectPath(role: string | null | undefined): string | null {
  if (role === 'therapist') {
    return '/admin/dashboard';
  }

  if (role === 'client') {
    return '/dashboard';
  }

  return null;
}

export function getBearerToken(header: string | null | undefined): string | null {
  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  const token = header.slice('Bearer '.length).trim();
  return token || null;
}
