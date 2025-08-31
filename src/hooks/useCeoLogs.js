import { useQuery } from "@tanstack/react-query"
import ApiService from "../services/apiService"

export const ceoLogsKeys = {
    list: (page, filters) => ["ceo-logs", { page: Number(page) || 1, ...(filters || {}) }],
}

export function useCeoLogs(page = 1, filters = {}) {
    return useQuery({
        queryKey: ceoLogsKeys.list(page, filters),
        queryFn: () => ApiService.getCeoLogs({ page, ...filters }),
        staleTime: 30_000,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    })
}
