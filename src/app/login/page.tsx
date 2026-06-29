'use client';

import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await authService.login(data);
      toast.success('Successfully logged in!', {
        description: 'Welcome back to your dashboard.'
      });
      router.push('/dashboard');
    } catch (err: any) {
      toast.error('Login failed', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Please enter your details to sign in."
      footerText="Don't have an account?"
      footerLinkText="Sign up for free"
      footerHref="/signup"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        <InputField
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <InputField
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          loadingText="Signing in..."
          icon={<ShieldCheck className="w-5 h-5" />}
          className="mt-6"
        >
          Sign in
        </Button>
        
      </form>
    </AuthLayout>
  );
}
