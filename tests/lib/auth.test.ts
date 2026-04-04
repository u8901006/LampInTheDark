import { describe, expect, it } from 'vitest';

import { buildAuthCallbackUrl, getPostAuthRedirectPath, getBearerToken } from '@/lib/auth/url';

describe('buildAuthCallbackUrl', () => {
  it('uses the current origin and auth callback path', () => {
    expect(buildAuthCallbackUrl('https://www.leepsyclinic.uk')).toBe(
      'https://www.leepsyclinic.uk/auth/callback'
    );
  });

  it('trims trailing slashes from the origin', () => {
    expect(buildAuthCallbackUrl('https://www.leepsyclinic.uk/')).toBe(
      'https://www.leepsyclinic.uk/auth/callback'
    );
  });
});

describe('getPostAuthRedirectPath', () => {
  it('redirects therapists to the admin dashboard', () => {
    expect(getPostAuthRedirectPath('therapist')).toBe('/admin/dashboard');
  });

  it('redirects clients to the client dashboard', () => {
    expect(getPostAuthRedirectPath('client')).toBe('/dashboard');
  });

  it('does not redirect users without a profile role', () => {
    expect(getPostAuthRedirectPath(null)).toBeNull();
  });
});

describe('getBearerToken', () => {
  it('extracts the bearer token from an authorization header', () => {
    expect(getBearerToken('Bearer token-123')).toBe('token-123');
  });

  it('returns null for missing or invalid headers', () => {
    expect(getBearerToken(null)).toBeNull();
    expect(getBearerToken('Basic token-123')).toBeNull();
  });
});
