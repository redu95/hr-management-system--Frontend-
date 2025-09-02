"use client"

import { useMemo, useState } from "react"
import { Box, Button, Card, CardBody, Container, Grid, Heading, HStack, Input, Text, VStack, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react"
import { FaListAlt } from "react-icons/fa"
import { useCeoLogs } from "../hooks/useCeoLogs"
import useAuthStore from "../store/authStore"

export default function SystemLogsPage() {
    const { user } = useAuthStore()
    const isCeo = (user?.role || "").toLowerCase() === "ceo"
    const textColor = useColorModeValue("gray.600", "gray.300")
    const cardBg = useColorModeValue("white", "gray.800")

    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState({ action: "", actor: "", path: "" })
    const { data, isFetching } = useCeoLogs(page, filters)
    const rows = useMemo(() => (Array.isArray(data?.results) ? data.results : []), [data])

    if (!isCeo) {
        return (
            <VStack p={8} align="start" spacing={3}>
                <Heading size="md">System Logs</Heading>
                <Text color={textColor}>Only CEOs can view this page.</Text>
            </VStack>
        )
    }

    return (
        <Container maxW="7xl" py={8}>
            <VStack align="start" spacing={2} mb={4}>
                <Heading size="lg" color="blue.600"><HStack><FaListAlt /><Text>System Logs</Text></HStack></Heading>
                <Text color={textColor}>Recent API actions across the platform. Filters apply on server side.</Text>
            </VStack>

            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={4} maxW="4xl">
                <Box>
                    <Text fontSize="sm" color={textColor} mb={1}>Action</Text>
                    <Input placeholder="api_call, user_disabled..." value={filters.action} onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))} />
                </Box>
                <Box>
                    <Text fontSize="sm" color={textColor} mb={1}>Actor (email contains)</Text>
                    <Input placeholder="actor@example.com" value={filters.actor} onChange={(e) => setFilters(f => ({ ...f, actor: e.target.value }))} />
                </Box>
                <Box>
                    <Text fontSize="sm" color={textColor} mb={1}>Path contains</Text>
                    <Input placeholder="/api/users/" value={filters.path} onChange={(e) => setFilters(f => ({ ...f, path: e.target.value }))} />
                </Box>
            </Grid>

            <Card bg={cardBg} shadow="md">
                <CardBody p={0}>
                    <Box overflowX="auto">
                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Timestamp</Th>
                                    <Th>Actor</Th>
                                    <Th>Action</Th>
                                    <Th>Summary</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {isFetching && (
                                    <Tr>
                                        <Td colSpan={4}><Text color={textColor}>Loading...</Text></Td>
                                    </Tr>
                                )}
                                {!isFetching && rows.map((row) => (
                                    <Tr key={row.id}>
                                        <Td>{new Date(row.timestamp).toLocaleString()}</Td>
                                        <Td>{row.actor_email || "-"}</Td>
                                        <Td>{row.action || "api_call"}</Td>
                                        <Td>{row.summary || `${row.method} ${row.path} -> ${row.status_code}`}</Td>
                                    </Tr>
                                ))}
                                {!isFetching && rows.length === 0 && (
                                    <Tr>
                                        <Td colSpan={4}><Text color={textColor}>No logs.</Text></Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                </CardBody>
            </Card>

            <HStack mt={4}>
                <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} isDisabled={!data?.previous}>Previous</Button>
                <Text color={textColor}>Page {page}</Text>
                <Button variant="outline" onClick={() => setPage(p => (data?.next ? p + 1 : p))} isDisabled={!data?.next}>Next</Button>
            </HStack>
        </Container>
    )
}
