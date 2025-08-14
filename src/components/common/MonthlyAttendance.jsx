import React, { useMemo, useState } from 'react'
import {
    Box,
    HStack,
    VStack,
    Text,
    Select,
    IconButton,
    useColorModeValue,
    Badge,
    Tooltip,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Divider,
    Spinner,
} from '@chakra-ui/react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as CTooltip, Legend } from 'chart.js'
import ApiService from '../../services/apiService'
import useAuthStore from '../../store/authStore'
import { useQuery } from '@tanstack/react-query'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, CTooltip, Legend)

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatHMS = (hms) => (hms || '').split('.')[0] || '-'

const MonthlyAttendance = ({ title = 'Monthly Attendance', employeeId = null, departmentId = null, compact = false }) => {
    const cardBg = useColorModeValue('white', 'gray.800')
    const subtext = useColorModeValue('gray.600', 'gray.300')
    const border = useColorModeValue('gray.100', 'gray.700')
    const { user } = useAuthStore()

    const now = new Date()
    const [month, setMonth] = useState(now.getMonth() + 1)
    const [year, setYear] = useState(now.getFullYear())

    const queryKey = useMemo(() => ['attendance-monthly', { month, year, employeeId, departmentId }], [month, year, employeeId, departmentId])
    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey,
        queryFn: async () => {
            const params = { month, year }
            if (employeeId) params.employee = employeeId
            if (departmentId) params.department = departmentId
            return ApiService.getMonthlyAttendance(params)
        },
    })

    const days = useMemo(() => {
        const d = new Date(year, month, 0).getDate()
        return Array.from({ length: d }, (_, i) => i + 1)
    }, [month, year])

    const recordsByDay = useMemo(() => {
        const map = {}
            ; (data?.records || []).forEach(r => {
                const day = Number(String(r.date).split('-')[2])
                map[day] = r
            })
        return map
    }, [data])

    const totalHours = data?.stats?.total_hours ?? 0
    const present = data?.stats?.present ?? 0
    const absent = data?.stats?.absent ?? 0
    const leave = data?.stats?.leave ?? 0

    const barData = {
        labels: days.map(d => String(d)),
        datasets: [
            {
                label: 'Hours',
                data: days.map(d => recordsByDay[d]?.total_hours || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    }

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
    }

    const moveMonth = (delta) => {
        const d = new Date(year, month - 1 + delta, 1)
        setMonth(d.getMonth() + 1)
        setYear(d.getFullYear())
    }

    return (
        <Box bg={cardBg} p={compact ? 4 : 6} borderRadius="xl" shadow="lg" borderWidth="1px" borderColor={border}>
            <HStack justify="space-between" mb={4} align="center">
                <Text fontWeight="bold">{title}</Text>
                <HStack>
                    <IconButton aria-label="Prev" size="sm" icon={<FaChevronLeft />} onClick={() => moveMonth(-1)} />
                    <HStack>
                        <Select size="sm" value={month} onChange={(e) => setMonth(Number(e.target.value))} w="auto">
                            {monthNames.map((m, idx) => (
                                <option value={idx + 1} key={m}>{m}</option>
                            ))}
                        </Select>
                        <Select size="sm" value={year} onChange={(e) => setYear(Number(e.target.value))} w="auto">
                            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 3 + i).map(y => (
                                <option value={y} key={y}>{y}</option>
                            ))}
                        </Select>
                    </HStack>
                    <IconButton aria-label="Next" size="sm" icon={<FaChevronRight />} onClick={() => moveMonth(1)} />
                </HStack>
            </HStack>

            {/* KPI badges */}
            <HStack spacing={3} mb={4}>
                <Badge colorScheme="blue">Total Hours: {totalHours?.toFixed ? totalHours.toFixed(2) : totalHours}</Badge>
                <Badge colorScheme="green">Present: {present}</Badge>
                <Badge colorScheme="red">Absent: {absent}</Badge>
                <Badge colorScheme="yellow">Leave: {leave}</Badge>
                {isLoading || isFetching ? <HStack><Spinner size="sm" /><Text fontSize="sm" color={subtext}>Loading...</Text></HStack> : null}
            </HStack>

            {/* Bar chart */}
            <Box h={compact ? '160px' : '240px'} mb={4}>
                <Bar options={barOptions} data={barData} />
            </Box>

            {/* Calendar grid */}
            <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={2}>
                {days.map(d => {
                    const r = recordsByDay[d]
                    const status = r?.status || (r ? 'Present' : 'Absent')
                    const color = status === 'Present' ? 'green' : status === 'Leave' ? 'yellow' : 'red'
                    return (
                        <Tooltip key={d} label={r ? `${r.date}: ${formatHMS(r.check_in_time)} - ${formatHMS(r.check_out_time)} (${r.work_duration || '-'})` : 'No record'}>
                            <VStack p={2} borderWidth="1px" borderRadius="md" spacing={1} bg={useColorModeValue('gray.50', 'gray.700')} _hover={{ shadow: 'sm' }}>
                                <HStack w="full" justify="space-between">
                                    <Text fontSize="xs" color={subtext}>Day {d}</Text>
                                    <Badge colorScheme={color} variant="subtle" fontSize="0.65rem">{status}</Badge>
                                </HStack>
                                <Text fontSize="xs" w="full" textAlign="left">Hrs: {(r?.total_hours ?? 0).toFixed ? (r?.total_hours ?? 0).toFixed(2) : (r?.total_hours ?? 0)}</Text>
                            </VStack>
                        </Tooltip>
                    )
                })}
            </Box>

            {!compact && (
                <>
                    <Divider my={4} />
                    <Text fontWeight="semibold" mb={2}>Daily records</Text>
                    <Box overflowX="auto">
                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Date</Th>
                                    <Th>Status</Th>
                                    <Th>Check-in</Th>
                                    <Th>Check-out</Th>
                                    <Th isNumeric>Hours</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {days.map(d => {
                                    const r = recordsByDay[d]
                                    return (
                                        <Tr key={d}>
                                            <Td>{r?.date || `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`}</Td>
                                            <Td>
                                                <Badge colorScheme={r?.status === 'Present' ? 'green' : r?.status === 'Leave' ? 'yellow' : 'red'}>
                                                    {r?.status || 'Absent'}
                                                </Badge>
                                            </Td>
                                            <Td>{formatHMS(r?.check_in_time)}</Td>
                                            <Td>{formatHMS(r?.check_out_time)}</Td>
                                            <Td isNumeric>{(r?.total_hours ?? 0).toFixed ? (r?.total_hours ?? 0).toFixed(2) : (r?.total_hours ?? 0)}</Td>
                                        </Tr>
                                    )
                                })}
                            </Tbody>
                        </Table>
                    </Box>
                </>
            )}
        </Box>
    )
}

export default MonthlyAttendance
