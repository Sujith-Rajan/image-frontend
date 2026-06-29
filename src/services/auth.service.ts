const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
import { useAuthStore } from '../store/authStore';

export const authService = {
    signup: async (data: any) => {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Something went wrong during signup');
        }
        return result;
    },

    // Stub for future login implementation
    login: async (data: any) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Something went wrong during login');
        }

        useAuthStore.getState().login(result.user, result.accessToken);

        return result;
    },

    logout: async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {
            console.error('Logout request failed', e);
        }
        useAuthStore.getState().logout();
        window.location.href = "/login";
    }
};
