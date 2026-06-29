import { apiFetch } from './api.service';

export const usersService = {
  getUsers: async (page: number = 1, limit: number = 10) => {
    return apiFetch(`/users?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },

  createUser: async (data: any) => {
    return apiFetch('/users/create-user', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAllUsers: async (page: number = 1, limit: number = 10) => {
    return apiFetch(`/users/all-users?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }
};
