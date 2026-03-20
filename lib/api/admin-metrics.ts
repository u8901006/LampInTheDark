import { computeModerationMetrics } from '@/lib/admin/metrics';
import { readAdminSessionToken, verifyAdminSession } from '@/lib/admin/auth';
import { createAdminRuntime } from '@/lib/admin/runtime';

export function createAdminMetricsGet(runtimeProvider: typeof createAdminRuntime = createAdminRuntime) {
  return async function GET(request: Request): Promise<Response> {
    const dependencies = runtimeProvider();
    const token = readAdminSessionToken(request.headers.get('cookie'));
    const identity = await verifyAdminSession(token, {
      anonClient: dependencies.anonClient,
      adminClient: dependencies.adminClient
    });

    if (!identity) {
      return Response.json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 });
    }

    const items = await dependencies.repository.listAdminQueue();
    return Response.json({ success: true, data: computeModerationMetrics(items) }, { status: 200 });
  };
}
