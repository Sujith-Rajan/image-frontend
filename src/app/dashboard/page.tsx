'use client';

import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { LayoutDashboard, CheckCircle2, Clock, AlertCircle, KanbanSquare, ListTodo } from 'lucide-react';
import { TodoTable } from '@/components/TodoTable';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TodoItem } from '@/types/todo';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CreateTaskModal } from '@/components/todos/CreateTaskModal';
import { TaskDetailsModal } from '@/components/todos/TaskDetailsModal';
import { todosService } from '@/services/todos.service';

export default function Dashboard() {
    const [view, setView] = useState<'list' | 'board'>('board');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch
    } = useInfiniteQuery({
        queryKey: ['recentTodos'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await todosService.getRecentTodos(pageParam, 10);
            return response;
        },
        getNextPageParam: (lastPage: any, allPages) => {
            return lastPage.hasMore ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
    });

    const { ref, inView } = useInView({
        threshold: 0,
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const todos = data?.pages.flatMap(page => page.todos || []) || [];

    // Calculate metrics dynamically
    const totalTasks = todos.length;
    const completedTasks = todos.filter(t => t.status === 'Completed').length;
    const inProgressTasks = todos.filter(t => t.status === 'In Progress').length;
    const overdueTasks = todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;

    return (
        <div className="max-w-7xl mx-auto space-y-8">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
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
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center"
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
                        onUpdate={() => refetch()}
                        fetchNextPage={fetchNextPage}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                    />
                ) : (
                    <TodoTable todos={todos} />
                )}

                {/* Infinite Scroll Trigger */}
                <div ref={ref} className="h-10 mt-4 flex justify-center items-center text-sm text-slate-400">
                    {isFetchingNextPage ? 'Loading more tasks...' : hasNextPage ? 'Scroll for more' : 'No more tasks'}
                </div>
            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => refetch()}
            />

            <TaskDetailsModal
                todo={selectedTodo}
                isOpen={!!selectedTodo}
                onClose={() => setSelectedTodo(null)}
                onUpdate={() => {
                    refetch();
                    // Refetch specific todo to update modal immediately if needed
                    if (selectedTodo) {
                        todosService.getTodoById(selectedTodo._id).then(res => {
                            if (res.todo) setSelectedTodo(res.todo);
                        });
                    }
                }}
            />

        </div>
    );
}
