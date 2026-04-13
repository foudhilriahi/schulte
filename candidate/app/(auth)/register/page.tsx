'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().regex(/^(2|4|5|7|9)\d{7}$/, 'Le numéro de téléphone doit être un numéro tunisien valide (8 chiffres, commence par 2, 4, 5, 7, ou 9)'),
  password: z.string().regex(/^(?=.*[0-9]).{8,}$/, 'Le mot de passe doit contenir au moins 8 caractères et 1 chiffre'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/register', data);
      
      const { user, accessToken } = res.data;
      login(user, accessToken);
      toast.success('Inscription réussie ! Bienvenue.');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Rejoignez-nous pour découvrir nos offres exclusives
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="space-y-2 relative">
          <Label htmlFor="name">Nom complet</Label>
          <Input 
            id="name" 
            placeholder="Foulen Ben Foulen" 
            className={`bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ${errors.name ? 'border-destructive focus-visible:ring-destructive/50' : ''}`}
            {...register('name')} 
          />
          {errors.name && (
            <span className="text-xs text-destructive absolute -bottom-5 left-0">{errors.name.message}</span>
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
            className={`bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ${errors.email ? 'border-destructive focus-visible:ring-destructive/50' : ''}`}
            {...register('email')} 
          />
          {errors.email && (
            <span className="text-xs text-destructive absolute -bottom-5 left-0">{errors.email.message}</span>
          )}
        </div>

        <div className="space-y-2 relative pt-2">
          <Label htmlFor="phone">Téléphone (Tunisie)</Label>
          <Input 
            id="phone" 
            placeholder="22 345 678" 
            type="tel" 
            className={`bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ${errors.phone ? 'border-destructive focus-visible:ring-destructive/50' : ''}`}
            {...register('phone')} 
          />
          {errors.phone && (
            <span className="text-xs text-destructive absolute -bottom-5 left-0">{errors.phone.message}</span>
          )}
        </div>

        <div className="space-y-2 relative pt-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input 
            id="password" 
            type="password"
            autoComplete="new-password"
            className={`bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ${errors.password ? 'border-destructive focus-visible:ring-destructive/50' : ''}`}
            {...register('password')} 
          />
          {errors.password && (
            <span className="text-xs text-destructive absolute -bottom-5 left-0">{errors.password.message}</span>
          )}
        </div>

        <Button type="submit" className="w-full mt-8" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Création...</span>
            </div>
          ) : (
            'S\'inscrire'
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Connectez-vous
        </Link>
      </div>
    </div>
  );
}
