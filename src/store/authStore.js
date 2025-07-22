import { create } from "zustand"
import { persist } from "zustand/middleware"

// Decode JWT token to extract user info
const decodeToken = (token) => {
    console.log("🔍 [AUTH] Attempting to decode token:", token?.substring(0, 50) + "...")
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
        const decoded = JSON.parse(jsonPayload)
        console.log("✅ [AUTH] Token decoded successfully:", decoded)
        return decoded
    } catch (error) {
        console.error("❌ [AUTH] Error decoding token:", error)
        return null
    }
}

// Helper function to normalize role names
const normalizeRole = (role) => {
    if (!role) return "Employee"

    const roleString = role.toString().toLowerCase()

    // Map different role variations to standard format
    const roleMap = {
        ceo: "CEO",
        hr: "HR",
        manager: "Manager",
        employee: "Employee",
    }

    return roleMap[roleString] || "Employee"
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
            login: async (emailOrUsername, password) => {
                console.log("🚀 [AUTH] Starting login process for:", emailOrUsername)
                try {
                    // Use the token endpoint that returns JWT tokens
                    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/token/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            identifier: emailOrUsername, // Backend expects 'identifier'
                            password: password,
                        }),
                    })

                    console.log("📡 [AUTH] Login response status:", response.status)

                    if (!response.ok) {
                        const errorData = await response.json()
                        console.error("❌ [AUTH] Login failed with error:", errorData)

                        // Handle different error formats
                        let errorMessage = "Login failed"
                        if (errorData.errors) {
                            // Handle validation errors
                            const errors = Object.values(errorData.errors).flat()
                            errorMessage = errors.join(", ")
                        } else if (errorData.detail) {
                            errorMessage = errorData.detail
                        } else if (errorData.message) {
                            errorMessage = errorData.message
                        } else if (errorData.non_field_errors) {
                            errorMessage = errorData.non_field_errors.join(", ")
                        }

                        throw new Error(errorMessage)
                    }

                    const data = await response.json()
                    console.log("📦 [AUTH] Login response data:", data)

                    // Decode the access token to get user info
                    const decodedToken = decodeToken(data.access)

                    if (!decodedToken) {
                        console.error("❌ [AUTH] Failed to decode token")
                        throw new Error("Invalid token received")
                    }

                    // Check if token is expired
                    const currentTime = Math.floor(Date.now() / 1000)
                    if (decodedToken.exp && decodedToken.exp < currentTime) {
                        console.error("❌ [AUTH] Token is expired:", {
                            exp: decodedToken.exp,
                            current: currentTime,
                            expired: decodedToken.exp < currentTime,
                        })
                        throw new Error("Token is expired")
                    }

                    // Create user object from both token data and response data
                    const user = {
                        id: decodedToken.user_id,
                        username: decodedToken.username || data.username || emailOrUsername,
                        email: decodedToken.email || data.email,
                        role: normalizeRole(decodedToken.role || data.role || "Employee"),
                    }

                    console.log("👤 [AUTH] User object created:", user)

                    // Store in state
                    set({
                        user,
                        accessToken: data.access,
                        refreshToken: data.refresh,
                        isAuthenticated: true,
                    })

                    // Also store in localStorage for compatibility
                    localStorage.setItem("accessToken", data.access)
                    localStorage.setItem("refreshToken", data.refresh)
                    localStorage.setItem("user", JSON.stringify(user))
                    localStorage.setItem("isAuthenticated", "true")

                    console.log("✅ [AUTH] Login successful, state updated")
                    console.log("💾 [AUTH] Tokens and user data stored in localStorage")

                    // Verify state was set correctly
                    const currentState = get()
                    console.log("🔍 [AUTH] Current auth state after login:", {
                        isAuthenticated: currentState.isAuthenticated,
                        user: currentState.user,
                        hasToken: !!currentState.accessToken,
                    })

                    return { success: true, user }
                } catch (error) {
                    console.error("💥 [AUTH] Login error:", error)
                    throw error
                }
            },

            register: async (userData) => {
                console.log("📝 [AUTH] Starting registration for:", userData.username)
                try {
                    const { accessToken } = get()
                    console.log("🔑 [AUTH] Using access token for registration:", !!accessToken)

                    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/register/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                        },
                        body: JSON.stringify(userData),
                    })

                    console.log("📡 [AUTH] Registration response status:", response.status)

                    if (!response.ok) {
                        const errorData = await response.json()
                        console.error("❌ [AUTH] Registration failed:", errorData)

                        let errorMessage = "Registration failed"
                        if (errorData.errors) {
                            const errors = Object.values(errorData.errors).flat()
                            errorMessage = errors.join(", ")
                        } else if (errorData.detail) {
                            errorMessage = errorData.detail
                        } else if (errorData.message) {
                            errorMessage = errorData.message
                        }

                        throw new Error(errorMessage)
                    }

                    const result = await response.json()
                    console.log("✅ [AUTH] Registration successful:", result)
                    return result
                } catch (error) {
                    console.error("💥 [AUTH] Registration error:", error)
                    throw error
                }
            },

            logout: () => {
                console.log("🚪 [AUTH] Logging out user")
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                })
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("user")
                localStorage.removeItem("isAuthenticated")
                console.log("✅ [AUTH] Logout complete, state cleared")
            },

            // Token refresh function
            refreshAccessToken: async () => {
                console.log("🔄 [AUTH] Attempting to refresh access token")
                const { refreshToken } = get()

                if (!refreshToken) {
                    console.log("❌ [AUTH] No refresh token available")
                    get().logout()
                    return null
                }

                try {
                    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/token/refresh/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refresh: refreshToken }),
                    })

                    if (!response.ok) {
                        console.log("❌ [AUTH] Token refresh failed")
                        get().logout()
                        return null
                    }

                    const data = await response.json()
                    console.log("✅ [AUTH] Token refreshed successfully")

                    // Update tokens
                    set({ accessToken: data.access })
                    localStorage.setItem("accessToken", data.access)

                    return data.access
                } catch (error) {
                    console.error("💥 [AUTH] Token refresh error:", error)
                    get().logout()
                    return null
                }
            },

            // Permission helpers
            hasPermission: (permission) => {
                const { user, permissions } = get()
                console.log("🔐 [AUTH] Checking permission:", permission, "for user:", user?.role)
                if (!user || !user.role) {
                    console.log("❌ [AUTH] No user or role found")
                    return false
                }
                const hasAccess = permissions[user.role]?.[permission] || false
                console.log("🔍 [AUTH] Permission result:", hasAccess)
                return hasAccess
            },

            canAccess: (route) => {
                const { user } = get()
                console.log("🛣️ [AUTH] Checking route access:", route, "for user:", user?.role)

                if (!user) {
                    console.log("❌ [AUTH] No user found for route access")
                    return false
                }

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
                if (!requiredPermission) {
                    console.log("✅ [AUTH] Route has no specific permission requirement")
                    return true
                }

                const canAccess = get().hasPermission(requiredPermission)
                console.log("🔍 [AUTH] Route access result:", canAccess)
                return canAccess
            },

            // Initialize auth from stored tokens
            initializeAuth: () => {
                console.log("🔄 [AUTH] Initializing authentication from storage")

                const token = localStorage.getItem("accessToken")
                const refreshToken = localStorage.getItem("refreshToken")
                const storedUser = localStorage.getItem("user")

                console.log("💾 [AUTH] Found data in localStorage:", {
                    hasAccessToken: !!token,
                    hasRefreshToken: !!refreshToken,
                    hasUser: !!storedUser,
                })

                if (token && storedUser) {
                    const decodedToken = decodeToken(token)

                    if (decodedToken) {
                        const currentTime = Math.floor(Date.now() / 1000)
                        const isExpired = decodedToken.exp && decodedToken.exp < currentTime

                        console.log("⏰ [AUTH] Token expiration check:", {
                            exp: decodedToken.exp,
                            current: currentTime,
                            isExpired,
                        })

                        if (!isExpired) {
                            try {
                                const storedUserData = JSON.parse(storedUser)
                                // Normalize the role when restoring from storage
                                const user = {
                                    ...storedUserData,
                                    role: normalizeRole(storedUserData.role),
                                }
                                console.log("👤 [AUTH] Restoring user from storage:", user)

                                set({
                                    user,
                                    accessToken: token,
                                    refreshToken: refreshToken,
                                    isAuthenticated: true,
                                })

                                console.log("✅ [AUTH] Authentication restored successfully")

                                // Verify state after initialization
                                const currentState = get()
                                console.log("🔍 [AUTH] State after initialization:", {
                                    isAuthenticated: currentState.isAuthenticated,
                                    user: currentState.user,
                                    hasToken: !!currentState.accessToken,
                                })

                                return
                            } catch (error) {
                                console.error("❌ [AUTH] Failed to parse stored user data:", error)
                            }
                        } else {
                            console.log("⚠️ [AUTH] Token is expired, attempting refresh")
                            // Try to refresh the token
                            get().refreshAccessToken()
                            return
                        }
                    } else {
                        console.log("❌ [AUTH] Failed to decode stored token")
                    }

                    // Token expired or invalid, clear everything
                    get().logout()
                } else {
                    console.log("ℹ️ [AUTH] No stored authentication data found")
                }
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => {
                console.log("💾 [AUTH] Persisting state:", {
                    hasUser: !!state.user,
                    isAuthenticated: state.isAuthenticated,
                    hasAccessToken: !!state.accessToken,
                })
                return {
                    user: state.user,
                    accessToken: state.accessToken,
                    refreshToken: state.refreshToken,
                    isAuthenticated: state.isAuthenticated,
                }
            },
            onRehydrateStorage: () => (state) => {
                console.log("🔄 [AUTH] Rehydrating from persisted storage:", {
                    hasState: !!state,
                    isAuthenticated: state?.isAuthenticated,
                    hasUser: !!state?.user,
                })
            },
        },
    ),
)

export default useAuthStore
