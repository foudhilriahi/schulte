'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth';
import { useRouterWithLoader } from '@/hooks/use-router-with-loader';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(2|4|5|7|9)\d{7}$/;
const PASSWORD_REGEX = /^(?=.*[0-9]).{8,}$/;

type RegisterValues = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

const initialValues: RegisterValues = {
  name: '',
  email: '',
  phone: '',
  password: '',
};

function validate(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caracteres';
  }

  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Adresse email invalide';
  }

  if (!PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = 'Le numero doit etre tunisien valide (8 chiffres, commence par 2, 4, 5, 7 ou 9)';
  }

  if (!PASSWORD_REGEX.test(values.password)) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caracteres et 1 chiffre';
  }

  return errors;
}

export default function RegisterPage() {
  const router = useRouterWithLoader();
  const { login } = useAuthStore();
  const [values, setValues] = useState<RegisterValues>(initialValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
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
      const res = await api.post('/auth/register', {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      });

      const { userId, email: registeredEmail } = res.data;
      if (typeof userId === 'string' && userId && typeof registeredEmail === 'string' && registeredEmail) {
        router.push(`/verify-email?userId=${userId}&email=${encodeURIComponent(registeredEmail)}`);
      } else {
        setSubmitError("Reponse serveur invalide. Veuillez vous connecter.");
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      <div className="flex flex-col mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-ink">Créer un compte</h2>
        <p className="text-sm text-ink3 mt-1.5 leading-relaxed">
          Rejoignez-nous pour découvrir nos offres et propulser votre carrière.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2 relative">
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            placeholder="Foulen Ben Foulen"
            value={values.name}
            onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
            className={`h-11 bg-card border-border transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-[var(--violet-b)] focus-visible:border-violet ${errors.name ? 'border-err focus-visible:ring-err/20' : ''}`}
          />
          {errors.name && (
            <span className="text-xs text-err absolute -bottom-5 left-0">{errors.name}</span>
          )}
        </div>

        <div className="space-y-2 relative pt-2">
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
            className={`h-11 bg-card border-border transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-[var(--violet-b)] focus-visible:border-violet ${errors.email ? 'border-err focus-visible:ring-err/20' : ''}`}
          />
          {errors.email && (
            <span className="text-xs text-err absolute -bottom-5 left-0">{errors.email}</span>
          )}
        </div>

        <div className="space-y-2 relative pt-2">
          <Label htmlFor="phone">Telephone (Tunisie)</Label>
          <Input
            id="phone"
            placeholder="22 345 678"
            type="tel"
            value={values.phone}
            onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value.replace(/\s+/g, '') }))}
            className={`h-11 bg-card border-border transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-[var(--violet-b)] focus-visible:border-violet ${errors.phone ? 'border-err focus-visible:ring-err/20' : ''}`}
          />
          {errors.phone && (
            <span className="text-xs text-err absolute -bottom-5 left-0">{errors.phone}</span>
          )}
        </div>

        <div className="space-y-2 relative pt-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
            className={`h-11 bg-card border-border transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-[var(--violet-b)] focus-visible:border-violet ${errors.password ? 'border-err focus-visible:ring-err/20' : ''}`}
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

        <Button type="submit" className="w-full h-11 mt-8 rounded-xl font-bold transition-all active:scale-[0.97] shadow-sm" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Création en cours...</span>
            </div>
          ) : (
            "S'inscrire"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-ink4 mt-8">
        Vous avez déjà un compte ?{' '}
        <Link href="/login" className="font-bold text-violet hover:underline decoration-2 underline-offset-4">
          Connectez-vous
        </Link>
      </div>
    </div>
  );
}
