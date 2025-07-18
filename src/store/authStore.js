import { create } from "zustand"
import { persist } from "zustand/middleware"

// Decode JWT token to extract user info
const decodeToken = (token) => {
    try {
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join(""),
        )
        return JSON.parse(jsonPayload)
    } catch (error) {
        console.error("Error decoding token:", error)
        return null
    }
}

const useAuthStore = create(
    persist(
        (set, get) => ({
            // Auth state
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            // Role-based permissions
            permissions: {
                CEO: {
                    canViewDashboard: true,
                    canManageEmployees: true,
                    canManageDepartments: true,
                    canManageLeave: true,
                    canViewReports: true,
                    canManageSettings: true,
                    canRegisterUsers: true,
                    canViewAllData: true,
                },
                Manager: {
                    canViewDashboard: true,
                    canManageEmployees: true,
                    canManageDepartments: false,
                    canManageLeave: true,
                    canViewReports: true,
                    canManageSettings: false,
                    canRegisterUsers: false,
                    canViewAllData: false,
                },
                HR: {
                    canViewDashboard: true,
                    canManageEmployees: true,
                    canManageDepartments: true,
                    canManageLeave: true,
                    canViewReports: true,
                    canManageSettings: true,
                    canRegisterUsers: true,
                    canViewAllData: true,
                },
                Employee: {
                    canViewDashboard: true,
                    canManageEmployees: false,
                    canManageDepartments: false,
                    canManageLeave: false, // Can only request leave, not manage
                    canViewReports: false,
                    canManageSettings: false,
                    canRegisterUsers: false,
                    canViewAllData: false,
                },
            },

            // Actions
            login: async (username, password) => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/token/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, password }),
                    })

                    if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.detail || "Login failed")
                    }

                    const data = await response.json()
                    const decodedToken = decodeToken(data.access)
                    console.log("decoded token", decodedToken);

                    if (!decodedToken) {
                        throw new Error("Invalid token received")
                    }

                    const user = {
                        id: decodedToken.user_id,
                        username: decodedToken.username || username,
                        role: decodedToken.role || "Employee",
                        email: decodedToken.email,
                    }

                    set({
                        user,
                        accessToken: data.access,
                        refreshToken: data.refresh,
                        isAuthenticated: true,
                    })

                    // Also store in localStorage for compatibility
                    localStorage.setItem("accessToken", data.access)
                    localStorage.setItem("refreshToken", data.refresh)

                    return { success: true, user }
                } catch (error) {
                    console.error("Login error:", error)
                    throw error
                }
            },

            register: async (userData) => {
                try {
                    const { accessToken } = get()
                    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/register/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                        },
                        body: JSON.stringify(userData),
                    })

                    if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.detail || "Registration failed")
                    }

                    return await response.json()
                } catch (error) {
                    console.error("Registration error:", error)
                    throw error
                }
            },

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                })
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
            },

            // Permission helpers
            hasPermission: (permission) => {
                const { user, permissions } = get()
                if (!user || !user.role) return false
                return permissions[user.role]?.[permission] || false
            },

            canAccess: (route) => {
                const { user } = get()
                if (!user) return false

                const routePermissions = {
                    "/dashboard": "canViewDashboard",
                    "/employees": "canManageEmployees",
                    "/departments": "canManageDepartments",
                    "/leave": "canManageLeave",
                    "/reports": "canViewReports",
                    "/settings": "canManageSettings",
                    "/register": "canRegisterUsers",
                }

                const requiredPermission = routePermissions[route]
                return requiredPermission ? get().hasPermission(requiredPermission) : true
            },

            // Initialize auth from stored tokens
            initializeAuth: () => {
                const token = localStorage.getItem("accessToken")
                if (token) {
                    const decodedToken = decodeToken(token)
                    if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                        const user = {
                            id: decodedToken.user_id,
                            username: decodedToken.username,
                            role: decodedToken.role || "Employee",
                            email: decodedToken.email,
                        }
                        set({
                            user,
                            accessToken: token,
                            refreshToken: localStorage.getItem("refreshToken"),
                            isAuthenticated: true,
                        })
                    } else {
                        // Token expired, clear everything
                        get().logout()
                    }
                }
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
)

export default useAuthStore
