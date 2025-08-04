// Centralized API service for all backend calls
class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:8000"
    }

    // Get auth headers with token
    getAuthHeaders() {
        const token = localStorage.getItem("accessToken")
        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
    }

    // Generic API call method
    apiCall = async (endpoint, options = {}) => {
        const url = `${this.baseURL}${endpoint}`
        const config = {
            headers: this.getAuthHeaders(),
            ...options,
        }

        console.log(`🌐 [API] ${config.method || "GET"} ${url}`)

        try {
            const response = await fetch(url, config)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error(`❌ [API] Error calling ${endpoint}:`, error)
            throw error
        }
    }

    // Employee endpoints (now use users endpoint and filter by role)
    getEmployees = async () => {
        const users = await this.apiCall("/api/users/")
        // Filter users with role "Employee"
        if (Array.isArray(users)) {
            return users.filter(u => (u.role || "").toLowerCase() === "employee")
        }
        if (users.results) {
            return users.results.filter(u => (u.role || "").toLowerCase() === "employee")
        }
        return []
    }

    getEmployee = async (id) => {
        // Fetch user and check if role is Employee
        const user = await this.apiCall(`/api/users/${id}/`)
        return (user.role || "").toLowerCase() === "employee" ? user : null
    }

    createEmployee = async (data) => {
        // Set role to Employee
        return this.apiCall("/api/users/", {
            method: "POST",
            body: JSON.stringify({ ...data, role: "Employee" }),
        })
    }

    updateEmployee = async (id, data) => {
        // Only allow update if role is Employee
        return this.apiCall(`/api/users/${id}/`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    }

    deleteEmployee = async (id) => {
        return this.apiCall(`/api/users/${id}/`, {
            method: "DELETE",
        })
    }

    // Department endpoints
    getDepartments = async () => {
        return this.apiCall("/api/departments/")
    }

    getDepartment = async (id) => {
        return this.apiCall(`/api/departments/${id}/`)
    }

    createDepartment = async (data) => {
        return this.apiCall("/api/departments/", {
            method: "POST",
            body: JSON.stringify(data),
        })
    }

    updateDepartment = async (id, data) => {
        return this.apiCall(`/api/departments/${id}/`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    }

    deleteDepartment = async (id) => {
        return this.apiCall(`/api/departments/${id}/`, {
            method: "DELETE",
        })
    }

    // Leave Request endpoints
    getLeaveRequests = async () => {
        // Get all leave requests for CEO/HR/Manager, or only own for Employee
        // The backend should handle this logic, so just call the endpoint
        return this.apiCall("/api/leave-requests/")
    }

    getLeaveRequest = async (id) => {
        return this.apiCall(`/api/leave-requests/${id}/`)
    }

    createLeaveRequest = async (data) => {
        // Remove employee field if present (backend assigns it)
        const { employee, ...payload } = data
        return this.apiCall("/api/leave-requests/", {
            method: "POST",
            body: JSON.stringify(payload),
        })
    }

    updateLeaveRequest = async ({ id, data }) => {
        // Only owner or CEO/HR/Manager can update (backend enforces)
        return this.apiCall(`/api/leave-requests/${id}/`, {
            method: "PATCH",
            body: JSON.stringify(data),
        })
    }

    deleteLeaveRequest = async (id) => {
        // Only owner or CEO/HR/Manager can delete (backend enforces)
        return this.apiCall(`/api/leave-requests/${id}/`, {
            method: "DELETE",
        })
    }

    // User endpoints
    getUsers = async () => {
        return this.apiCall("/api/users/")
    }

    getUser = async (id) => {
        return this.apiCall(`/api/users/${id}/`)
    }

    createUser = async (data) => {
        return this.apiCall("/api/users/", {
            method: "POST",
            body: JSON.stringify(data),
        })
    }

    updateUser = async (id, data) => {
        return this.apiCall(`/api/users/${id}/`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    }

    deleteUser = async (id) => {
        return this.apiCall(`/api/users/${id}/`, {
            method: "DELETE",
        })
    }

    // Fetch current user data
    fetchCurrentUser = async () => {
        const token = localStorage.getItem("accessToken")
        // Update the endpoint below if your backend uses a different path!
        const endpoint = "/api/auth/me/" // <-- Change this to the correct endpoint
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            })

            const contentType = response.headers.get("content-type")
            if (!response.ok) {
                let errorText = await response.text()
                console.error(`[${endpoint}] error response:`, errorText)
                throw new Error(`HTTP ${response.status}: ${errorText}`)
            }
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json()
                console.log(`[${endpoint}] response:`, data)
                return data
            } else {
                const text = await response.text()
                console.error(`[${endpoint}] Non-JSON response:`, text)
                throw new Error("Response is not JSON")
            }
        } catch (error) {
            console.error(`[${endpoint}] error:`, error)
            throw error
        }
    }
}

export default new ApiService()
