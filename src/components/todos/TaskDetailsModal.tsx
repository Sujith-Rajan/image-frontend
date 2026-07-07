'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Square, MessageSquare, Clock, AlertCircle, CheckCircle2, Flag, Edit2, Trash2, Save, CheckSquare } from 'lucide-react';
import { TodoItem, TodoStatus } from '@/types/todo';
import { todosService } from '@/services/todos.service';
import { toast } from 'sonner';

interface TaskDetailsModalProps {
  todo: TodoItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function TaskDetailsModal({ todo, isOpen, onClose, onUpdate }: TaskDetailsModalProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  const [elapsedSeconds, setElapsedSeconds] = useState(todo?.totalWorkedSeconds || 0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Initialize elapsed time safely
  useEffect(() => {
    if (!todo) return;
    
    // Initial value
    let baseSeconds = todo.totalWorkedSeconds || 0;
    
    if (todo.startedAt) {
      // Add ticking time
      const startTime = new Date(todo.startedAt).getTime();
      const currentSeconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(baseSeconds + currentSeconds);
      
      const interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      
      setTimerInterval(interval);
      return () => clearInterval(interval);
    } else {
      setElapsedSeconds(baseSeconds);
      if (timerInterval) clearInterval(timerInterval);
    }
  }, [todo?.startedAt, todo?.totalWorkedSeconds]);

  useEffect(() => {
    if (todo && isOpen) {
      setEditTitle(todo.title);
      setEditDescription(todo.description);
      setIsEditing(false); // Reset edit state when opening a new task
    }
  }, [todo, isOpen]);

  if (!isOpen || !todo) return null;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TodoStatus;
    try {
      await todosService.updateTodo(todo._id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleTimer = async () => {
    try {
      if (todo.startedAt) {
        await todosService.stopTimer(todo._id);
        toast.success('Timer stopped');
      } else {
        await todosService.startTimer(todo._id);
        toast.success('Timer started');
      }
      onUpdate();
    } catch (error) {
      toast.error('Failed to toggle timer');
    }
  };

  const handleSaveChanges = async () => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    try {
      await todosService.updateTodo(todo._id, { title: editTitle, description: editDescription });
      toast.success('Task updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      try {
        await todosService.deleteTodo(todo._id);
        toast.success('Task deleted successfully');
        onClose(); // Close modal immediately
        onUpdate(); // Trigger refresh in parent
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleToggleSubtask = async (index: number, currentStatus: boolean) => {
    if (!todo) return;
    try {
      const updatedSubTasks = [...(todo.subTasks || [])];
      if (updatedSubTasks[index]) {
         updatedSubTasks[index].isCompleted = !currentStatus;
         await todosService.updateTodo(todo._id, { subTasks: updatedSubTasks });
         onUpdate();
      }
    } catch (error) {
      toast.error('Failed to update subtask');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await todosService.addComment(todo._id, commentText);
      toast.success('Comment added');
      setCommentText('');
      onUpdate();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate).getTime() < Date.now() && todo.status !== 'Completed';

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1 mr-4">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-blue-500 rounded-xl px-3 py-1 outline-none"
                autoFocus
              />
            ) : (
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {todo.title}
              </h2>
            )}
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {todo.category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Status:</span>
                <select 
                  value={todo.status}
                  onChange={handleStatusChange}
                  className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 py-1 pl-2 pr-8"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          
          {/* Main Info */}
          <div className="flex-1 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Description
                </h3>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">Cancel</button>
                    <button onClick={handleSaveChanges} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                      <Save className="w-3 h-3" /> Save
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                    <Edit2 className="w-3 h-3" /> Edit Task
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full min-h-[150px] p-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-blue-500 rounded-xl outline-none resize-y"
                  placeholder="Task description..."
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {todo.description || <span className="italic text-slate-400">No description provided.</span>}
                </p>
              )}
            </div>

            {todo.subTasks && todo.subTasks.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" /> Subtasks
                  </h3>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
                    {todo.progress || 0}%
                  </span>
                </div>
                
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
                   <div 
                     className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                     style={{ width: `${todo.progress || 0}%` }}
                   />
                </div>

                <div className="space-y-3">
                  {todo.subTasks.map((st, idx) => (
                    <div key={st._id || idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                      <input
                        type="checkbox"
                        checked={st.isCompleted}
                        onChange={() => handleToggleSubtask(idx, st.isCompleted)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-sm font-medium ${st.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Comments
              </h3>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {todo.comments && todo.comments.length > 0 ? (
                  todo.comments.map((c, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {c.user?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {c.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">No comments yet.</p>
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..." 
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isSubmitting}
                />
                <button 
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Post
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Time Tracking
              </h3>
              
              <div className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-6 tabular-nums tracking-tight">
                {formatTime(elapsedSeconds)}
              </div>
              
              <button
                onClick={handleToggleTimer}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  todo.startedAt 
                    ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-400' 
                    : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400'
                }`}
              >
                {todo.startedAt ? (
                  <><Square className="w-4 h-4 fill-current" /> Stop Timer</>
                ) : (
                  <><Play className="w-4 h-4 fill-current" /> Start Timer</>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Priority</span>
                <p className="font-medium text-slate-900 dark:text-slate-100">{todo.priority}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Assigned To</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    {todo.assignedTo?.name ? todo.assignedTo.name.charAt(0) : 'U'}
                  </div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{todo.assignedTo?.name || 'Unassigned'}</p>
                </div>
              </div>
              {todo.dueDate && (
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Due Date</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-900 dark:text-slate-100'}`}>
                      {new Date(todo.dueDate).toLocaleDateString()}
                    </p>
                    {isOverdue && <Flag className="w-4 h-4 text-rose-500 fill-rose-500" />}
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleDeleteTask}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-800/50"
              >
                <Trash2 className="w-4 h-4" /> Delete Task
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return null;
}
