import React, { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  optional?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, icon, error, optional, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label} {optional && <span className="text-slate-400 font-normal">(Optional)</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "block w-full py-3 pr-3 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
              icon ? "pl-10" : "pl-3",
              error ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-rose-500">{error}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
