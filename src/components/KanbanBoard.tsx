'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { TodoItem, TodoStatus } from '@/types/todo';
import { KanbanColumn } from './KanbanColumn';
import { todosService } from '@/services/todos.service';

interface KanbanBoardProps {
  initialTodos: TodoItem[];
  onCardClick?: (todo: TodoItem) => void;
  onUpdate?: () => void;
}

const STATUSES: TodoStatus[] = ['Pending', 'In Progress', 'Completed'];

export function KanbanBoard({ initialTodos, onCardClick, onUpdate }: KanbanBoardProps) {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newTodos = Array.from(todos);
    const draggedTodoIndex = newTodos.findIndex(t => t._id === draggableId);
    if (draggedTodoIndex === -1) return;

    const [draggedTodo] = newTodos.splice(draggedTodoIndex, 1);
    
    // Update status based on destination column
    const newStatus = destination.droppableId as TodoStatus;
    const updatedTodo = { ...draggedTodo, status: newStatus };

    // Find the correct insertion index in the full array based on the visual index in the column
    // Since we filter by status in the render, we just need to insert it at the end of the new array 
    // or simulate the exact order. For a simple implementation, we can just push it and rely on a 
    // hypothetical backend order field, or just insert it right after the item that is currently at that index.
    
    // To properly support reordering within the same column:
    const columnTodos = newTodos.filter(t => t.status === newStatus);
    if (destination.index === columnTodos.length) {
      newTodos.push(updatedTodo);
    } else {
      const targetTodo = columnTodos[destination.index];
      const targetGlobalIndex = newTodos.findIndex(t => t._id === targetTodo._id);
      newTodos.splice(targetGlobalIndex, 0, updatedTodo);
    }

    setTodos(newTodos);
    
    // Call API to update the backend
    if (draggedTodo.status !== newStatus) {
      todosService.updateTodo(draggableId, { status: newStatus })
        .then(() => {
          if (newStatus === 'In Progress') {
            return todosService.startTimer(draggableId);
          } else if (newStatus === 'Pending' || newStatus === 'Completed') {
            return todosService.stopTimer(draggableId);
          }
        })
        .then(() => {
          onUpdate?.();
        })
        .catch(err => {
          console.error(err);
          // Optional: toast error
        });
    }
  };

  // Prevent hydration errors by not rendering the drag context on the server
  if (!isMounted) {
    return null; 
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col lg:flex-row gap-6 items-start overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            title={status}
            todos={todos.filter(todo => todo.status === status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
