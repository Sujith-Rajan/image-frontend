'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

import { TodoItem, TodoStatus, TodoPriority, } from '@/types/todo';

interface TodoTableProps {
  todos: any[];
}

export function TodoTable({ todos }: TodoTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TodoStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');

  const filteredAndSortedTodos = useMemo(() => {
    let result = todos;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(lower) ||
        t.category?.toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    if (priorityFilter !== 'All') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    if (sortOrder !== 'none') {
      result = [...result].sort((a, b) => {
        if (sortOrder === 'asc') return a.progress - b.progress;
        return b.progress - a.progress;
      });
    }

    return result;
  }, [todos, searchTerm, statusFilter, priorityFilter, sortOrder]);

  return (
    <div className="w-full text-slate-900 dark:text-slate-100">

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort Progress {sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : ''}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-800/50 uppercase text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">Task Details</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Assigned To</th>
              <th className="px-6 py-4">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
            {filteredAndSortedTodos.map((todo) => (
              <tr key={todo._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{todo.title}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{todo.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={todo.status} />
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={todo.priority} />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {todo.assignedTo?.name || 'Unassigned'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${todo.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{todo.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function StatusBadge({ status }: { status: TodoStatus }) {
  const styles = {
    'Pending': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    'Completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TodoPriority }) {
  const styles = {
    'Low': 'text-slate-500',
    'Medium': 'text-amber-500',
    'High': 'text-rose-500',
  };
  return (
    <span className={`text-xs font-bold uppercase tracking-wider ${styles[priority]}`}>
      {priority}
    </span>
  );
}
