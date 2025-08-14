import { QueryClient } from '@tanstack/react-query'

// Centralized QueryClient with sensible defaults to avoid excessive refetching
// Adjust staleTime per query where needed; override per useQuery where necessary.
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 30 * 60 * 1000,   // garbage collect after 30 mins idle
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            retry: 2,
        },
        mutations: { retry: 1 },
    },
})

export default queryClient
