'use client';

import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { TodoItem, TodoPriority } from '@/types/todo';
import { Clock, CheckCircle2, AlertCircle, Flag } from 'lucide-react';
import { todosService } from '@/services/todos.service';

interface KanbanCardProps {
  todo: TodoItem;
  index: number;
  onClick?: (todo: TodoItem) => void;
}

export function KanbanCard({ todo, index, onClick }: KanbanCardProps) {
  const [progress, setProgress] = useState(todo.progress || 0);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
  };

  const handleProgressCommit = async () => {
    if (progress === todo.progress) return;
    try {
      await todosService.patchTodo(todo._id, { progress });
    } catch (error) {
      console.error('Failed to update progress', error);
    }
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate).getTime() < Date.now() && todo.status !== 'Completed';

  return (
    <Draggable draggableId={todo._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-white dark:bg-slate-900 p-4 mb-3 rounded-2xl border cursor-pointer
            ${snapshot.isDragging
              ? 'border-blue-500 shadow-xl shadow-blue-500/10 z-50 rotate-1'
              : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800'
            }
            transition-all duration-200 group
          `}
          onClick={() => onClick?.(todo)}
          style={provided.draggableProps.style}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              {todo.category}
            </span>
            <PriorityIndicator priority={todo.priority} />
          </div>

          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight mb-2">
            {todo.title}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
            {todo.description}
          </p>

          <div
            className="mb-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Progress</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              onMouseUp={handleProgressCommit}
              onTouchEnd={handleProgressCommit}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-500"
            />
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-300 shrink-0">
                {todo.assignedTo?.name ? todo.assignedTo.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[100px]" title={todo.assignedTo?.name || 'Unassigned'}>
                {todo.assignedTo?.name || 'Unassigned'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isOverdue && <Flag className="w-4 h-4 text-rose-500 fill-rose-500" />}
              {todo.status === 'Completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {todo.status === 'In Progress' && <Clock className="w-4 h-4 text-amber-500" />}
              {todo.status === 'Pending' && <AlertCircle className="w-4 h-4 text-slate-400" />}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function PriorityIndicator({ priority }: { priority: TodoPriority }) {
  const styles = {
    'Low': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    'Medium': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    'High': 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  };

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles[priority]}`}>
      {priority}
    </span>
  );
}
