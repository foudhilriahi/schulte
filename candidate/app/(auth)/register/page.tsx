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
    errors.name = 'Le nom doit contenir au moins 2 caractères';
  }

  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Adresse email invalide';
  }

  if (!PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = 'Numéro tunisien invalide (8 chiffres, commence par 2, 4, 5, 7 ou 9)';
  }

  if (!PASSWORD_REGEX.test(values.password)) {
    errors.password = 'Au moins 8 caractères et 1 chiffre';
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-[11px] text-err leading-snug" role="alert">
      {message}
    </p>
  );
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
        setSubmitError('Réponse serveur invalide. Veuillez vous connecter.');
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      <div className="flex flex-col mb-5">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-ink">Créer un compte</h2>
        <p className="text-[13px] text-ink3 mt-1.5 leading-relaxed">
          Rejoignez-nous pour découvrir nos offres et propulser votre carrière.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            placeholder="Foulen Ben Foulen"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
            aria-invalid={!!errors.name}
          />
          <FieldError message={errors.name} />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="nom@exemple.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            value={values.email}
            onChange={(e) => setValues((p) => ({ ...p, email: e.target.value }))}
            aria-invalid={!!errors.email}
          />
          <FieldError message={errors.email} />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone (Tunisie)</Label>
          <Input
            id="phone"
            placeholder="22 345 678"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            value={values.phone}
            onChange={(e) => setValues((p) => ({ ...p, phone: e.target.value.replace(/\s+/g, '') }))}
            aria-invalid={!!errors.phone}
          />
          <FieldError message={errors.phone} />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="8 caractères minimum, 1 chiffre"
            value={values.password}
            onChange={(e) => setValues((p) => ({ ...p, password: e.target.value }))}
            aria-invalid={!!errors.password}
          />
          <FieldError message={errors.password} />
        </div>

        {submitError && (
          <div className="rounded-lg border border-[var(--errb)] bg-errl px-3 py-2.5 text-[12px] text-err" role="alert">
            {submitError}
          </div>
        )}

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Création en cours...
            </span>
          ) : (
            "S'inscrire"
          )}
        </Button>
      </form>

      <p className="text-center text-[12px] text-ink4 mt-6">
        Vous avez déjà un compte ?{' '}
        <Link href="/login" className="font-semibold text-v hover:underline decoration-2 underline-offset-4">
          Connectez-vous
        </Link>
      </p>
    </div>
  );
}
