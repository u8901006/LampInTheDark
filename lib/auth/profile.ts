export function buildClientProfile(
  id: string,
  userMetadata?: { display_name?: unknown } | null
) {
  return {
    id,
    role: 'client' as const,
    display_name:
      typeof userMetadata?.display_name === 'string' ? userMetadata.display_name : '',
  };
}
