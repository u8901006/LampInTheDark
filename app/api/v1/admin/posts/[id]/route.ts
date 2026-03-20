import { readAdminSessionToken, verifyAdminSession } from '@/lib/admin/auth';
import { createAdminRuntime } from '@/lib/admin/runtime';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const runtime = createAdminRuntime();
  const token = readAdminSessionToken(request.headers.get('cookie'));
  const identity = await verifyAdminSession(token, {
    anonClient: runtime.anonClient,
    adminClient: runtime.adminClient
  });

  if (!identity) {
    return Response.json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 });
  }

  const payload = (await request.json()) as { status?: 'APPROVED' | 'REJECTED'; reviewNote?: string };
  if (!payload.status || !['APPROVED', 'REJECTED'].includes(payload.status)) {
    return Response.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid status' } }, { status: 422 });
  }

  const { id } = await context.params;
  await runtime.repository.updateModerationDecision({
    postId: id,
    status: payload.status,
    reviewedBy: identity.userId,
    reviewNote: payload.reviewNote ?? null
  });

  return Response.json({ success: true, data: { id, status: payload.status } }, { status: 200 });
}
