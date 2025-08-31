import { useQuery } from "@tanstack/react-query"
import ApiService from "../services/apiService"

const baseOpts = {
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
}

export const analyticsKeys = {
    base: ["analytics"],
    headcount: ["analytics", "headcount-by-dept"],
    hiresExits: (months) => ["analytics", "hires-vs-exits", { months }],
    leaveStatus: (days) => ["analytics", "leave-status", { days }],
    tasksPipeline: (department_id) => ["analytics", "tasks-pipeline", { department_id: department_id ?? null }],
    perfAvg: ["analytics", "performance-avg-by-dept"],
}

export function useHeadcountByDept() {
    return useQuery({
        queryKey: analyticsKeys.headcount,
        queryFn: () => ApiService.analyticsHeadcountByDepartment(),
        ...baseOpts,
    })
}

export function useHiresVsExits(months = 6) {
    return useQuery({
        queryKey: analyticsKeys.hiresExits(months),
        queryFn: () => ApiService.analyticsHiresVsExits({ months }),
        ...baseOpts,
    })
}

export function useLeaveStatus(days = 90) {
    return useQuery({
        queryKey: analyticsKeys.leaveStatus(days),
        queryFn: () => ApiService.analyticsLeaveStatus({ days }),
        ...baseOpts,
    })
}

export function useTasksPipeline(department_id) {
    return useQuery({
        queryKey: analyticsKeys.tasksPipeline(department_id),
        queryFn: () => ApiService.analyticsTasksPipeline({ department_id }),
        ...baseOpts,
    })
}

export function usePerfAvgByDept() {
    return useQuery({
        queryKey: analyticsKeys.perfAvg,
        queryFn: () => ApiService.analyticsPerformanceAvgByDepartment(),
        ...baseOpts,
    })
}
