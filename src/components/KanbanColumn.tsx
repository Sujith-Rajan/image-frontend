'use client';

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { TodoItem, TodoStatus } from '@/types/todo';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: TodoStatus;
  todos: TodoItem[];
  onCardClick?: (todo: TodoItem) => void;
}

export function KanbanColumn({ id, title, todos, onCardClick }: KanbanColumnProps) {
  const columnColors = {
    'Pending': 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800',
    'In Progress': 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/30',
    'Completed': 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30',
  };

  const badgeColors = {
    'Pending': 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'In Progress': 'bg-amber-200 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400',
    'Completed': 'bg-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400',
  };

  return (
    <div className={`flex flex-col rounded-3xl border ${columnColors[title]} p-4 min-w-[320px] w-full flex-1 transition-colors duration-200`}>
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors[title]}`}>
          {todos.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[150px] transition-colors duration-200 rounded-2xl ${
              snapshot.isDraggingOver ? 'bg-black/5 dark:bg-white/5' : ''
            }`}
          >
            {todos.map((todo, index) => (
              <KanbanCard key={todo._id} todo={todo} index={index} onClick={onCardClick} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
