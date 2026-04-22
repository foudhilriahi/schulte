'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/axios';
import { useRouterWithLoader } from '@/hooks/use-router-with-loader';

type ResetValues = {
  password: string;
  confirmPassword: string;
};

type ResetErrors = Partial<Record<keyof ResetValues, string>>;

const initialValues: ResetValues = {
  password: '',
  confirmPassword: '',
};

function validate(values: ResetValues): ResetErrors {
  const errors: ResetErrors = {};

  if (values.password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caracteres';
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas';
  }

  return errors;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full text-center text-sm text-muted-foreground">Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouterWithLoader();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [values, setValues] = useState<ResetValues>(initialValues);
  const [errors, setErrors] = useState<ResetErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError(true);
    }
  }, [token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    if (!token) {
      setTokenError(true);
      return;
    }

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsLoading(true);
      await api.post('/auth/reset-password', {
        token,
        password: values.password,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 300);
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Erreur lors de la reinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-errl text-err rounded-full flex items-center justify-center mb-4 border border-[var(--err-b)]">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Lien invalide</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Le lien de reinitialisation est invalide ou a expire.
            Veuillez demander un nouveau lien.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/forgot-password">
              Demander un nouveau lien
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour a la connexion
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-okl text-ok rounded-full flex items-center justify-center mb-4 border border-[var(--ok-b)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Mot de passe reinitialise !</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Votre mot de passe a ete mis a jour avec succes.
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/login">
            Se connecter
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau mot de passe</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Choisissez un nouveau mot de passe securise pour votre compte
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2 relative">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
            className={`bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ${errors.password ? 'border-err focus-visible:ring-destructive/50' : ''}`}
          />
          {errors.password && (
            <span className="text-xs text-err absolute -bottom-5 left-0">{errors.password}</span>
          )}
        </div>

        <div className="space-y-2 relative pt-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(event) => setValues((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            className={`bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ${errors.confirmPassword ? 'border-err focus-visible:ring-destructive/50' : ''}`}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-err absolute -bottom-5 left-0">{errors.confirmPassword}</span>
          )}
        </div>

        {submitError && (
          <div className="rounded-md border border-[var(--err-b)] bg-errl px-3 py-2 text-sm text-err">
            {submitError}
          </div>
        )}

        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Reinitialisation...</span>
            </div>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Reinitialiser le mot de passe
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Vous vous souvenez de votre mot de passe ?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
