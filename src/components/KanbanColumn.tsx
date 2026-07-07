'use client';

import React, { useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { useInView } from 'react-intersection-observer';
import { TodoItem, TodoStatus } from '@/types/todo';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: TodoStatus;
  todos: TodoItem[];
  onCardClick?: (todo: TodoItem) => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export function KanbanColumn({
  id,
  title,
  todos,
  onCardClick,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
}: KanbanColumnProps) {
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
            className={`flex-1 min-h-[150px] max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar transition-colors duration-200 rounded-2xl ${snapshot.isDraggingOver ? 'bg-black/5 dark:bg-white/5' : ''
              }`}
          >
            {todos.map((todo, index) => (
              <KanbanCard key={todo._id} todo={todo} index={index} onClick={onCardClick} />
            ))}
            {provided.placeholder}

            {/* Infinite Scroll Trigger for the Column */}
            <div ref={ref} className="h-4 w-full flex justify-center items-center mt-2">
              {isFetchingNextPage && <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
