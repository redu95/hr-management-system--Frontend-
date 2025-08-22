// Centralized API service for all backend calls
class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:8000"
    }

    // Get auth headers with token
    getAuthHeaders(contentType = "application/json") {
        const token = localStorage.getItem("accessToken")
        const headers = {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
        if (contentType) headers["Content-Type"] = contentType
        return headers
    }

    // Generic API call method
    apiCall = async (endpoint, options = {}) => {
        // Normalize baseURL + endpoint to avoid double slashes
        const joinUrl = (base, ep) => {
            if (!base) return ep
            const b = String(base).replace(/\/+$|\s+$/g, '')
            const e = String(ep || '')
            if (e.startsWith('/')) return `${b}${e}`
            return `${b}/${e.replace(/^\/+/, '')}`
        }
        const url = joinUrl(this.baseURL, endpoint)
        const { isFormData = false, headers: extraHeaders, ...rest } = options
        const headers = { ...this.getAuthHeaders(isFormData ? null : "application/json"), ...(extraHeaders || {}) }
        const config = { headers, ...rest }

        console.log(`🌐 [API] ${config.method || "GET"} ${url}`)

        try {
            const response = await fetch(url, config)
            // If access token expired or unauthorized, clear auth and redirect to login
            if (response.status === 401) {
                console.error(`❌ [API] Unauthorized (${endpoint}), redirecting to login`)
                // Clear stored tokens and user info
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("user")
                localStorage.removeItem("isAuthenticated")
                // Redirect to login page
                window.location.href = "/login"
                // Stop further handling
                return
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const err = new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
                // Attach useful metadata so callers can make decisions based on backend payload
                err.status = response.status
                err.data = errorData
                err.url = url
                throw err
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
        console.log("Fetching leave request:")
        console.log("endpoint: /api/leaves/leave-requests/")
        return this.apiCall("/api/leaves/leave-requests/")
    }

    getLeaveRequest = async (id) => {
        return this.apiCall(`/api/leaves/leave-requests/${id}/`)
    }

    createLeaveRequest = async (data) => {
        // If an explicit employee id is provided (e.g. HR creating on behalf of someone), keep it.
        // Otherwise (self-service), just send start_date/end_date/reason.
        const { start_date, end_date, reason, employee } = data || {}
        const payload = {
            start_date,
            end_date,
            reason,
            ...(employee ? { employee } : {}),
        }
        return this.apiCall("/api/leaves/leave-requests/", {
            method: "POST",
            body: JSON.stringify(payload),
        })
    }

    updateLeaveRequest = async ({ id, data }) => {
        // Only owner or CEO/HR/Manager can update (backend enforces)
        return this.apiCall(`/api/leaves/leave-requests/${id}/`, {
            method: "PATCH",
            body: JSON.stringify(data),
        })
    }

    deleteLeaveRequest = async (id) => {
        // Only owner or CEO/HR/Manager can delete (backend enforces)
        return this.apiCall(`/api/leaves/leave-requests/${id}/`, {
            method: "DELETE",
        })
    }

    // User endpoints
    getUsers = async () => {
        return this.apiCall("/api/users/")
    }

    // Generic user search with query params (e.g. { role: 'employee', ordering: '-id' })
    searchUsers = async (params = {}) => {
        const query = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") query.append(k, v)
        })
        const qs = query.toString()
        return this.apiCall(`/api/users/${qs ? `?${qs}` : ""}`)
    }

    // Fetch managers only
    getManagers = async () => {
        const data = await this.searchUsers({ role: 'manager' })
        if (Array.isArray(data)) return data
        if (data?.results) return data.results
        return []
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

    // Promote / Demote user role (CEO/HR only backend enforced)
    promoteUser = async (id) => {
        return this.apiCall(`/api/users/${id}/promote/`, {
            method: 'POST',
            body: JSON.stringify({}),
        })
    }

    demoteUser = async (id) => {
        return this.apiCall(`/api/users/${id}/demote/`, {
            method: 'POST',
            body: JSON.stringify({}),
        })
    }

    // Added method for employees to update their own profile.
    updateCurrentUser = async (data) => {
        return this.apiCall("/api/auth/me/", {
            method: "PATCH",
            body: JSON.stringify(data),
        })
    }

    // Change password (authenticated)
    changePassword = async ({ old_password, new_password }) => {
        return this.apiCall("/api/auth/change-password/", {
            method: "POST",
            body: JSON.stringify({ old_password, new_password }),
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

    // Attendance: monthly summary
    getMonthlyAttendance = async (params = {}) => {
        // params: { month, year, employee, user, department, ... }
        const query = new URLSearchParams()
        const now = new Date()
        const month = params.month ?? now.getMonth() + 1
        const year = params.year ?? now.getFullYear()
        query.append("month", month)
        query.append("year", year)
        // append any other provided filters (employee/user/department)
        Object.entries(params).forEach(([k, v]) => {
            if (["month", "year"].includes(k)) return
            if (v !== undefined && v !== null && v !== "") query.append(k, v)
        })
        const qs = query.toString()
        return this.apiCall(`/api/attendance/monthly-summary/${qs ? `?${qs}` : ""}`)
    }
}

export default new ApiService()
