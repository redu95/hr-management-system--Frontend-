"use client"
import { useEffect, useMemo, useState } from 'react'
import { Box, Input, List, ListItem, Spinner, Text, VStack } from '@chakra-ui/react'
import ApiService from '../../services/apiService'

export default function UserPicker({ onSelect, placeholder = 'Search users by name/email', autoFocus = false, departmentId = null, role = 'employee' }) {
    const [q, setQ] = useState('')
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState([])
    const [error, setError] = useState('')

        const fetchUsers = async (query) => {
        setLoading(true)
        setError('')
        try {
                const params = {}
                if (query) params.search = query
                if (departmentId) params.department = departmentId
                if (role) params.role = role
                const data = await ApiService.searchUsers(params)
            const results = Array.isArray(data) ? data : data?.results || []
            setItems(results)
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const id = setTimeout(() => fetchUsers(q), 300)
        return () => clearTimeout(id)
    }, [q])

        useEffect(() => { fetchUsers('') }, [departmentId, role])

    return (
        <VStack align="stretch" spacing={2}>
            <Input placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} autoFocus={autoFocus} />
            <Box borderWidth="1px" borderRadius="md" maxH="220px" overflowY="auto">
                {loading ? (
                    <Box p={3}><Spinner size="sm" /></Box>
                ) : error ? (
                    <Box p={3}><Text color="red.400">{error}</Text></Box>
                ) : items.length === 0 ? (
                    <Box p={3}><Text color="gray.500">No users</Text></Box>
                ) : (
                    <List>
                        {items.map((u) => (
                            <ListItem key={u.id} p={2} _hover={{ bg: 'gray.100' }} cursor="pointer" onClick={() => onSelect?.(u)}>
                                <Text fontWeight="medium">{u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.username || `User ${u.id}`}</Text>
                                <Text fontSize="xs" color="gray.500">{u.email} • {u.role}</Text>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </VStack>
    )
}
