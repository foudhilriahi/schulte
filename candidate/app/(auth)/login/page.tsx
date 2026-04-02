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

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Mot de passe requis'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', data);
      
      const { user, accessToken } = res.data;
      if (user.role !== 'CANDIDATE') {
        toast.error('Accès refusé. Cette application est réservée aux candidats.');
        return;
      }

      login(user, accessToken);
      toast.success('Connexion réussie !');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center">
        <div className="flex md:hidden w-12 h-12 mb-4 bg-primary rounded-xl items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
          S
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Bon retour</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Entrez vos identifiants pour accéder à votre espace candidat
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2 relative">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <Input 
            id="password" 
            type="password"
            autoComplete="current-password"
            className={`bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ${errors.password ? 'border-destructive focus-visible:ring-destructive/50' : ''}`}
            {...register('password')} 
          />
          {errors.password && (
            <span className="text-xs text-destructive absolute -bottom-5 left-0">{errors.password.message}</span>
          )}
        </div>

        <Button type="submit" className="w-full mt-6 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300" disabled={isLoading}>
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

      <div className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Inscrivez-vous
        </Link>
      </div>
    </div>
  );
}
