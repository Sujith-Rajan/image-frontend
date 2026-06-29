'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, CalendarCheck, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Image Timesheet
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium px-4 py-2 transition-colors"
          >
            Log in
          </Link>
          <Link 
            href="/signup" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mt-12 mb-24">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
          Manage your tasks, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            maximize your time.
          </span>
        </h1>
        
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-12 leading-relaxed">
          Image Timesheet brings focus from work to play. The smart daily planner that helps you achieve more every single day.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/signup" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto"
          >
            Get Started for Free
          </Link>
          <Link 
            href="/login" 
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all w-full sm:w-auto"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
          <FeatureCard 
            icon={<CalendarCheck className="w-8 h-8 text-blue-500" />}
            title="My Day"
            description="A smart daily planner that suggests tasks for you to focus on each day."
          />
          <FeatureCard 
            icon={<Clock className="w-8 h-8 text-cyan-500" />}
            title="Time Tracking"
            description="Log your hours effortlessly and keep your timesheets perfectly accurate."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-indigo-500" />}
            title="Secure & Private"
            description="Enterprise-grade security ensures your personal and work tasks stay private."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-8 text-center text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Image Timesheet. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="bg-white dark:bg-slate-800 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
