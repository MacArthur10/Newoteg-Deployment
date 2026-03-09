export const AUTH_STORAGE_KEY = 'newoteg_admin_auth';

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
};

type SessionData = {
  token: string;
  user: SessionUser;
};

export function getSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function getSessionUser(): SessionUser | null {
  return getSession()?.user || null;
}

export function updateSessionUser(patch: Partial<SessionUser>) {
  const current = getSession();
  if (!current) return;
  const updated = {
    ...current,
    user: {
      ...current.user,
      ...patch,
    },
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('newoteg-admin-user-updated'));
}
