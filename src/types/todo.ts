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
  subTasks?: {
    _id?: string;
    title: string;
    isCompleted: boolean;
  }[];
}


