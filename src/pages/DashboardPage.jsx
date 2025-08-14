"use client"

import { motion } from "framer-motion"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"
import {
    Box,
    Container,
    Grid,
    GridItem,
    Heading,
    Text,
    VStack,
    HStack,
    Avatar,
    useColorModeValue,
    Skeleton,
    SkeletonText,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    useDisclosure,
    useToast,
    FormControl,
    FormLabel,
} from "@chakra-ui/react"
import { FaUsers, FaUserMinus, FaInbox, FaUserPlus } from "react-icons/fa"
import useAuthStore from "../store/authStore"
import RoleBasedComponent from "../components/common/RoleBasedComponent"
import AttendanceWidget from "../components/common/AttendanceWidget"
import MonthlyAttendance from "../components/common/MonthlyAttendance"
import { useEffect, useState } from "react"
import ApiService from "../services/apiService"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const MotionBox = motion(Box)

// Chart Component
const HeadcountChart = ({ labels = [], counts = [], loading }) => {
    const chartBg = useColorModeValue("white", "gray.800")
    const gridColor = useColorModeValue("#e2e8f0", "#4a5568")
    const tickColor = useColorModeValue("#64748b", "#a0aec0")

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor } },
            x: { grid: { display: false }, ticks: { color: tickColor } },
        },
    }

    const data = {
        labels: labels.length ? labels : ["—"],
        datasets: [
            {
                label: "Headcount",
                data: counts.length ? counts : [0],
                backgroundColor: "rgba(14, 165, 233, 0.6)",
                borderColor: "rgba(14, 165, 233, 1)",
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    }

    return (
        <Box h="full" bg={chartBg} borderRadius="xl" p={2} position="relative">
            {loading && (
                <VStack position="absolute" inset={0} justify="center" bg={useColorModeValue("whiteAlpha.700", "blackAlpha.400")} backdropFilter="blur(2px)" spacing={2}>
                    <Skeleton height="24px" w="60%" />
                    <Skeleton height="200px" w="90%" />
                </VStack>
            )}
            <Bar options={options} data={data} />
        </Box>
    )
}

// Recent Hires List Component
const RecentHiresList = ({ hires = [], loading }) => {
    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.700", "gray.100")
    const subtextColor = useColorModeValue("gray.500", "gray.300")

    return (
        <Box bg={cardBg} p={6} borderRadius="xl" shadow="lg" h="full" display="flex" flexDirection="column">
            <Heading size="md" color={textColor} mb={4}>
                Recent Hires
            </Heading>
            {loading ? (
                <VStack spacing={4} align="stretch" flex={1}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <HStack key={i} spacing={3}>
                            <Skeleton boxSize="32px" borderRadius="full" />
                            <VStack align="start" flex={1} spacing={1}>
                                <Skeleton height="12px" w="60%" />
                                <Skeleton height="10px" w="40%" />
                            </VStack>
                        </HStack>
                    ))}
                </VStack>
            ) : hires.length ? (
                <VStack spacing={4} align="stretch" flex={1}>
                    {hires.map((hire, index) => (
                        <HStack key={index} spacing={3}>
                            <Avatar size="sm" name={hire.name} bg="gray.200" color="gray.600" />
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="semibold" color={textColor} fontSize="sm">
                                    {hire.name}
                                </Text>
                                <Text fontSize="xs" color={subtextColor}>
                                    {hire.title || hire.job_title || "New Hire"}
                                </Text>
                            </VStack>
                        </HStack>
                    ))}
                </VStack>
            ) : (
                <Text fontSize="sm" color={subtextColor}>
                    No recent hires data. (Backend could expose a /api/dashboard/recent-hires/ endpoint returning an array of new hires with name, job_title, and start date.)
                </Text>
            )}
        </Box>
    )
}

// KPI Card Component
const KpiCard = ({ icon: Icon, title, value, color, index, loading = false }) => {
    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const subtextColor = useColorModeValue("gray.500", "gray.300")

    const colors = {
        sky: { bg: useColorModeValue("blue.100", "blue.900"), color: useColorModeValue("blue.500", "blue.300") },
        amber: { bg: useColorModeValue("yellow.100", "yellow.900"), color: useColorModeValue("yellow.500", "yellow.300") },
        rose: { bg: useColorModeValue("red.100", "red.900"), color: useColorModeValue("red.500", "red.300") },
        green: { bg: useColorModeValue("green.100", "green.900"), color: useColorModeValue("green.500", "green.300") },
        purple: { bg: useColorModeValue("purple.100", "purple.900"), color: useColorModeValue("purple.500", "purple.300") },
        teal: { bg: useColorModeValue("teal.100", "teal.900"), color: useColorModeValue("teal.500", "teal.300") },
    }

    return (
        <MotionBox
            bg={cardBg}
            p={6}
            borderRadius="xl"
            shadow="lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Box
                w={12}
                h={12}
                bg={colors[color].bg}
                color={colors[color].color}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
                position="relative"
                overflow="hidden"
            >
                {loading ? (
                    <Box w="full" h="full" animation="pulse 1.5s ease-in-out infinite" />
                ) : (
                    <Icon size="24" />
                )}
            </Box>
            {loading ? (
                <>
                    <Skeleton height="34px" width="60px" mb={2} borderRadius="md" />
                    <Skeleton height="16px" width="120px" borderRadius="md" />
                </>
            ) : (
                <>
                    <Text fontSize="3xl" fontWeight="bold" color={textColor} mb={1}>
                        {value}
                    </Text>
                    <Text color={subtextColor}>{title}</Text>
                </>
            )}
        </MotionBox>
    )
}

// Generic simple bar chart for re-use (age distribution, headcount, etc.)
const SimpleBarChart = ({ title, dataMap = {}, loading }) => {
    const labels = Object.keys(dataMap)
    const counts = Object.values(dataMap)
    return (
        <Box bg={useColorModeValue("white", "gray.800")} p={6} borderRadius="xl" shadow="lg" h="full" position="relative">
            <Heading size="sm" mb={4}>{title}</Heading>
            {loading && (
                <VStack position="absolute" inset={0} justify="center" bg={useColorModeValue("whiteAlpha.700", "blackAlpha.400")} backdropFilter="blur(2px)">
                    <Skeleton height="20px" w="60%" />
                    <Skeleton height="180px" w="90%" />
                </VStack>
            )}
            <Box h="200px">
                <Bar
                    data={{
                        labels: labels.length ? labels : ["-"],
                        datasets: [
                            {
                                label: title,
                                data: counts.length ? counts : [0],
                                backgroundColor: "rgba(99,102,241,0.6)",
                                borderColor: "rgba(99,102,241,1)",
                                borderWidth: 1,
                                borderRadius: 4,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
                    }}
                />
            </Box>
        </Box>
    )
}

const DashboardPage = () => {
    const { user } = useAuthStore()

    // Add state for current user info from /auth/me
    const [currentUser, setCurrentUser] = useState({})
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedField, setSelectedField] = useState(null)
    const [fieldValue, setFieldValue] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    // Additional data for dynamic dashboard (departments/users for aggregation)
    const [departments, setDepartments] = useState([])
    const [users, setUsers] = useState([]) // all users (kept if needed for future derived metrics)
    const [loadingHeadcount, setLoadingHeadcount] = useState(false)
    const [recentHires, setRecentHires] = useState([])
    const [loadingHires, setLoadingHires] = useState(false)

    useEffect(() => {
        ApiService.fetchCurrentUser()
            .then(data => setCurrentUser(data))
            .catch(() => setCurrentUser({}))
    }, [])

    // Normalize role helper (server may return lowercase)
    const role = (user?.role || currentUser?.role || "").toString().toLowerCase()
    const isEmployee = role === "employee"
    const isCEO = role === "ceo"
    const isManagerial = ["manager", "hr", "ceo"].includes(role)

    // Fetch departments & users for managerial roles to build headcount chart
    useEffect(() => {
        if (!isManagerial) return
        let cancelled = false
        const load = async () => {
            setLoadingHeadcount(true)
            try {
                const deptData = await ApiService.getDepartments().catch(() => [])
                if (cancelled) return
                setDepartments(Array.isArray(deptData?.results) ? deptData.results : deptData)
            } finally {
                if (!cancelled) setLoadingHeadcount(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [isManagerial])

    // Fetch recent hires using /api/users?role=employee (assuming backend supports filtering)
    useEffect(() => {
        if (!isManagerial) return
        let cancelled = false
        const load = async () => {
            setLoadingHires(true)
            try {
                const data = await ApiService.searchUsers({ role: 'employee', ordering: '-id' }) // expecting newest first if backend honors ordering
                if (cancelled) return
                const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []
                // Sort by id descending if backend didn't order
                const sorted = [...list].sort((a, b) => (b.id || 0) - (a.id || 0))
                setRecentHires(sorted.slice(0, 5).map(u => ({
                    name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
                    job_title: u.job_title,
                    started_at: u.date_joined || u.created_at, // speculative fields
                })))
            } finally {
                if (!cancelled) setLoadingHires(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [isManagerial])

    // Profile completeness calculation (moved inside component)
    const profileFields = [
        { key: "first_name", label: "First Name", editable: true },
        { key: "last_name", label: "Last Name", editable: true },
        { key: "email", label: "Email", editable: true },
        { key: "phone_number", label: "Phone Number", editable: true },
        { key: "job_title", label: "Job Title", editable: false }, // Only HR/Manager can edit
        { key: "date_of_birth", label: "Date of Birth", editable: true },
        { key: "department", label: "Department", editable: false }, // Only HR/Manager can edit
    ];
    const missingFields = profileFields.filter(f => !currentUser[f.key]);
    const completeness = Math.round(((profileFields.length - missingFields.length) / profileFields.length) * 100);

    const handleOpenField = (field) => {
        if (!field.editable) return; // Prevent opening modal for non-editable fields
        setSelectedField(field)
        setFieldValue(currentUser[field.key] || "")
        onOpen()
    }

    const handleSaveField = async () => {
        if (!selectedField) return
        // Simple validation: do not allow empty except phone_number, job_title, department can be empty? We'll enforce non-empty for now
        if (!fieldValue) {
            toast({ title: "Value required", status: "warning", duration: 2500, isClosable: true })
            return
        }
        setIsSaving(true)
        try {
            const payload = { [selectedField.key]: fieldValue }
            await ApiService.updateCurrentUser(payload)
            setCurrentUser(prev => ({ ...prev, ...payload }))
            toast({ title: `${selectedField.label} updated`, status: "success", duration: 2500, isClosable: true })
            onClose()
        } catch (e) {
            toast({ title: "Update failed", description: e.message, status: "error", duration: 3000, isClosable: true })
        } finally {
            setIsSaving(false)
        }
    }

    // Build KPI cards dynamically
    const getKpis = () => {
        const dash = currentUser.dashboard || {}

        // Employee self-service KPIs
        if (isEmployee) {
            return [
                { icon: FaUsers, title: "My Team Size", value: dash.my_team_size ?? "-", color: "sky" },
                { icon: FaUserMinus, title: "My Leave Days Used", value: dash.my_leave_days_used ?? "-", color: "amber" },
                { icon: FaInbox, title: "My Pending Requests", value: dash.my_pending_requests ?? "-", color: "rose" },
                { icon: FaUserPlus, title: "Days Until Next Review", value: dash.days_until_next_review ?? "-", color: "green" },
            ]
        }

        // CEO high-level KPIs
        if (isCEO) {
            return [
                { icon: FaUsers, title: "Active Users", value: dash.headcount?.total_active_users ?? "-", color: "sky" },
                { icon: FaUserPlus, title: "Hires (This Month)", value: dash.hires_this_month ?? "-", color: "green" },
                { icon: FaUserMinus, title: "Attrition Rate (30d)", value: dash.attrition_last_30_days?.rate != null ? `${(dash.attrition_last_30_days.rate * 100).toFixed(1)}%` : "-", color: "purple" },
                { icon: FaInbox, title: "Pending Leave", value: dash.leave?.pending_requests ?? "-", color: "amber" },
                { icon: FaUserMinus, title: "On Leave Today", value: dash.leave?.employees_on_approved_leave_today ?? "-", color: "rose" },
                { icon: FaUsers, title: "Avg Perf. Score", value: dash.performance?.average_score ?? "-", color: "teal" },
            ]
        }

        // Manager / HR KPIs
        const dashTeamSize = dash.my_team_size ?? dash.headcount?.employees
        const base = [
            { icon: FaUsers, title: "My Team Size", value: dashTeamSize ?? "-", color: "sky" },
            { icon: FaUserMinus, title: "Employees on Leave", value: dash.employees_on_leave ?? dash.leave?.employees_on_approved_leave_today ?? "-", color: "amber" },
            { icon: FaInbox, title: "Pending Leave Requests", value: dash.pending_leave_requests ?? dash.leave?.pending_requests ?? "-", color: "rose" },
            { icon: FaUserPlus, title: "New Hires (Month)", value: dash.new_hires_this_month ?? dash.hires_this_month ?? "-", color: "green" },
        ]

        // Derived metrics
        const derived = []
        const size = Number(dashTeamSize) || 0
        const onLeave = Number(dash.employees_on_leave ?? dash.leave?.employees_on_approved_leave_today) || 0
        const pending = Number(dash.pending_leave_requests ?? dash.leave?.pending_requests) || 0
        const reviews = Number(dash.performance_reviews_this_month ?? dash.performance?.reviews_this_month) || 0

        if (size > 0) {
            derived.push({ icon: FaUsers, title: "Availability %", value: `${(((size - onLeave) / size) * 100).toFixed(0)}%`, color: "teal" })
            derived.push({ icon: FaUserMinus, title: "Leave Rate %", value: `${((onLeave / size) * 100).toFixed(0)}%`, color: "purple" })
            derived.push({ icon: FaInbox, title: "Pending / Emp", value: size ? (pending / size).toFixed(2) : "-", color: "amber" })
            derived.push({ icon: FaInbox, title: "Review Coverage %", value: `${Math.min(100, ((reviews / size) * 100).toFixed(0))}%`, color: "rose" })
        }
        return [...base, ...derived]
    }

    const isProfileLoading = !currentUser || Object.keys(currentUser).length === 0
    const kpis = getKpis()

    // Build headcount chart data using department.head_count returned from API
    const headcountLabels = departments.map(d => d.name)
    const headcountCounts = departments.map(d => d.head_count ?? 0)

    return (
        <>
            <Container maxW="7xl" p={{ base: 4, sm: 8 }}>
                {["Manager", "Employee"].includes(user?.role) && (
                    <>
                        <RoleBasedComponent allowedRoles={["Manager", "Employee"]}>
                            <AttendanceWidget />
                        </RoleBasedComponent>
                        <Box mt={4}>
                            <RoleBasedComponent allowedRoles={["Manager", "Employee"]}>
                                <MonthlyAttendance title="My Monthly Attendance" compact />
                            </RoleBasedComponent>
                        </Box>
                    </>
                )}
                {/* Profile Completeness */}
                {user?.role === "Employee" && (
                    <Box mb={6} p={4} bg={useColorModeValue("white", "gray.800")} borderRadius="xl" shadow="md">
                        <Heading size="md" mb={2}>Profile Completeness</Heading>
                        {!currentUser || Object.keys(currentUser).length === 0 ? (
                            <VStack py={4}>
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="24" cy="24" r="20" stroke="#3182ce" strokeWidth="4" opacity="0.2" />
                                        <path d="M44 24c0-11.046-8.954-20-20-20" stroke="#3182ce" strokeWidth="4" strokeLinecap="round">
                                            <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite" />
                                        </path>
                                    </svg>
                                </Box>
                                <Text color="gray.500">Loading profile data...</Text>
                            </VStack>
                        ) : (
                            <>
                                <Text fontSize="xl" fontWeight="bold" color={completeness === 100 ? "green.500" : "orange.500"}>
                                    {completeness}%
                                </Text>
                                {missingFields.length > 0 && (
                                    <Box mt={2}>
                                        <Text color="gray.600" mb={1}>Missing fields:</Text>
                                        <VStack align="start" spacing={1}>
                                            {missingFields.map(f => (
                                                <Text
                                                    key={f.key}
                                                    color={f.editable ? "red.500" : "orange.400"}
                                                    cursor={f.editable ? "pointer" : "not-allowed"}
                                                    textDecoration={f.editable ? "underline" : "none"}
                                                    _hover={f.editable ? { color: "red.600" } : {}}
                                                    onClick={() => handleOpenField(f)}
                                                >
                                                    • {f.label} {f.editable ? "" : "(Contact HR)"}
                                                </Text>
                                            ))}
                                        </VStack>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                )}
                {/* Welcome Message */}
                <MotionBox mb={8} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Heading size="xl" mb={2}>
                        Welcome back, {user.name || `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim()}!
                    </Heading>
                    <Text color="gray.600" _dark={{ color: "gray.300" }}>
                        Here's what's happening in your organization today.
                    </Text>
                </MotionBox>

                {/* KPI Cards */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
                    {kpis.map((item, index) => (
                        <GridItem key={index}>
                            <KpiCard
                                icon={item.icon}
                                title={item.title}
                                value={item.value}
                                color={item.color}
                                index={index}
                                loading={isEmployee ? isProfileLoading : false}
                            />
                        </GridItem>
                    ))}
                </Grid>

                {/* Charts and Recent Activity */}
                <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
                    {/* Chart - Only show to non-employees */}
                    <GridItem>
                        <RoleBasedComponent
                            allowedRoles={["CEO", "Manager", "HR"]}
                            fallback={
                                <Box
                                    bg={useColorModeValue("white", "gray.800")}
                                    p={6}
                                    borderRadius="xl"
                                    shadow="lg"
                                    h="400px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <VStack>
                                        <Heading size="md" mb={4}>
                                            My Performance
                                        </Heading>
                                        <Text color="gray.500" _dark={{ color: "gray.400" }}>
                                            Performance metrics will be displayed here
                                        </Text>
                                    </VStack>
                                </Box>
                            }
                        >
                            <Box bg={useColorModeValue("white", "gray.800")} p={6} borderRadius="xl" shadow="lg">
                                <Heading size="md" mb={4}>
                                    Headcount by Department
                                </Heading>
                                <Box h="320px">
                                    <HeadcountChart labels={headcountLabels} counts={headcountCounts} loading={loadingHeadcount} />
                                </Box>
                            </Box>
                        </RoleBasedComponent>
                    </GridItem>

                    {/* Recent Activity */}
                    <GridItem>
                        <RoleBasedComponent
                            allowedRoles={["CEO", "Manager", "HR"]}
                            fallback={
                                <Box
                                    bg={useColorModeValue("white", "gray.800")}
                                    p={6}
                                    borderRadius="xl"
                                    shadow="lg"
                                    h="400px"
                                    display="flex"
                                    flexDirection="column"
                                >
                                    <Heading size="md" mb={4}>
                                        My Recent Activity
                                    </Heading>
                                    <VStack spacing={4} align="stretch" flex={1}>
                                        <HStack>
                                            <Box w={2} h={2} bg="green.500" borderRadius="full" />
                                            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                                                Leave request approved
                                            </Text>
                                        </HStack>
                                        <HStack>
                                            <Box w={2} h={2} bg="blue.500" borderRadius="full" />
                                            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                                                Profile updated
                                            </Text>
                                        </HStack>
                                        <HStack>
                                            <Box w={2} h={2} bg="yellow.500" borderRadius="full" />
                                            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                                                Training completed
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </Box>
                            }
                        >
                            <RecentHiresList hires={recentHires} loading={loadingHires} />
                        </RoleBasedComponent>
                    </GridItem>
                </Grid>

                {isCEO && (
                    <VStack align="stretch" spacing={8} mt={12}>
                        <Heading size="lg">Executive Overview</Heading>
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)', xl: 'repeat(4,1fr)' }} gap={6}>
                            <Box bg={useColorModeValue('white', 'gray.800')} p={6} borderRadius="xl" shadow="lg">
                                <Heading size="sm" mb={4}>Headcount Breakdown</Heading>
                                <VStack align="stretch" spacing={2} fontSize="sm">
                                    <HStack justify="space-between"><Text>Total Active</Text><Text fontWeight="bold">{currentUser.dashboard?.headcount?.total_active_users ?? '-'}</Text></HStack>
                                    <HStack justify="space-between"><Text>Employees</Text><Text fontWeight="bold">{currentUser.dashboard?.headcount?.employees ?? '-'}</Text></HStack>
                                    <HStack justify="space-between"><Text>Managers</Text><Text fontWeight="bold">{currentUser.dashboard?.headcount?.managers ?? '-'}</Text></HStack>
                                    <HStack justify="space-between"><Text>HR</Text><Text fontWeight="bold">{currentUser.dashboard?.headcount?.hr ?? '-'}</Text></HStack>
                                </VStack>
                            </Box>
                            <Box bg={useColorModeValue('white', 'gray.800')} p={6} borderRadius="xl" shadow="lg">
                                <Heading size="sm" mb={4}>Attrition (Last 30d)</Heading>
                                <VStack spacing={3} align="stretch" fontSize="sm">
                                    <HStack justify="space-between"><Text>Count</Text><Text fontWeight="bold">{currentUser.dashboard?.attrition_last_30_days?.count ?? '-'}</Text></HStack>
                                    <HStack justify="space-between"><Text>Rate</Text><Text fontWeight="bold">{currentUser.dashboard?.attrition_last_30_days?.rate != null ? (currentUser.dashboard.attrition_last_30_days.rate * 100).toFixed(1) + '%' : '-'}</Text></HStack>
                                </VStack>
                            </Box>
                            <Box bg={useColorModeValue('white', 'gray.800')} p={6} borderRadius="xl" shadow="lg">
                                <Heading size="sm" mb={4}>Leave & Attendance Today</Heading>
                                <VStack spacing={2} align="stretch" fontSize="sm">
                                    <HStack justify="space-between"><Text>Pending Leave</Text><Text fontWeight="bold">{currentUser.dashboard?.leave?.pending_requests ?? '-'}</Text></HStack>
                                    <HStack justify="space-between"><Text>On Approved Leave</Text><Text fontWeight="bold">{currentUser.dashboard?.leave?.employees_on_approved_leave_today ?? '-'}</Text></HStack>
                                    <HStack justify="space-between"><Text>Present</Text><Text fontWeight="bold">{currentUser.dashboard?.attendance_today?.present ?? '-'}</Text></HStack>
                                    <HStack justify="space-between"><Text>Absent</Text><Text fontWeight="bold">{currentUser.dashboard?.attendance_today?.absent ?? '-'}</Text></HStack>
                                </VStack>
                            </Box>
                            <Box bg={useColorModeValue('white', 'gray.800')} p={6} borderRadius="xl" shadow="lg">
                                <Heading size="sm" mb={4}>Performance</Heading>
                                <VStack spacing={2} align="stretch" fontSize="sm">
                                    <HStack justify="space-between"><Text>Avg Score</Text><Text fontWeight="bold">{currentUser.dashboard?.performance?.average_score ?? '-'}</Text></HStack>
                                    <HStack justify="space-between"><Text>Reviews (Month)</Text><Text fontWeight="bold">{currentUser.dashboard?.performance?.reviews_this_month ?? '-'}</Text></HStack>
                                </VStack>
                                <Box mt={4}>
                                    <Text fontSize="xs" mb={2} fontWeight="semibold">Top Performers</Text>
                                    <VStack align="stretch" spacing={1} maxH="100px" overflowY="auto">
                                        {currentUser.dashboard?.performance?.top_performers?.length ? (
                                            currentUser.dashboard.performance.top_performers.map((p, i) => <Text key={i} fontSize="xs">• {p.name || p.first_name ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : p}</Text>)
                                        ) : <Text fontSize="xs" color="gray.500">No data</Text>}
                                    </VStack>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8}>
                            <Box>
                                <Heading size="md" mb={4}>Departments</Heading>
                                <Box bg={useColorModeValue('white', 'gray.800')} p={0} borderRadius="xl" shadow="lg" overflow="hidden">
                                    <Box as="table" w="full" fontSize="sm">
                                        <Box as="thead" bg={useColorModeValue('gray.100', 'gray.700')}>
                                            <Box as="tr">
                                                <Box as="th" textAlign="left" p={3}>Name</Box>
                                                <Box as="th" textAlign="right" p={3}>Employees</Box>
                                            </Box>
                                        </Box>
                                        <Box as="tbody">
                                            {(currentUser.dashboard?.departments || []).map(d => (
                                                <Box as="tr" key={d.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                                    <Box as="td" p={3}>{d.name}</Box>
                                                    <Box as="td" p={3} textAlign="right" fontWeight="semibold">{d.emp_count}</Box>
                                                </Box>
                                            ))}
                                            {!(currentUser.dashboard?.departments || []).length && (
                                                <Box as="tr"><Box as="td" p={3} colSpan={2}>No department data</Box></Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <VStack spacing={6} align="stretch">
                                <SimpleBarChart
                                    title="Age Distribution"
                                    dataMap={currentUser.dashboard?.age_distribution || {}}
                                />
                                <SimpleBarChart
                                    title="Dept Headcount"
                                    dataMap={(currentUser.dashboard?.departments || []).reduce((acc, d) => { acc[d.name] = d.emp_count; return acc; }, {})}
                                />
                            </VStack>
                        </Grid>
                    </VStack>
                )}
            </Container>
            {/* Single Field Edit Modal */}
            <Modal isOpen={isOpen} onClose={() => { if (!isSaving) onClose() }} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Update {selectedField?.label}</ModalHeader>
                    <ModalCloseButton disabled={isSaving} />
                    <ModalBody>
                        {selectedField && (
                            <FormControl>
                                <FormLabel>{selectedField.label}</FormLabel>
                                <Input
                                    type={selectedField.key === 'date_of_birth' ? 'date' : 'text'}
                                    value={fieldValue}
                                    onChange={(e) => setFieldValue(e.target.value)}
                                />
                            </FormControl>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSaving}>Cancel</Button>
                        <Button colorScheme="blue" onClick={handleSaveField} isLoading={isSaving} loadingText="Saving">Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default DashboardPage
