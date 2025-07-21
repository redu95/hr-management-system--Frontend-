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
} from "@chakra-ui/react"
import { FaUsers, FaUserMinus, FaInbox, FaUserPlus } from "react-icons/fa"
import useAuthStore from "../store/authStore"
import RoleBasedComponent from "../components/common/RoleBasedComponent"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const MotionBox = motion(Box)

// Chart Component
const HeadcountChart = () => {
    const chartBg = useColorModeValue("white", "gray.800")
    const gridColor = useColorModeValue("#e2e8f0", "#4a5568")
    const tickColor = useColorModeValue("#64748b", "#a0aec0")

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: gridColor },
                ticks: { color: tickColor },
            },
            x: {
                grid: { display: false },
                ticks: { color: tickColor },
            },
        },
    }

    const data = {
        labels: ["Marketing", "Finance", "Technology", "Customer Support", "Sales"],
        datasets: [
            {
                label: "Headcount",
                data: [45, 30, 85, 60, 55],
                backgroundColor: "rgba(14, 165, 233, 0.6)",
                borderColor: "rgba(14, 165, 233, 1)",
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    }

    return (
        <Box h="full" bg={chartBg} borderRadius="xl" p={2}>
            <Bar options={options} data={data} />
        </Box>
    )
}

// Recent Hires List Component
const RecentHiresList = () => {
    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.700", "gray.100")
    const subtextColor = useColorModeValue("gray.500", "gray.300")

    const hires = [
        { name: "Minase Lemma", title: "CTO(Chief Technology Officer)", avatar: "M" },
        { name: "Naol Lemma", title: "CEO(Chief Executive Officer)", avatar: "N" },
        { name: "Eleni Lemma", title: "HR (Human Resource)", avatar: "E" },
        { name: "Yididya Lemma", title: "Frontend Developer", avatar: "Y" },
    ]

    return (
        <Box bg={cardBg} p={6} borderRadius="xl" shadow="lg" h="full">
            <Heading size="md" color={textColor} mb={4}>
                Recent Hires
            </Heading>
            <VStack spacing={4} align="stretch">
                {hires.map((hire, index) => (
                    <HStack key={index} spacing={3}>
                        <Avatar size="sm" name={hire.name} bg="gray.200" color="gray.600" />
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="semibold" color={textColor} fontSize="sm">
                                {hire.name}
                            </Text>
                            <Text fontSize="xs" color={subtextColor}>
                                {hire.title}
                            </Text>
                        </VStack>
                    </HStack>
                ))}
            </VStack>
        </Box>
    )
}

// KPI Card Component
const KpiCard = ({ icon: Icon, title, value, color, index }) => {
    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.800", "gray.100")
    const subtextColor = useColorModeValue("gray.500", "gray.300")

    const colors = {
        sky: { bg: useColorModeValue("blue.100", "blue.900"), color: useColorModeValue("blue.500", "blue.300") },
        amber: { bg: useColorModeValue("yellow.100", "yellow.900"), color: useColorModeValue("yellow.500", "yellow.300") },
        rose: { bg: useColorModeValue("red.100", "red.900"), color: useColorModeValue("red.500", "red.300") },
        green: { bg: useColorModeValue("green.100", "green.900"), color: useColorModeValue("green.500", "green.300") },
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
            >
                <Icon size="24" />
            </Box>
            <Text fontSize="3xl" fontWeight="bold" color={textColor} mb={1}>
                {value}
            </Text>
            <Text color={subtextColor}>{title}</Text>
        </MotionBox>
    )
}

const DashboardPage = () => {
    const { user } = useAuthStore()

    const kpiData = [
        { icon: FaUsers, title: "Total Employees", value: "248", color: "sky" },
        { icon: FaUserMinus, title: "Employees on Leave", value: "12", color: "amber" },
        { icon: FaInbox, title: "Pending Requests", value: "5", color: "rose" },
        { icon: FaUserPlus, title: "New Hires (Month)", value: "8", color: "green" },
    ]

    // Filter KPIs based on user role
    const getFilteredKPIs = () => {
        if (user?.role === "Employee") {
            return [
                { icon: FaUsers, title: "My Team Size", value: "12", color: "sky" },
                { icon: FaUserMinus, title: "My Leave Days Used", value: "8", color: "amber" },
                { icon: FaInbox, title: "My Pending Requests", value: "2", color: "rose" },
                { icon: FaUserPlus, title: "Days Until Next Review", value: "45", color: "green" },
            ]
        }
        return kpiData
    }

    return (
        <Container maxW="7xl" p={{ base: 4, sm: 8 }}>
            {/* Welcome Message */}
            <MotionBox mb={8} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Heading size="xl" mb={2}>
                    Welcome back, {user?.username}!
                </Heading>
                <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    Here's what's happening in your organization today.
                </Text>
            </MotionBox>

            {/* KPI Cards */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
                {getFilteredKPIs().map((item, index) => (
                    <GridItem key={index}>
                        <KpiCard icon={item.icon} title={item.title} value={item.value} color={item.color} index={index} />
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
                                <HeadcountChart />
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
                        <RecentHiresList />
                    </RoleBasedComponent>
                </GridItem>
            </Grid>
        </Container>
    )
}

export default DashboardPage
