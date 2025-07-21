import { writable } from 'svelte/store';

const API_URL = import.meta.env.VITE_API_URL;

function createAuthStore() {
    const { subscribe, set, update } = writable({
        user: null,
        token: null,
    });

    return {
        subscribe,
        login: async (email, password) => {
            try {
                console.log("📤 [AUTH] Sending login request with payload:", { email, password }); // Debug log
                const response = await fetch(`${API_URL}/auth/token/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                console.log("📡 [AUTH] Login response status:", response.status); // Debug log

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("❌ [AUTH] Login failed with error:", errorData); // Debug log
                    throw new Error("Login failed");
                }

                const data = await response.json();
                console.log("✅ [AUTH] Login successful:", data); // Debug log
                // ...existing code...
            } catch (error) {
                console.error("💥 [AUTH] Login error:", error); // Debug log
                throw error;
            }
        },
        // ...existing code...
    };
}

export const authStore = createAuthStore();