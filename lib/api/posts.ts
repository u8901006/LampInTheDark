import { z } from 'zod';

import type { ModerationDecision, ModerationRunRecord } from '@/lib/moderation/types';
import { saveAdminQueueItem, type PersistedPost, type PostStatus } from '@/lib/posts/store';
import { createRuntimePostDependencies } from '@/lib/posts/runtime';

export interface CreatePostRequest {
  content: string;
  emotionTags: string[];
  deviceFingerprintHash: string;
}

type SuccessResponse = {
  success: true;
  data: {
    id: string;
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
}

export function createPostRouteHandler(dependencies: RouteDependencies) {
  const savePost = dependencies.savePost ?? saveAdminQueueItem;

  return async function handlePost(request: CreatePostRequest): Promise<CreatePostResponse> {
    const parsed = createPostSchema.safeParse(request);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request payload is invalid.'
        }
      };
    }

    const id = `post_${Math.random().toString(36).slice(2, 10)}`;
    const traceId = `trace_${Math.random().toString(36).slice(2, 10)}`;
    const moderation = await dependencies.moderate({ content: parsed.data.content, traceId });
    const status = coerceStatus(moderation.finalDecision);

    await savePost({
      id,
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

function coerceStatus(decision: ModerationDecision): PostStatus {
  if (decision === 'APPROVED' || decision === 'REJECTED' || decision === 'CRISIS') {
    return decision;
  }

  return 'MANUAL_REVIEW';
}
