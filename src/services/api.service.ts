const API_URL = process.env.NEXT_PUBLIC_API_URL;
import { useAuthStore } from '../store/authStore';




async function refreshAccessToken() {

    const response = await fetch(
        `${API_URL}/auth/refresh-token`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error("Refresh token expired");
    }

    useAuthStore.getState().login(useAuthStore.getState().user!, result.accessToken);

    return result.accessToken;
}

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
) {

    let accessToken = useAuthStore.getState().accessToken;

    const makeRequest = async (
        token?: string
    ) => {

        return fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Content-Type": "application/json",

                    ...(options.headers || {}),

                    ...(token
                        ? {
                            Authorization:
                                `Bearer ${token}`,
                        }
                        : {}),
                },

                credentials: "include",
            }
        );
    };

    let response = await makeRequest(
        accessToken || undefined
    );

    // token expired
    if (response.status === 401) {

        try {

            const newAccessToken =
                await refreshAccessToken();

            // retry request
            response = await makeRequest(
                newAccessToken
            );

        } catch (error) {

            useAuthStore.getState().logout();

            window.location.href = "/login";

            throw error;
        }
    }

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Request failed"
        );
    }

    return result;
}