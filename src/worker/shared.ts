export type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

function getSupabaseRpcUrl(env: SupabaseEnv, functionName: string): string {
  const baseUrl = (env.SUPABASE_URL || '').replace(/\/+$/, '');
  if (!baseUrl || !env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured for RPC calls');
  }
  return `${baseUrl}/rest/v1/rpc/${functionName}`;
}

export async function callSupabaseRpcAsAnon(
  env: SupabaseEnv,
  functionName: string,
  payload: Record<string, any>,
): Promise<Response> {
  const url = getSupabaseRpcUrl(env, functionName);

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      'X-Client-Info': 'bubbles-worker',
    },
    body: JSON.stringify(payload),
  });
}

export async function callSupabaseRpcAsServiceRole(
  env: SupabaseEnv,
  functionName: string,
  payload: Record<string, any>,
): Promise<Response> {
  const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serviceKey) {
    throw new Error('Supabase service role key is required for this operation');
  }

  const url = getSupabaseRpcUrl(env, functionName);

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      'X-Client-Info': 'bubbles-worker',
    },
    body: JSON.stringify(payload),
  });
}

// Backwards-compatible helper.
// Prefer callSupabaseRpcAsAnon / callSupabaseRpcAsServiceRole for new code.
export async function callSupabaseRpc(
  env: SupabaseEnv,
  functionName: string,
  payload: Record<string, any>,
): Promise<Response> {
  const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (serviceKey) {
    return callSupabaseRpcAsServiceRole(env, functionName, payload);
  }
  return callSupabaseRpcAsAnon(env, functionName, payload);
}

export function mapDbUserRowToApiUser(row: any): {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  fullName?: string | null;
  bio?: string | null;
  avatar?: string | null;
} {
  const meta =
    row && typeof row.metadata === 'object' && row.metadata !== null ? (row.metadata as any) : {};
  const fullName = meta.fullName ?? meta.displayName ?? null;
  const avatar = meta.avatar ?? meta.photoURL ?? null;
  const bio = meta.bio ?? null;
  return {
    id: Number(row.id),
    email: String(row.email || ''),
    username: String(row.username || ''),
    isAdmin: row.is_admin === true || row.isAdmin === true,
    fullName,
    bio,
    avatar,
  };
}
