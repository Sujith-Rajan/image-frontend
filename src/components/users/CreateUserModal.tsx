'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Lock, X, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { signupSchema, type SignupFormData } from '@/lib/validations/auth.schema';
import { usersService } from '@/services/users.service';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await usersService.createUser(data);
      toast.success('User created successfully');
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Failed to create user', {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Create New User
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 -mr-2">
          <form id="create-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
            <InputField
              label="Full Name"
              type="text"
              placeholder="Aiden"
              icon={<User className="h-5 w-5" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <InputField
              label="Email Address"
              type="email"
              placeholder="aiden@example.com"
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
          </form>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <Button
            type="submit"
            form="create-user-form"
            isLoading={isLoading}
            className="w-auto px-6"
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
