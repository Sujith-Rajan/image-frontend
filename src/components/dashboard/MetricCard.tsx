import React from 'react';

export interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

export function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
          {icon}
        </div>
      </div>
      <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{value}</div>
      <p className="text-sm text-slate-400">{trend}</p>
    </div>
  );
}
