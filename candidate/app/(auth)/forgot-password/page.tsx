'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/axios';

const forgotPasswordSchema = z.object({
  email: z.string().email('Adresse email invalide'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password', data);
      setIsSuccess(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Email envoyé !</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Si l'adresse <strong>{getValues('email')}</strong> est associée à un compte, 
            vous recevrez un lien de réinitialisation dans quelques minutes.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900">Vérifiez votre boîte email</h3>
                <p className="text-sm text-blue-700 mt-1">
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
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center">
        <div className="flex md:hidden w-12 h-12 mb-4 bg-primary rounded-xl items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
          S
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Mot de passe oublié ?</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2 relative">
          <Label htmlFor="email">Adresse email</Label>
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

        <Button type="submit" className="w-full mt-6 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-300" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Envoi en cours...</span>
            </div>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Envoyer le lien de réinitialisation
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