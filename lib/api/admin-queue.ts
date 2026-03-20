import type { AdminQueueItem } from '@/lib/posts/store';
import { readAdminSessionToken, verifyAdminSession } from '@/lib/admin/auth';
import { createAdminRuntime } from '@/lib/admin/runtime';

export async function getAdminQueue(items: AdminQueueItem[]): Promise<{
  success: true;
  data: AdminQueueItem[];
}> {
  return {
    success: true,
    data: items
  };
}

export function createAdminQueueGet(itemsProvider: () => AdminQueueItem[] | Promise<AdminQueueItem[]>) {
  return async function get(request?: Request): Promise<Response> {
    const url = request ? new URL(request.url) : null;
    const items = await itemsProvider();
    const filtered = items.filter((item) => {
      if (url?.searchParams.get('status') && item.status !== url.searchParams.get('status')) {
        return false;
      }
      if (url?.searchParams.get('query')) {
        const query = (url.searchParams.get('query') ?? '').toLowerCase();
        if (!item.id.toLowerCase().includes(query) && !item.content?.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (url?.searchParams.get('provider') && !item.moderationRuns.some((run) => run.provider === url.searchParams.get('provider'))) {
        return false;
      }
      if (url?.searchParams.get('decision') && !item.moderationRuns.some((run) => run.decision === url.searchParams.get('decision'))) {
        return false;
      }
      return true;
    });
    const body = await getAdminQueue(filtered);
    return Response.json(body, { status: 200 });
  };
}

export function createRuntimeAdminQueueGet() {
  return async function GET(request: Request): Promise<Response> {
    const runtime = createAdminRuntime();
    const token = readAdminSessionToken(request.headers.get('cookie'));
    const identity = await verifyAdminSession(token, {
      anonClient: runtime.anonClient,
      adminClient: runtime.adminClient
    });

    if (!identity) {
      return Response.json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 });
    }

    return createAdminQueueGet(() =>
      runtime.repository.listAdminQueue({
        query: new URL(request.url).searchParams.get('query') ?? undefined,
        status: new URL(request.url).searchParams.get('status') ?? undefined,
        provider: new URL(request.url).searchParams.get('provider') ?? undefined,
        decision: new URL(request.url).searchParams.get('decision') ?? undefined
      })
    )(request);
  };
}
