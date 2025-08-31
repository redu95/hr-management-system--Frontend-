"use client"
import { useEffect, useMemo, useState } from "react"
import { Box, Container, Heading, Text, VStack, HStack, Card, CardBody, Grid, GridItem, useColorModeValue, Select, Spinner, Badge } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaChartBar } from "react-icons/fa"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js"
import { Bar, Line } from "react-chartjs-2"
import useAuthStore from "../store/authStore"
import { useHeadcountByDept, useHiresVsExits, useLeaveStatus, useTasksPipeline, usePerfAvgByDept } from "../hooks/useAnalytics"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const MotionBox = motion(Box)

const CardShell = ({ title, children, right = null }) => {
    const cardBg = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.700")
    return (
        <Card bg={cardBg} shadow="md" borderWidth="1px" borderColor={borderColor}>
            <CardBody p={6}>
                <HStack justify="space-between" mb={3}>
                    <Heading size="md" color={useColorModeValue("gray.700", "gray.200")}>{title}</Heading>
                    {right}
                </HStack>
                <Box h="300px">{children}</Box>
            </CardBody>
        </Card>
    )
}

// no custom hook for gating to avoid conditional hook usage

export default function ReportsPage() {
    const { user } = useAuthStore()
    const role = (user?.role || "").toLowerCase()
    const allowed = role === "hr" || role === "ceo"
    if (!allowed) {
        return (
            <VStack p={8} align="start" spacing={3}>
                <Heading size="md">Reports & Analytics</Heading>
                <Text color="gray.500">Only HR and CEO can view analytics.</Text>
            </VStack>
        )
    }
    return <ReportsContent />
}

function ReportsContent() {
    const [loading, setLoading] = useState(false)
    const [months, setMonths] = useState(6)
    const [days, setDays] = useState(90)
    const { data: hcRes, isFetching: hcFetching } = useHeadcountByDept()
    const { data: hvxRes, isFetching: hvxFetching } = useHiresVsExits(months)
    const { data: lsRes, isFetching: lsFetching } = useLeaveStatus(days)
    const { data: tpRes, isFetching: tpFetching } = useTasksPipeline()
    const { data: paRes, isFetching: paFetching } = usePerfAvgByDept()
    const headcount = hcRes?.results || []
    const hires = hvxRes || { labels: [], hires: [], exits: [] }
    const leave = lsRes || { labels: [], pending: [], approved: [], denied: [] }
    const tasks = tpRes || { by_status: {}, overdue: 0 }
    const perf = paRes?.results || []
    useEffect(() => { setLoading(hcFetching || hvxFetching || lsFetching || tpFetching || paFetching) }, [hcFetching, hvxFetching, lsFetching, tpFetching, paFetching])

    const hcData = useMemo(() => ({
        labels: headcount.map((d) => d.name),
        datasets: [{ label: "Employees", data: headcount.map((d) => d.emp_count), backgroundColor: "rgba(14,165,233,0.6)", borderColor: "rgba(14,165,233,1)", borderWidth: 1, borderRadius: 4 }],
    }), [headcount])

    const hvxData = useMemo(() => ({
        labels: hires.labels || [],
        datasets: [
            { type: "line", label: "Hires", data: hires.hires || [], borderColor: "#16a34a", backgroundColor: "rgba(22,163,74,0.2)", tension: 0.3, fill: true },
            { type: "line", label: "Exits", data: hires.exits || [], borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.2)", tension: 0.3, fill: true },
        ],
    }), [hires])

    const leaveData = useMemo(() => ({
        labels: leave.labels || [],
        datasets: [
            { label: "Pending", data: leave.pending || [], backgroundColor: "#f59e0b" },
            { label: "Approved", data: leave.approved || [], backgroundColor: "#10b981" },
            { label: "Denied", data: leave.denied || [], backgroundColor: "#ef4444" },
        ],
    }), [leave])

    const pipelineData = useMemo(() => {
        const labels = Object.keys(tasks.by_status || {})
        const values = Object.values(tasks.by_status || {})
        return ({ labels, datasets: [{ label: "Tasks", data: values, backgroundColor: "#6366f1" }] })
    }, [tasks])

    const perfData = useMemo(() => ({
        labels: (perf || []).map((p) => p.department || "Unassigned"),
        datasets: [{ label: "Avg Score", data: (perf || []).map((p) => p.avg_score), backgroundColor: "#8b5cf6" }],
    }), [perf])

    return (
        <Container maxW="7xl" py={8}>
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <VStack spacing={6} mb={4} align="start">
                    <HStack>
                        <Heading size="lg" color="blue.600"><HStack><FaChartBar /><Text>Reports & Analytics</Text></HStack></Heading>
                        {loading && <Spinner size="sm" />}
                    </HStack>
                    <HStack>
                        <HStack>
                            <Text color="gray.500">Months</Text>
                            <Select size="sm" value={months} onChange={(e) => setMonths(Number(e.target.value))} w="80px">
                                <option value={3}>3</option>
                                <option value={6}>6</option>
                                <option value={12}>12</option>
                            </Select>
                        </HStack>
                        <HStack>
                            <Text color="gray.500">Days</Text>
                            <Select size="sm" value={days} onChange={(e) => setDays(Number(e.target.value))} w="80px">
                                <option value={30}>30</option>
                                <option value={60}>60</option>
                                <option value={90}>90</option>
                                <option value={180}>180</option>
                            </Select>
                        </HStack>
                        <Badge colorScheme="purple">Overdue tasks: {tasks.overdue || 0}</Badge>
                    </HStack>
                </VStack>

                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={8}>
                    <GridItem>
                        <CardShell title="Headcount by Department">
                            <Bar data={hcData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </CardShell>
                    </GridItem>
                    <GridItem>
                        <CardShell title="Hires vs Exits (Monthly)">
                            <Line data={hvxData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </CardShell>
                    </GridItem>
                    <GridItem>
                        <CardShell title="Leave Requests by Status (Weekly)">
                            <Bar data={leaveData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, scales: { x: { stacked: true }, y: { stacked: true } } }} />
                        </CardShell>
                    </GridItem>
                    <GridItem>
                        <CardShell title="Tasks Pipeline">
                            <Bar data={pipelineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </CardShell>
                    </GridItem>
                    <GridItem colSpan={{ base: 1, lg: 2 }}>
                        <CardShell title="Average Performance Score by Department">
                            <Bar data={perfData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 5 } } }} />
                        </CardShell>
                    </GridItem>
                </Grid>
            </MotionBox>
        </Container>
    )
}
