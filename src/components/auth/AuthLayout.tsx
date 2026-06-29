import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerHref,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 font-sans py-12">
      <div className="w-full max-w-md">
        
        {/* Branding */}
        <div className="flex justify-center items-center gap-3 mb-8">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Image Timesheet
          </span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>

          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {footerText}{' '}
          <Link href={footerHref} className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            {footerLinkText}
          </Link>
        </p>
        
      </div>
    </div>
  );
}
