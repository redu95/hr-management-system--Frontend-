import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import ApiService from "../services/apiService"

// Query options to show cached data immediately and refetch in background on remount
const opts = {
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
}

export const complaintsKeys = {
    all: ["complaints"],
    list: (page) => ["complaints", "list", { page: Number(page) || 1 }],
    detail: (id) => ["complaints", "detail", Number(id)],
}

export function useComplaintsList(page = 1) {
    return useQuery({
        queryKey: complaintsKeys.list(page),
        queryFn: () => ApiService.listComplaints({ page }),
        ...opts,
    })
}

export function useComplaint(id) {
    return useQuery({
        queryKey: complaintsKeys.detail(id),
        queryFn: () => ApiService.getComplaint(id),
        enabled: !!id,
        ...opts,
    })
}

export function useCreateComplaint() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload) => ApiService.createComplaint(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: complaintsKeys.all })
        },
    })
}

export function useSetComplaintStatus() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }) => ApiService.setComplaintStatus(id, status),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: complaintsKeys.detail(variables.id) })
            qc.invalidateQueries({ queryKey: complaintsKeys.all })
        },
    })
}
