import { clearAdminSessionCookie, createAdminSessionCookie, signInAdmin } from '@/lib/admin/auth';
import { createAdminRuntime } from '@/lib/admin/runtime';

export function createAdminLoginPost(runtimeProvider: typeof createAdminRuntime = createAdminRuntime) {
  return async function POST(request: Request): Promise<Response> {
    const dependencies = runtimeProvider();
    const contentType = request.headers.get('content-type') ?? '';
    const expectsBrowserRedirect = !contentType.includes('application/json');
    let email = '';
    let password = '';

    if (contentType.includes('application/json')) {
      const payload = (await request.json()) as { email?: string; password?: string };
      email = payload.email?.trim() ?? '';
      password = payload.password ?? '';
    } else {
      const formData = await request.formData();
      email = String(formData.get('email') ?? '').trim();
      password = String(formData.get('password') ?? '');
    }

    if (!email || !password) {
      if (expectsBrowserRedirect) {
        return redirectToLogin('Email 與密碼不可為空。', clearAdminSessionCookie());
      }

      return Response.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email 與密碼不可為空。' } },
        { status: 422 }
      );
    }

    const result = await signInAdmin(
      { email, password },
      { anonClient: dependencies.anonClient, adminClient: dependencies.adminClient }
    );

    if (!result) {
      if (expectsBrowserRedirect) {
        return redirectToLogin('登入失敗或沒有管理員權限。', clearAdminSessionCookie());
      }

      return Response.json(
        { success: false, error: { code: 'FORBIDDEN', message: '登入失敗或沒有管理員權限。' } },
        {
          status: 403,
          headers: {
            'Set-Cookie': clearAdminSessionCookie()
          }
        }
      );
    }

    return new Response(null, {
      status: 303,
      headers: {
        Location: '/admin/queue',
        'Set-Cookie': createAdminSessionCookie(result.token)
      }
    });
  };
}

function redirectToLogin(message: string, cookie?: string): Response {
  const location = `/admin/login?error=${encodeURIComponent(message)}`;

  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
      ...(cookie ? { 'Set-Cookie': cookie } : {})
    }
  });
}
