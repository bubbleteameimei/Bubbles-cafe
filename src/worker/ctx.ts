import type { Env } from './utils';
import { getBearerToken, getSupabaseCurrentUser } from './utils';

export type WorkerContext = {
  req: Request;
  env: Env;
  token: string | null;
  getUser: () => Promise<Awaited<ReturnType<typeof getSupabaseCurrentUser>> | null>;
  requireAuth: () => Promise<{ token: string; user: NonNullable<Awaited<ReturnType<typeof getSupabaseCurrentUser>>> }>;
  requireAdmin: () => Promise<{ token: string; user: NonNullable<Awaited<ReturnType<typeof getSupabaseCurrentUser>>> }>;
};

export function withCtx<T>(
  req: Request,
  env: Env,
  handler: (ctx: WorkerContext) => Promise<T>,
): Promise<T> {
  const token = getBearerToken(req);

  let userPromise: Promise<any> | null = null;
  const getUser = () => {
    if (!token) return Promise.resolve(null);
    if (!userPromise) {
      userPromise = getSupabaseCurrentUser(env, token);
    }
    return userPromise;
  };

  const requireAuth = async () => {
    if (!token) {
      throw Object.assign(new Error('Authentication required'), { status: 401 });
    }
    const user = await getUser();
    if (!user) {
      throw Object.assign(new Error('Authentication required'), { status: 401 });
    }
    return { token, user };
  };

  const requireAdmin = async () => {
    const { token: t, user } = await requireAuth();
    if (!user.isAdmin) {
      throw Object.assign(new Error('Admin access required'), { status: 403 });
    }
    return { token: t, user };
  };

  return handler({ req, env, token, getUser, requireAuth, requireAdmin });
}
