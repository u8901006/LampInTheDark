import { createPostMethod, createPublicPostsMethod } from '@/lib/api/posts';

export const GET = createPublicPostsMethod();
export const POST = createPostMethod();
