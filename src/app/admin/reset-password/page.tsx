import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Snowflake } from 'lucide-react';
import { AdminResetPasswordForm } from '@/components/cms/admin-reset-password-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Atur Kata Sandi Admin',
  robots: { index: false, follow: false },
};

export default async function AdminResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  const invalidLink = !token || error === 'INVALID_TOKEN';

  if (!invalidLink) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5faf9] px-4 py-12">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-teal-950 via-teal-800 to-emerald-700" />
        <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/70 bg-white p-7 shadow-[0_32px_100px_-48px_rgba(4,47,46,0.45)] sm:p-9">
          <Link href="/admin/login" className="mb-9 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-teal-800">
            <ArrowLeft aria-hidden="true" className="size-4" /> Kembali ke login
          </Link>
          <div className="mb-7 flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
            <Snowflake aria-hidden="true" className="size-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Berkat Mandiri Pendingin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Atur kata sandi baru</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Buat kata sandi baru yang unik dan jangan kirimkan kepada siapa pun.</p>
          <div className="mt-8"><AdminResetPasswordForm token={token} /></div>
          <div className="mt-7 flex items-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="size-4 text-teal-700" /> Tautan pemulihan hanya dapat digunakan sekali.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5faf9] px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl sm:p-9">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Tautan tidak berlaku</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Tautan pengaturan kata sandi tidak ditemukan atau sudah kedaluwarsa. Minta tautan baru dari halaman login admin.</p>
        <Link href="/admin/login" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-teal-800 px-4 text-sm font-semibold text-white transition hover:bg-teal-700">Kembali ke login</Link>
      </section>
    </main>
  );
}
