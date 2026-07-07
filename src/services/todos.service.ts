import { apiFetch } from './api.service';

export const todosService = {
  getTodos: async () => {
    return apiFetch(`/todos`, {
      method: 'GET',
    });
  },

  getRecentTodos: async (page = 1, limit = 10) => {
    return apiFetch(`/todos/recent?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },

  createTodo: async (data: any) => {
    return apiFetch('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTodoById: async (id: string) => {
    return apiFetch(`/todos/${id}`, {
      method: 'GET',
    });
  },

  updateTodo: async (id: string, data: any) => {
    return apiFetch(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patchTodo: async (id: string, data: any) => {
    return apiFetch(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteTodo: async (id: string) => {
    return apiFetch(`/todos/${id}`, {
      method: 'DELETE',
    });
  },

  startTimer: async (id: string) => {
    return apiFetch(`/todos/${id}/timer/start`, {
      method: 'POST',
    });
  },

  stopTimer: async (id: string) => {
    return apiFetch(`/todos/${id}/timer/stop`, {
      method: 'POST',
    });
  },

  addComment: async (id: string, comment: string) => {
    return apiFetch(`/todos/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  markAsRead: async (id: string) => {
    return apiFetch(`/todos/${id}/read`, {
      method: 'PATCH',
    });
  }
};
