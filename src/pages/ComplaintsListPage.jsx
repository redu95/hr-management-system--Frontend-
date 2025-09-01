"use client"
import { useState } from "react"
import { Box, Button, Heading, HStack, Spinner, Table, Tbody, Td, Th, Thead, Tr, Text, VStack, useToast, Select } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { FaPlus } from "react-icons/fa"
import ComplaintStatusBadge from "../components/common/ComplaintStatusBadge"
import useAuthStore from "../store/authStore"
import { useComplaintsList, useSetComplaintStatus } from "../hooks/useComplaints"

export default function ComplaintsListPage() {
    const [page, setPage] = useState(1)
    const toast = useToast()
    const { user } = useAuthStore()
    // note: avoid useNavigate here to prevent hook errors when rendered outside a Router

    const canUpdateStatus = ["HR", "CEO"].includes(user?.role)
    const { data, isFetching } = useComplaintsList(page)
    const results = Array.isArray(data) ? data : (data?.results || [])

    const setStatus = useSetComplaintStatus()
    const onSetStatus = (id, status) => {
        setStatus.mutate({ id, status }, {
            onSuccess: () => toast({ title: "Status updated", status: "success" }),
            onError: (e) => toast({ title: "Failed to update status", description: e.message, status: "error" }),
        })
    }

    const nextPage = () => {
        if (data?.next) setPage(prev => prev + 1)
    }
    const prevPage = () => {
        if (data?.previous && page > 1) setPage(prev => prev - 1)
    }

    return (
        <VStack align="stretch" spacing={4} padding={4}>
            <HStack justify="space-between">
                <Heading size="md">Complaints & Reports</Heading>
                <Button as={Link} to="/complaints/new" colorScheme="blue" leftIcon={<FaPlus />}>New</Button>
            </HStack>

            <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
                <Table size="sm">
                    <Thead>
                        <Tr>
                            <Th>ID</Th>
                            <Th>Type</Th>
                            <Th>Subject</Th>
                            <Th>Created By</Th>
                            <Th>Target</Th>
                            <Th>Status</Th>
                            <Th>Created</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {isFetching ? (
                            <Tr><Td colSpan={7}><HStack p={4}><Spinner size="sm" /><Text>Loading...</Text></HStack></Td></Tr>
                        ) : results.length === 0 ? (
                            <Tr><Td colSpan={7}><Box p={4}><Text color="gray.500">No complaints</Text></Box></Td></Tr>
                        ) : (
                            results.map((c) => (
                                <Tr key={c.id} _hover={{ bg: "gray.50" }}>
                                    <Td>#{c.id}</Td>
                                    <Td>{c.type?.replace(/_/g, " ")}</Td>
                                    <Td>
                                        <Link to={`/complaints/${c.id}`}>{c.subject}</Link>
                                    </Td>
                                    <Td>{c.created_by ? `${c.created_by.first_name || ''} ${c.created_by.last_name || ''}`.trim() || c.created_by.email : "-"}</Td>
                                    <Td>{c.target_user_detail ? `${c.target_user_detail.first_name || ''} ${c.target_user_detail.last_name || ''}`.trim() || c.target_user_detail.email : "-"}</Td>
                                    <Td>
                                        {canUpdateStatus ? (
                                            <Select size="sm" value={c.status} onChange={(e) => onSetStatus(c.id, e.target.value)} onClick={(e) => e.stopPropagation()}>
                                                <option value="open">open</option>
                                                <option value="in_review">in_review</option>
                                                <option value="resolved">resolved</option>
                                                <option value="dismissed">dismissed</option>
                                            </Select>
                                        ) : (
                                            <ComplaintStatusBadge status={c.status} />
                                        )}
                                    </Td>
                                    <Td>{new Date(c.created_at).toLocaleString()}</Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </Box>

            <HStack justify="space-between">
                <Button onClick={prevPage} isDisabled={!data?.previous || page === 1}>Previous</Button>
                <Text>Page {page}</Text>
                <Button onClick={nextPage} isDisabled={!data?.next}>Next</Button>
            </HStack>
        </VStack>
    )
}
