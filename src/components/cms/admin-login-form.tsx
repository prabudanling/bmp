'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function AdminLoginForm({ accessError = false, resetSuccess = false }: { accessError?: boolean; resetSuccess?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [error, setError] = useState(accessError ? 'Akun ini tidak memiliki akses ke workspace admin.' : '');
  const [message, setMessage] = useState(resetSuccess ? 'Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru.' : '');

  async function submit(formData: FormData) {
    setPending(true);
    setError('');
    setMessage('');
    const email = String(formData.get('email') ?? '').trim();

    try {
      if (resetMode) {
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: 'https://www.berkatmandiripendingin.com/admin/reset-password',
        });
        if (result.error) {
          setError('Permintaan belum dapat diproses. Periksa email dan coba kembali.');
          return;
        }
        setMessage('Jika alamat tersebut terdaftar, tautan untuk membuat kata sandi baru akan dikirim ke email itu.');
        return;
      }

      const password = String(formData.get('password') ?? '');
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError('Email atau kata sandi tidak sesuai. Periksa kembali lalu coba lagi.');
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError(resetMode ? 'Permintaan belum dapat diproses. Silakan coba kembali.' : 'Login belum dapat diproses. Silakan coba kembali.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Email admin (ID login)
        <input name="email" type="email" autoComplete="username" required className="h-12 rounded-xl border border-input bg-background px-4 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" placeholder="nama@perusahaan.co.id" />
      </label>
      {!resetMode ? (
        <>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Kata sandi
            <input name="password" type="password" autoComplete="current-password" minLength={8} required className="h-12 rounded-xl border border-input bg-background px-4 outline-none transition focus-visible:ring-2 focus-visible:ring-ring" placeholder="Masukkan kata sandi" />
          </label>
          <button type="button" onClick={() => { setResetMode(true); setError(''); setMessage(''); }} className="-mt-2 self-end text-sm font-medium text-teal-800 underline underline-offset-4 hover:text-teal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">Lupa atau belum punya kata sandi?</button>
        </>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">Kami akan mengirim tautan pengaturan kata sandi ke email ini jika akun terdaftar.</p>
      )}
      {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p role="status" className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm leading-5 text-teal-950">{message}</p> : null}
      <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center rounded-xl bg-teal-800 px-4 font-semibold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
        {pending ? 'Memproses…' : resetMode ? 'Kirim tautan pengaturan' : 'Masuk ke CMS'}
      </button>
      {resetMode ? <button type="button" onClick={() => { setResetMode(false); setError(''); setMessage(''); }} className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Kembali ke login</button> : null}
    </form>
  );
}
