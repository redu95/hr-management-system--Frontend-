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
    async apiCall(endpoint, options = {}) {
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

    // Employee endpoints
    async getEmployees() {
        return this.apiCall("/api/employees/")
    }

    async getEmployee(id) {
        return this.apiCall(`/api/employees/${id}/`)
    }

    async createEmployee(data) {
        return this.apiCall("/api/employees/", {
            method: "POST",
            body: JSON.stringify(data),
        })
    }

    async updateEmployee(id, data) {
        return this.apiCall(`/api/employees/${id}/`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    }

    async deleteEmployee(id) {
        return this.apiCall(`/api/employees/${id}/`, {
            method: "DELETE",
        })
    }

    // Department endpoints
    async getDepartments() {
        return this.apiCall("/api/departments/")
    }

    async getDepartment(id) {
        return this.apiCall(`/api/departments/${id}/`)
    }

    async createDepartment(data) {
        return this.apiCall("/api/departments/", {
            method: "POST",
            body: JSON.stringify(data),
        })
    }

    async updateDepartment(id, data) {
        return this.apiCall(`/api/departments/${id}/`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    }

    async deleteDepartment(id) {
        return this.apiCall(`/api/departments/${id}/`, {
            method: "DELETE",
        })
    }

    // Leave Request endpoints
    async getLeaveRequests() {
        return this.apiCall("/api/leave-requests/")
    }

    async getLeaveRequest(id) {
        return this.apiCall(`/api/leave-requests/${id}/`)
    }

    async createLeaveRequest(data) {
        return this.apiCall("/api/leave-requests/", {
            method: "POST",
            body: JSON.stringify(data),
        })
    }

    async updateLeaveRequest(id, data) {
        return this.apiCall(`/api/leave-requests/${id}/`, {
            method: "PATCH",
            body: JSON.stringify(data),
        })
    }

    async deleteLeaveRequest(id) {
        return this.apiCall(`/api/leave-requests/${id}/`, {
            method: "DELETE",
        })
    }

    // User endpoints
    async getUsers() {
        return this.apiCall("/api/users/")
    }

    async getUser(id) {
        return this.apiCall(`/api/users/${id}/`)
    }

    async createUser(data) {
        return this.apiCall("/api/users/", {
            method: "POST",
            body: JSON.stringify(data),
        })
    }

    async updateUser(id, data) {
        return this.apiCall(`/api/users/${id}/`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    }

    async deleteUser(id) {
        return this.apiCall(`/api/users/${id}/`, {
            method: "DELETE",
        })
    }
}

export default new ApiService()
