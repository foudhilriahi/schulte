'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PwaInstallHint } from '@/components/pwa-install-hint';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth';
import { useRouterWithLoader } from '@/hooks/use-router-with-loader';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginValues = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const initialValues: LoginValues = {
  email: '',
  password: '',
};

function validate(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Adresse email invalide';
  }

  if (values.password.length < 6) {
    errors.password = 'Mot de passe requis';
  }

  return errors;
}

export default function LoginPage() {
  const router = useRouterWithLoader();
  const { login } = useAuthStore();
  const [values, setValues] = useState<LoginValues>(initialValues);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', {
        email: values.email.trim(),
        password: values.password,
      });

      const { user, accessToken } = res.data;
      if (user.role !== 'CANDIDATE') {
        setSubmitError('Acces refuse. Cette application est reservee aux candidats.');
        return;
      }

      login(user, accessToken);
      router.push('/');
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Bon retour</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Entrez vos identifiants pour acceder a votre espace candidat
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2 relative">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="nom@exemple.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            value={values.email}
            onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
            className={`bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ${errors.email ? 'border-err focus-visible:ring-destructive/50' : ''}`}
          />
          {errors.email && (
            <span className="text-xs text-err absolute -bottom-5 left-0">{errors.email}</span>
          )}
        </div>

        <div className="space-y-2 relative pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Mot de passe oublie ?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
            className={`bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ${errors.password ? 'border-err focus-visible:ring-destructive/50' : ''}`}
          />
          {errors.password && (
            <span className="text-xs text-err absolute -bottom-5 left-0">{errors.password}</span>
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
              <span>Connexion...</span>
            </div>
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>

      <PwaInstallHint />

      <div className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Inscrivez-vous
        </Link>
      </div>
    </div>
  );
}
