import { createNeonAuth } from '@neondatabase/auth/next/server';

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!baseUrl || !cookieSecret) {
  throw new Error('Neon Auth is not configured. Check NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.');
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
    sessionDataTtl: 300,
  },
});

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();

export const runtime = 'nodejs';

export async function getSessionUser() {
  const { data } = await auth.getSession();
  return data?.user ?? null;
}

export async function getAdminUser() {
  const [user, allowedEmail] = await Promise.all([
    getSessionUser().catch(() => null),
    Promise.resolve(process.env.CMS_ADMIN_EMAIL?.trim().toLowerCase()),
  ]);

  if (!user || !allowedEmail || user.email.trim().toLowerCase() !== allowedEmail) {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect('/admin/login');
  }
  return user;
}

export async function signOutAction() {
  'use server';
  await auth.signOut();
  const { redirect } = await import('next/navigation');
  redirect('/admin/login');
}

export type AdminUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && process.env.CMS_ADMIN_EMAIL && email.trim().toLowerCase() === process.env.CMS_ADMIN_EMAIL.trim().toLowerCase());
}

export async function getCmsAdminSession() {
  const user = await getSessionUser().catch(() => null);
  return user && isAdminEmail(user.email) ? user : null;
}

export const AUTH_ROUTE_PATH = '/api/auth';

export function authConfigured() {
  return Boolean(baseUrl && cookieSecret && process.env.CMS_ADMIN_EMAIL);
}

export const ADMIN_LOGIN_PATH = '/admin/login';
