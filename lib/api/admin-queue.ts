import type { AdminQueueItem } from '@/lib/posts/store';
import { createRuntimePostDependencies } from '@/lib/posts/runtime';

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
  return async function get(): Promise<Response> {
    const body = await getAdminQueue(await itemsProvider());
    return Response.json(body, { status: 200 });
  };
}

export function createRuntimeAdminQueueGet() {
  return createAdminQueueGet(() => createRuntimePostDependencies().listAdminQueue());
}
