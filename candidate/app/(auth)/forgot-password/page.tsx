'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/axios';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    const normalizedEmail = email.trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError('Adresse email invalide');
      return;
    }

    setError('');

    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password', { email: normalizedEmail });
      setIsSuccess(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || "Erreur lors de l'envoi de l'email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-okl text-ok rounded-full flex items-center justify-center mb-4 border border-[var(--okb)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-ink">Email envoyé</h1>
          <p className="text-[13px] text-ink3 mt-2 max-w-md">
            Si l&apos;adresse <strong>{email}</strong> est associée à un compte,
            vous recevrez un lien de réinitialisation dans quelques minutes.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-card2 border border-border rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-v mt-0.5" />
              <div className="flex-1">
                <h3 className="text-[13px] font-semibold text-ink">Vérifiez votre boîte email</h3>
                <p className="text-[12px] text-ink3 mt-1">
                  Le lien de réinitialisation est valide pendant 15 minutes.
                  Pensez à vérifier vos spams si vous ne le trouvez pas.
                </p>
              </div>
            </div>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la connexion
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      <div className="flex flex-col mb-4">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-ink">Mot de passe oublié ?</h2>
        <p className="text-[13px] text-ink3 mt-1.5 leading-relaxed">
          Entrez votre adresse email pour recevoir un lien de réinitialisation sécurisé.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2 relative">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            placeholder="nom@exemple.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={!!error}
          />
          {error && (
            <span className="text-[11px] text-err absolute -bottom-5 left-0">{error}</span>
          )}
        </div>

        {submitError && (
          <div className="rounded-lg border border-[var(--errb)] bg-errl px-3 py-2 text-[12px] text-err">
            {submitError}
          </div>
        )}

        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Envoi en cours...</span>
            </div>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Réinitialiser mon mot de passe
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-[12px] text-ink4 mt-8">
        Vous vous souvenez de votre mot de passe ?{' '}
        <Link href="/login" className="font-semibold text-v hover:underline decoration-2 underline-offset-4">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
