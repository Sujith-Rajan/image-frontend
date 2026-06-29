'use client';

import React, { useState, useEffect } from 'react';
import { ListTodo, Clock, Calendar, CheckCircle2, Circle, AlertCircle, Flag } from 'lucide-react';
import { todosService } from '@/services/todos.service';
import { TodoItem } from '@/types/todo';
import { TaskDetailsModal } from '@/components/todos/TaskDetailsModal';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TodoItem | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await todosService.getTodos();
      // Sort tasks by creation date
      const sorted = (data.todos || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTasks(sorted);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20';
      case 'Medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'Low': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <ListTodo className="w-8 h-8 text-blue-600" />
            My Tasks
          </h1>
          <p className="text-slate-500 mt-1 text-lg">
            View and manage your assigned tasks.
          </p>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 px-6 font-semibold text-sm text-slate-500 dark:text-slate-400">Task Title</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-500 dark:text-slate-400">Category</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-500 dark:text-slate-400">Priority</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-500 dark:text-slate-400">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-500 dark:text-slate-400">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                      <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading tasks...
                    </div>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < Date.now() && task.status !== 'Completed';
                  
                  return (
                    <tr 
                      key={task._id} 
                      onClick={() => setSelectedTask(task)}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {task.title}
                          </span>
                          <span className="text-sm text-slate-500 line-clamp-1 mt-1">
                            {task.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                          {task.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                          <Flag className="w-3.5 h-3.5" />
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {task.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {task.dueDate ? (
                          <div className={`flex items-center gap-2 text-sm font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                            <Calendar className="w-4 h-4" />
                            {new Date(task.dueDate).toLocaleDateString()}
                            {isOverdue && <AlertCircle className="w-4 h-4" />}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">No due date</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskDetailsModal
        todo={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={() => {
          fetchTasks(); // refresh table
          if (selectedTask) {
            // Optimistically update the selected task state if it's still open
            todosService.getTodoById(selectedTask._id).then(setSelectedTask).catch(console.error);
          }
        }}
      />
    </div>
  );
}
