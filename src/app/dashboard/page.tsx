'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, CheckCircle2, Clock, AlertCircle, KanbanSquare, ListTodo } from 'lucide-react';
import { TodoTable } from '@/components/TodoTable';
import { KanbanBoard } from '@/components/KanbanBoard';
import { MOCK_TODOS, TodoItem } from '@/types/todo';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CreateTaskModal } from '@/components/todos/CreateTaskModal';
import { TaskDetailsModal } from '@/components/todos/TaskDetailsModal';
import { todosService } from '@/services/todos.service';

export default function Dashboard() {
    const [view, setView] = useState<'list' | 'board'>('board');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTodos = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await todosService.getRecentTodos();
            setTodos(response.todos || []);
        } catch (error) {
            console.error("Failed to fetch todos", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    // Calculate metrics dynamically
    const totalTasks = todos.length;
    const completedTasks = todos.filter(t => t.status === 'Completed').length;
    const inProgressTasks = todos.filter(t => t.status === 'In Progress').length;
    const overdueTasks = todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
    return (
        <div className="max-w-7xl mx-auto space-y-8">

            {/* Header Section */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Manage your tasks and track your productivity.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    + New Task
                </button>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Tasks"
                    value={totalTasks.toString()}
                    icon={<LayoutDashboard className="w-6 h-6 text-blue-500" />}
                    trend="Real-time data"
                />
                <MetricCard
                    title="Completed"
                    value={completedTasks.toString()}
                    icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    trend="Keep it up!"
                />
                <MetricCard
                    title="In Progress"
                    value={inProgressTasks.toString()}
                    icon={<Clock className="w-6 h-6 text-amber-500" />}
                    trend="Active work"
                />
                <MetricCard
                    title="Overdue"
                    value={overdueTasks.toString()}
                    icon={<AlertCircle className="w-6 h-6 text-rose-500" />}
                    trend="Needs attention"
                />
            </div>

            {/* Main Content Area: Table / Tasks */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Tasks</h2>

                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                        <button
                            onClick={() => setView('board')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'board' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <KanbanSquare className="w-4 h-4" /> Board
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <ListTodo className="w-4 h-4" /> List
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-12 flex justify-center items-center text-slate-500">
                        Loading tasks...
                    </div>
                ) : view === 'board' ? (
                    <KanbanBoard
                        initialTodos={todos}
                        onCardClick={(todo) => setSelectedTodo(todo)}
                        onUpdate={fetchTodos}
                    />
                ) : (
                    <TodoTable todos={todos} />
                )}
            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => fetchTodos()}
            />

            <TaskDetailsModal
                todo={selectedTodo}
                isOpen={!!selectedTodo}
                onClose={() => setSelectedTodo(null)}
                onUpdate={() => {
                    fetchTodos();
                    // Refetch specific todo to update modal immediately if needed,
                    // but fetchTodos updates the whole board, so we can just update selectedTodo
                    if (selectedTodo) {
                        todosService.getTodos().then(res => {
                            const updated = res.todos.find((t: TodoItem) => t._id === selectedTodo._id);
                            if (updated) setSelectedTodo(updated);
                        });
                    }
                }}
            />

        </div>
    );
}
