import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ApiService from './apiService'

// Raw API helpers
const listTasks = async (params = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, v)
    })
    const qs = query.toString()
    return ApiService.apiCall(`/api/tasks/${qs ? `?${qs}` : ''}`)
}

const getTask = (id) => ApiService.apiCall(`/api/tasks/${id}/`)

const createTask = (payload) =>
    ApiService.apiCall(`/api/tasks/`, { method: 'POST', body: JSON.stringify(payload) })

const updateTask = ({ id, data }) =>
    ApiService.apiCall(`/api/tasks/${id}/`, { method: 'PATCH', body: JSON.stringify(data) })

const deleteTask = (id) => ApiService.apiCall(`/api/tasks/${id}/`, { method: 'DELETE' })

const assignTask = ({ id, assignees }) =>
    ApiService.apiCall(`/api/tasks/${id}/assign/`, { method: 'POST', body: JSON.stringify({ assignees }) })

const unassignTask = ({ id, assignees }) =>
    ApiService.apiCall(`/api/tasks/${id}/unassign/`, { method: 'POST', body: JSON.stringify({ assignees }) })

const markDone = (id) => ApiService.apiCall(`/api/tasks/${id}/mark_done/`, { method: 'POST' })

const listComments = (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return ApiService.apiCall(`/api/task-comments/${q ? `?${q}` : ''}`)
}

const createComment = ({ task, content }) =>
    ApiService.apiCall(`/api/task-comments/`, { method: 'POST', body: JSON.stringify({ task, content }) })

const listAttachments = (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return ApiService.apiCall(`/api/task-attachments/${q ? `?${q}` : ''}`)
}

const uploadAttachment = ({ task, file }) => {
    const form = new FormData()
    form.append('task', task)
    form.append('file', file)
    return ApiService.apiCall(`/api/task-attachments/`, { method: 'POST', body: form, isFormData: true })
}

// Assignment history
const listAssignmentHistory = (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return ApiService.apiCall(`/api/task-assignments/${q ? `?${q}` : ''}`)
}

// React Query hooks
export const useTasks = (params = {}) =>
    useQuery({ queryKey: ['tasks', params], queryFn: () => listTasks(params), keepPreviousData: true })

export const useTask = (id) => useQuery({ queryKey: ['task', id], queryFn: () => getTask(id), enabled: !!id })

export const useCreateTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createTask,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    })
}

export const useUpdateTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: updateTask,
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ['tasks'] })
            if (vars?.id) qc.invalidateQueries({ queryKey: ['task', vars.id] })
        },
    })
}

export const useDeleteTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteTask,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    })
}

export const useAssignTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: assignTask,
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ['tasks'] })
            if (vars?.id) qc.invalidateQueries({ queryKey: ['task', vars.id] })
        },
    })
}

export const useUnassignTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: unassignTask,
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ['tasks'] })
            if (vars?.id) qc.invalidateQueries({ queryKey: ['task', vars.id] })
        },
    })
}

export const useMarkDone = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: markDone,
        onSuccess: (_data, id) => {
            qc.invalidateQueries({ queryKey: ['tasks'] })
            if (id) qc.invalidateQueries({ queryKey: ['task', id] })
        },
    })
}

export const useTaskComments = (params = {}) =>
    useQuery({ queryKey: ['task-comments', params], queryFn: () => listComments(params), enabled: !!params.task })

export const useCreateComment = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createComment,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['task-comments'] }),
    })
}

export const useTaskAttachments = (params = {}) =>
    useQuery({ queryKey: ['task-attachments', params], queryFn: () => listAttachments(params), enabled: !!params.task })

export const useUploadAttachment = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: uploadAttachment,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['task-attachments'] }),
    })
}

export const useTaskAssignmentHistory = (params = {}) =>
    useQuery({ queryKey: ['task-assignments', params], queryFn: () => listAssignmentHistory(params), enabled: !!params.task })

export default {
    listTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    unassignTask,
    markDone,
    listComments,
    createComment,
    listAttachments,
    uploadAttachment,
    listAssignmentHistory,
}
