import { randomBytes } from 'node:crypto';
import { z } from 'zod';

import type { ModerationDecision, ModerationRunRecord } from '@/lib/moderation/types';
import { saveAdminQueueItem, type PersistedPost, type PostStatus } from '@/lib/posts/store';
import { createPublicRuntimePostDependencies, createRuntimePostDependencies } from '@/lib/posts/runtime';

export interface CreatePostRequest {
  content: string;
  emotionTags: string[];
  deviceFingerprintHash: string;
}

type SuccessResponse = {
  success: true;
  data: {
    id: string;
    trackingCode: string;
    status: PostStatus;
    publiclyVisible: boolean;
  };
  meta: {
    moderationPath: string;
  };
};

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type CreatePostResponse = SuccessResponse | ErrorResponse;

const createPostSchema = z.object({
  content: z.string().min(10).max(2000),
  emotionTags: z.array(z.string().min(1)).min(1).max(5),
  deviceFingerprintHash: z.string().min(1)
});

type SavePostInput = PersistedPost;

export interface RouteDependencies {
  moderate: (input: { content: string; traceId: string }) => Promise<{
    finalDecision: ModerationDecision;
    path: string;
    runs: ModerationRunRecord[];
  }>; 
  savePost?: (post: SavePostInput) => Promise<void>;
  findPostByTrackingCode?: (trackingCode: string) => Promise<{
    id: string;
    trackingCode: string;
    content: string;
    emotionTags: string[];
    status: PostStatus;
    createdAt: string | null;
  } | null>;
  listPublicPosts?: () => Promise<Array<{
    id: string;
    content: string;
    emotionTags: string[];
    createdAt: string | null;
  }>>;
}

export function createPostRouteHandler(dependencies: RouteDependencies) {
  const savePost = dependencies.savePost ?? saveAdminQueueItem;

  return async function handlePost(request: CreatePostRequest): Promise<CreatePostResponse> {
    const parsed = createPostSchema.safeParse(request);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: toValidationMessage(issue)
        }
      };
    }

    const id = `post_${Math.random().toString(36).slice(2, 10)}`;
    const trackingCode = createTrackingCode();
    const traceId = `trace_${Math.random().toString(36).slice(2, 10)}`;
    const moderation = await dependencies.moderate({ content: parsed.data.content, traceId });
    const status = coerceStatus(moderation.finalDecision);

    await savePost({
      id,
      trackingCode,
      content: parsed.data.content,
      emotionTags: parsed.data.emotionTags,
      deviceFingerprintHash: parsed.data.deviceFingerprintHash,
      status,
      moderationPath: moderation.path,
      moderationRuns: moderation.runs
    });

    return {
      success: true,
      data: {
        id,
        trackingCode,
        status,
        publiclyVisible: status === 'APPROVED'
      },
      meta: {
        moderationPath: moderation.path
      }
    };
  };
}

export function createPostMethod(dependencies?: RouteDependencies) {
  return async function post(request: Request): Promise<Response> {
    const payload = (await request.json()) as CreatePostRequest;
    const handlePost = createPostRouteHandler(
      dependencies ?? createRuntimePostDependencies()
    );

    const response = await handlePost(payload);
    const status = response.success ? 201 : 422;

    return Response.json(response, { status });
  };
}

const trackingCodeSchema = z.string().regex(/^track_[a-f0-9]{16}$/i);

export function createTrackingCodeLookupMethod(dependencies?: Pick<RouteDependencies, 'findPostByTrackingCode'>) {
  return async function get(
    _request: Request,
    context: { params: Promise<{ trackingCode: string }> }
  ): Promise<Response> {
    const { trackingCode } = await context.params;
    const parsed = trackingCodeSchema.safeParse(trackingCode);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Tracking code format is invalid.' } },
        { status: 422 }
      );
    }

    const finder = dependencies?.findPostByTrackingCode ?? createPublicRuntimePostDependencies().findPostByTrackingCode;
    const post = await finder(parsed.data);

    if (!post) {
      return Response.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Post not found.' } },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        id: post.id,
        trackingCode: post.trackingCode,
        content: post.content,
        emotionTags: post.emotionTags,
        status: post.status,
        createdAt: post.createdAt
      }
    }, { status: 200 });
  };
}

export function createPublicPostsMethod(dependencies?: Pick<RouteDependencies, 'listPublicPosts'>) {
  return async function get(_request: Request): Promise<Response> {
    const posts = await getPublicPosts(dependencies);

    return Response.json({ success: true, data: posts }, { status: 200 });
  };
}

export async function getPublicPosts(dependencies?: Pick<RouteDependencies, 'listPublicPosts'>) {
  const listPublicPosts = dependencies?.listPublicPosts ?? createPublicRuntimePostDependencies().listPublicPosts;
  return listPublicPosts();
}

function createTrackingCode() {
  return `track_${randomBytes(8).toString('hex')}`;
}

function coerceStatus(decision: ModerationDecision): PostStatus {
  if (decision === 'APPROVED' || decision === 'REJECTED' || decision === 'CRISIS') {
    return decision;
  }

  return 'MANUAL_REVIEW';
}

function toValidationMessage(issue: z.ZodIssue | undefined): string {
  if (!issue) {
    return 'Request payload is invalid.';
  }

  if (issue.path[0] === 'content' && issue.code === 'too_small') {
    return '留言內容至少需要 10 個字。';
  }

  if (issue.path[0] === 'content' && issue.code === 'too_big') {
    return '留言內容最多 2000 個字。';
  }

  if (issue.path[0] === 'emotionTags' && issue.code === 'too_small') {
    return '請至少選擇一個情緒標籤。';
  }

  return 'Request payload is invalid.';
}
