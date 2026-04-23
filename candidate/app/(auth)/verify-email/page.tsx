'use client';

import { FormEvent, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Mail, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth';
import { useRouterWithLoader } from '@/hooks/use-router-with-loader';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="w-full text-center text-sm text-muted-foreground">Chargement...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouterWithLoader();
  const { login } = useAuthStore();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = useCallback(async (codeValue: string) => {
    if (codeValue.length !== 6 || isLoading) return;

    try {
      setIsLoading(true);
      setError('');
      const res = await api.post('/auth/verify-email', { userId, code: codeValue });
      const { user, accessToken } = res.data;
      login(user, accessToken);
      setIsSuccess(true);
      setTimeout(() => router.push('/'), 300);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Code invalide ou expire');
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoading, login, router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleVerify(code);
  };

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError('');
    if (digits.length === 6) {
      handleVerify(digits);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    try {
      await api.post('/auth/resend-verification', { email });
      setResendMessage('Nouveau code envoye !');
      setResendCooldown(60);
      setCode('');
      setError('');
      inputRef.current?.focus();
    } catch (err: any) {
      if (err.response?.status === 429) {
        setResendMessage('Veuillez patienter avant de renvoyer.');
        setResendCooldown(60);
      } else {
        setResendMessage(err.response?.data?.error || 'Erreur lors du renvoi');
      }
    }

    setTimeout(() => setResendMessage(''), 5000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-okl text-ok rounded-full flex items-center justify-center mb-4 border border-[var(--ok-b)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Email verifie !</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Votre compte est maintenant actif. Redirection en cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-secondary text-primary rounded-full flex items-center justify-center mb-4 border border-input">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Verifiez votre email</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Un code a 6 chiffres a ete envoye a{' '}
          <strong className="text-foreground">{email || 'votre adresse email'}</strong>.
          Entrez-le ci-dessous pour activer votre compte.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex justify-center">
          <Input
            ref={inputRef}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            className={`
              w-[200px] text-center text-2xl font-bold tracking-[0.5em] py-3 h-auto
              bg-background transition-shadow duration-300 focus-visible:ring-primary/50
              ${error ? 'border-err focus-visible:ring-destructive/50' : ''}
            `}
          />
        </div>

        {error && (
          <div className="rounded-md border border-[var(--err-b)] bg-errl px-3 py-2 text-sm text-err text-center">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Verification...</span>
            </div>
          ) : (
            'Verifier'
          )}
        </Button>
      </form>

      <div className="space-y-3">
        <div className="p-4 bg-secondary border border-input rounded-md">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Verifiez votre boite email</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Le code est valide pendant 15 minutes.
                Pensez a verifier vos spams si vous ne le trouvez pas.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${resendCooldown > 0 ? '' : ''}`} />
          {resendCooldown > 0
            ? `Renvoyer dans ${resendCooldown}s`
            : 'Renvoyer le code'
          }
        </button>

        {resendMessage && (
          <p className="text-xs text-center text-muted-foreground animate-in fade-in duration-200">{resendMessage}</p>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Mauvaise adresse ?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Recommencer l&apos;inscription
        </Link>
      </div>
    </div>
  );
}
