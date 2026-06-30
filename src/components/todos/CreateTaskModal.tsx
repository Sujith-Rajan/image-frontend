'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, CheckSquare, AlignLeft, Tag, Flag, Calendar, Users, Percent } from 'lucide-react';
import { toast } from 'sonner';

import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { createTodoSchema, type CreateTodoFormData } from '@/lib/validations/todo.schema';
import { todosService } from '@/services/todos.service';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/store/authStore';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const { user: authUser } = useAuthStore();
  
  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTodoFormData>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      status: 'Pending',
      progress: 0,
      priority: 'Medium',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (authUser?.role === 'admin') {
        // Fetch users for the dropdown only if admin
        usersService.getUsers(1, 100)
          .then(data => setUsers(data.users))
          .catch(err => console.error("Could not fetch users", err));
      }
    }
  }, [isOpen, authUser?.role]);

  const onSubmit = async (data: CreateTodoFormData) => {
    setIsLoading(true);
    try {

      const payload = { ...data };
      if (!payload.dueDate) delete payload.dueDate;

      if (authUser?.role !== 'admin') {
        payload.assignedTo = authUser?._id;
      } else if (!payload.assignedTo) {
        delete payload.assignedTo;
      }

      await todosService.createTodo(payload);
      toast.success('Task created successfully');
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Failed to create task', {
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
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 -mr-2">
          <form id="create-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-4">

            <InputField
              label="Title"
              type="text"
              placeholder="e.g. Design Dashboard UI"
              icon={<CheckSquare className="h-5 w-5" />}
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none text-slate-400">
                  <AlignLeft className="h-5 w-5" />
                </div>
                <textarea
                  placeholder="Task details (minimum 10 characters)..."
                  className={`block w-full py-3 pr-3 pl-10 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px] ${errors.description ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"}`}
                  {...register('description')}
                />
              </div>
              {errors.description && <p className="mt-2 text-sm text-rose-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Category"
                type="text"
                placeholder="e.g. Design, Frontend, Backend"
                icon={<Tag className="h-5 w-5" />}
                error={errors.category?.message}
                {...register('category')}
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Flag className="h-5 w-5" />
                  </div>
                  <select
                    className={`block w-full py-3 pr-3 pl-10 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none ${errors.priority ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"}`}
                    {...register('priority')}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                {errors.priority && <p className="mt-2 text-sm text-rose-500">{errors.priority.message}</p>}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assigned To</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Users className="h-5 w-5" />
                  </div>
                  {authUser?.role === 'admin' ? (
                    <select
                      className="block w-full py-3 pr-3 pl-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                      {...register('assignedTo')}
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>
                          {u._id === authUser?._id ? 'Me' : u.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value="Me"
                      className="block w-full py-3 pr-3 pl-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              <InputField
                label="Due Date"
                type="date"
                optional
                min={todayDate}
                icon={<Calendar className="h-5 w-5" />}
                error={errors.dueDate?.message}
                {...register('dueDate')}
              />
            </div>

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
            form="create-task-form"
            isLoading={isLoading}
            className="w-auto px-6"
          >
            Create Task
          </Button>
        </div>
      </div>
    </div>
  );
}
