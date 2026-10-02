'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function AdminResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(formData: FormData) {
    setPending(true);
    setError('');
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');

    if (password !== confirmPassword) {
      setError('Kedua kata sandi belum sama. Periksa kembali.');
      setPending(false);
      return;
    }

    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) {
        setError('Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru dari halaman login.');
        return;
      }
      router.replace('/admin/login?reset=success');
      router.refresh();
    } catch {
      setError('Kata sandi belum dapat diperbarui. Minta tautan baru lalu coba kembali.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Kata sandi baru
        <input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className="h-12 rounded-xl border border-input bg-background px-4 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" placeholder="Minimal 8 karakter" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Ulangi kata sandi baru
        <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className="h-12 rounded-xl border border-input bg-background px-4 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" placeholder="Ketik ulang kata sandi" />
      </label>
      {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
      <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center rounded-xl bg-teal-800 px-4 font-semibold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
        {pending ? 'Menyimpan…' : 'Simpan kata sandi baru'}
      </button>
      <Link href="/admin/login" className="text-center text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">Kembali ke login</Link>
    </form>
  );
}
