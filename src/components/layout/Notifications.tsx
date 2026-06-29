'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { todosService } from '@/services/todos.service';
import { TodoItem } from '@/types/todo';
import { TaskDetailsModal } from '@/components/todos/TaskDetailsModal';

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadTasks, setUnreadTasks] = useState<TodoItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<TodoItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub || payload.userId || payload._id;

      const res = await todosService.getTodos();
      const todos: TodoItem[] = res.todos || [];
      
      const unread = todos.filter(t => 
        !t.isReadByAssignee && 
        t.assignedTo?._id === userId
      );
      
      // Sort by newest first
      unread.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setUnreadTasks(unread);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    fetchUnread();
    
    // Poll every 30 seconds for new assignments
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTaskClick = async (task: TodoItem) => {
    setIsOpen(false);
    setSelectedTask(task);
    
    try {
      await todosService.markAsRead(task._id);
      setUnreadTasks(prev => prev.filter(t => t._id !== task._id));
    } catch (e) {
      console.error("Failed to mark as read");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadTasks.length > 0 && (
          <span className="absolute top-1 right-1.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white dark:border-slate-950 text-[8px] font-bold text-white items-center justify-center leading-none">
              {unreadTasks.length > 9 ? '9+' : unreadTasks.length}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md font-medium">
              {unreadTasks.length} New
            </span>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {unreadTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 opacity-20" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {unreadTasks.map(task => (
                  <button
                    key={task._id}
                    onClick={() => handleTaskClick(task)}
                    className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col gap-1 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-sm">
                        New Task
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm mt-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {task.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskDetailsModal
          todo={selectedTask}
          isOpen={true}
          onClose={() => {
            setSelectedTask(null);
            fetchUnread(); // Refresh in case it was modified
          }}
          onUpdate={() => {
            fetchUnread();
          }}
        />
      )}
    </div>
  );
}
