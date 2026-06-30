'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CheckCircle,
  LayoutDashboard,
  ListTodo,
  Settings,
  LogOut,
  User,
  Users,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Tasks', href: '/dashboard/tasks', icon: ListTodo },
  { name: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const ADMIN_NAV_ITEMS = [
  { name: 'Users', href: '/dashboard/users', icon: Users },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Best Practice: Fetch user data directly from the global store inside the component that needs it!
  const { user } = useAuthStore();
  const userRole = user?.role === 'admin' ? 'Admin' : 'User';
  const userName = user?.name || 'Loading...';
  const userEmail = user?.email || '';

  const handleLogout = async () => {
    // Call the actual auth service logout
    await authService.logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-transform duration-300 ease-in-out flex flex-col lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Branding */}
        <div className="flex items-center gap-3 px-8 h-20 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Image Timesheet
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {[...NAV_ITEMS, ...(userRole.toLowerCase() ? ADMIN_NAV_ITEMS : [])].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</span>
                <span className="text-xs font-medium text-slate-500 ">{userEmail}</span>
                <span className="text-xs font-medium text-slate-500 capitalize">{userRole}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
