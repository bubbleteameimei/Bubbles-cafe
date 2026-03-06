export type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

export async function callSupabaseRpc(
  env: SupabaseEnv,
  functionName: string,
  payload: Record<string, any>,
): Promise<Response> {
  const baseUrl = (env.SUPABASE_URL || '').replace(/\/+$/, '');
  if (!baseUrl || !env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured for RPC calls');
  }

  const url = `${baseUrl}/rest/v1/rpc/${functionName}`;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

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
