'use client';

import React, { useState } from 'react';
import { Mail, Lock, UserPlus, User, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { signupSchema, type SignupFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth.service';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await authService.signup(data);
      toast.success('Account created successfully!', {
        description: 'You can now sign in with your credentials.'
      });
      router.push('/login');
    } catch (err: any) {
      toast.error('Signup failed', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join us to maximize your productivity."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerHref="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        <InputField
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={<User className="h-5 w-5" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <InputField
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <InputField
          label="Phone Number"
          type="tel"
          placeholder="9876543210"
          optional
          icon={<Phone className="h-5 w-5" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <InputField
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          loadingText="Creating account..."
          icon={<UserPlus className="w-5 h-5" />}
          className="mt-6"
        >
          Create account
        </Button>
        
      </form>
    </AuthLayout>
  );
}
