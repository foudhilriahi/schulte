'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/axios';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setTokenError(true);
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error('Token de réinitialisation manquant');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setIsSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Lien invalide</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Le lien de réinitialisation est invalide ou a expiré. 
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
              Retour à la connexion
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Mot de passe réinitialisé !</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Votre mot de passe a été mis à jour avec succès. 
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
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center">
        <div className="flex md:hidden w-12 h-12 mb-4 bg-primary rounded-xl items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
          S
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau mot de passe</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Choisissez un nouveau mot de passe sécurisé pour votre compte
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2 relative">
          <Label htmlFor="password">Nouveau mot de passe</Label>
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

        <div className="space-y-2 relative pt-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input 
            id="confirmPassword" 
            type="password"
            autoComplete="new-password"
            className={`bg-background transition-shadow duration-300 focus-visible:ring-primary/50 ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive/50' : ''}`}
            {...register('confirmPassword')} 
          />
          {errors.confirmPassword && (
            <span className="text-xs text-destructive absolute -bottom-5 left-0">{errors.confirmPassword.message}</span>
          )}
        </div>

        <Button type="submit" className="w-full mt-6 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Réinitialisation...</span>
            </div>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Réinitialiser le mot de passe
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