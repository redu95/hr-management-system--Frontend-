import { useQuery, useQueryClient } from '@tanstack/react-query'
import ApiService from '../services/apiService'

// Fetch & cache departments
export const useDepartments = (options = {}) => {
    return useQuery({
        queryKey: ['departments'],
        queryFn: () => ApiService.getDepartments().then(d => Array.isArray(d) ? d : d.results || []),
        ...options,
    })
}

// Fetch & cache employees (role=employee)
export const useEmployees = (options = {}) => {
    return useQuery({
        queryKey: ['employees'],
        queryFn: () => ApiService.getEmployees().then(d => Array.isArray(d) ? d : d.results || []),
        ...options,
    })
}

// Fetch & cache managers
export const useManagers = (options = {}) => {
    return useQuery({
        queryKey: ['managers'],
        queryFn: () => ApiService.getManagers().then(d => Array.isArray(d) ? d : d.results || []),
        ...options,
    })
}

// Prefetch helper (e.g., on sidebar hover) to warm cache
export const usePrefetchDirectory = () => {
    const qc = useQueryClient()
    return () => {
        qc.prefetchQuery({ queryKey: ['departments'], queryFn: () => ApiService.getDepartments().then(d => Array.isArray(d) ? d : d.results || []) })
        qc.prefetchQuery({ queryKey: ['employees'], queryFn: () => ApiService.getEmployees().then(d => Array.isArray(d) ? d : d.results || []) })
        qc.prefetchQuery({ queryKey: ['managers'], queryFn: () => ApiService.getManagers().then(d => Array.isArray(d) ? d : d.results || []) })
    }
}
