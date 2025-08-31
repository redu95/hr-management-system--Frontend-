import { useQuery } from "@tanstack/react-query"
import ApiService from "../services/apiService"

export const meKey = ["auth", "me"]

export default function useMe() {
    return useQuery({
        queryKey: meKey,
        queryFn: () => ApiService.fetchCurrentUser(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    })
}
