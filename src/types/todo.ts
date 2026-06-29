export type TodoStatus = 'Pending' | 'In Progress' | 'Completed';
export type TodoPriority = 'Low' | 'Medium' | 'High';

export interface TodoItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: TodoPriority;
  status: TodoStatus;
  progress: number;
  dueDate?: string;
  assignedTo?: { _id: string; name: string };
  isReadByAssignee?: boolean;
  createdAt: string;
  startedAt?: string;
  totalWorkedSeconds?: number;
  comments?: {
    _id?: string;
    user: { _id: string; name: string; email: string };
    comment: string;
    createdAt: string;
  }[];
}

export const MOCK_TODOS: TodoItem[] = [
  { _id: '1', title: 'Complete Next.js Setup', description: 'Initialize the frontend with Next App Router', category: 'Development', priority: 'High', status: 'Completed', progress: 100, createdAt: new Date().toISOString() },
  { _id: '2', title: 'Design Dashboard UI', description: 'Create a glassmorphic dashboard layout', category: 'Design', priority: 'High', status: 'In Progress', progress: 50, createdAt: new Date().toISOString() },
  { _id: '3', title: 'Implement CRUD APIs', description: 'Build NestJS endpoints', category: 'Backend', priority: 'Medium', status: 'Pending', progress: 0, createdAt: new Date().toISOString() },
  { _id: '4', title: 'Kanban Board Component', description: 'Implement drag and drop for task states', category: 'Frontend', priority: 'High', status: 'In Progress', progress: 20, createdAt: new Date().toISOString() },
  { _id: '5', title: 'Setup CI/CD Pipeline', description: 'Github actions for auto deployment', category: 'DevOps', priority: 'Medium', status: 'Pending', progress: 0, createdAt: new Date().toISOString() }
];
