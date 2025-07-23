"use client"
import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Grid,
    GridItem,
    useColorModeValue,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaChartBar, FaDownload } from "react-icons/fa"

// Import Chart.js components
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
import { Bar, Line, Doughnut } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

const MotionBox = motion(Box)

// Individual Chart Components
const HeadcountGrowthChart = () => {
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
                beginAtZero: false,
                min: 220,
                max: 250,
                ticks: {
                    color: tickColor,
                    stepSize: 5,
                },
                grid: { color: gridColor },
            },
            x: {
                ticks: { color: tickColor },
                grid: { display: false },
            },
        },
    }

    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Headcount",
                data: [220, 225, 230, 238, 245, 248],
                borderColor: "#0ea5e9",
                backgroundColor: "rgba(14, 165, 233, 0.1)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#0ea5e9",
                pointBorderColor: "#0ea5e9",
                pointRadius: 4,
            },
        ],
    }

    return <Line options={options} data={data} />
}

const EmployeeDiversityChart = () => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: useColorModeValue("#64748b", "#a0aec0"),
                    usePointStyle: true,
                    padding: 20,
                },
            },
        },
    }

    const data = {
        labels: ["Technology", "Marketing", "Sales", "Finance", "Support"],
        datasets: [
            {
                data: [85, 45, 55, 30, 60],
                backgroundColor: ["#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
                borderWidth: 0,
                cutout: "50%",
            },
        ],
    }

    return <Doughnut options={options} data={data} />
}

const TurnoverRateChart = () => {
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
                beginAtZero: false,
                min: 1.8,
                max: 2.5,
                ticks: {
                    color: tickColor,
                    callback: (value) => value + "%",
                    stepSize: 0.1,
                },
                grid: { color: gridColor },
            },
            x: {
                ticks: { color: tickColor },
                grid: { display: false },
            },
        },
    }

    const data = {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        datasets: [
            {
                label: "Turnover Rate",
                data: [2.1, 1.8, 2.5, 2.2],
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#ef4444",
                pointBorderColor: "#ef4444",
                pointRadius: 4,
            },
        ],
    }

    return <Line options={options} data={data} />
}

const SalaryDistributionChart = () => {
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
                max: 140000,
                ticks: {
                    color: tickColor,
                    callback: (value) => "$" + value / 1000 + "k",
                    stepSize: 20000,
                },
                grid: { color: gridColor },
            },
            x: {
                ticks: { color: tickColor },
                grid: { display: false },
            },
        },
    }

    const data = {
        labels: ["Intern", "Junior", "Mid-Level", "Senior", "Lead"],
        datasets: [
            {
                label: "Average Salary",
                data: [45000, 65000, 85000, 110000, 135000],
                backgroundColor: "#f59e0b",
                borderRadius: 4,
                borderSkipped: false,
            },
        ],
    }

    return <Bar options={options} data={data} />
}

const ReportsPage = () => {
    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.600", "gray.300")
    const headingColor = useColorModeValue("gray.800", "gray.100")
    const borderColor = useColorModeValue("gray.200", "gray.700") // New border color

    return (
        <Container maxW="7xl" py={8}>
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {/* Header */}
                <VStack spacing={6} mb={8}>
                    <HStack spacing={4} w="full" justify="space-between">
                        <VStack align="start" spacing={1}>
                            <Heading size="xl" color="blue.600">
                                <HStack>
                                    <FaChartBar />
                                    <Text>Reports & Analytics</Text>
                                </HStack>
                            </Heading>
                            <Text color={textColor}>Generate and view key organizational reports.</Text>
                        </VStack>
                        <Button leftIcon={<FaDownload />} colorScheme="blue" variant="outline">
                            Export All
                        </Button>
                    </HStack>
                </VStack>

                {/* Executive Summary Section */}
                <Card bg={cardBg} shadow="lg" mb={6}>
                    <CardBody p={8}>
                        <Heading size="lg" mb={6} color={headingColor}>
                            Executive Summary
                        </Heading>

                        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={8}>
                            {/* Headcount Growth Chart */}
                            <GridItem>
                                <Card bg={cardBg} shadow="md" borderWidth="1px" borderColor={borderColor}>
                                    {" "}
                                    {/* Added border */}
                                    <CardBody p={6}>
                                        <Heading size="md" mb={4} color={useColorModeValue("gray.700", "gray.200")}>
                                            Headcount Growth (YTD)
                                        </Heading>
                                        <Box h="300px">
                                            <HeadcountGrowthChart />
                                        </Box>
                                    </CardBody>
                                </Card>
                            </GridItem>

                            {/* Employee Diversity Chart */}
                            <GridItem>
                                <Card bg={cardBg} shadow="md" borderWidth="1px" borderColor={borderColor}>
                                    {" "}
                                    {/* Added border */}
                                    <CardBody p={6}>
                                        <Heading size="md" mb={4} color={useColorModeValue("gray.700", "gray.200")}>
                                            Employee Diversity by Department
                                        </Heading>
                                        <Box h="300px">
                                            <EmployeeDiversityChart />
                                        </Box>
                                    </CardBody>
                                </Card>
                            </GridItem>

                            {/* Turnover Rate Chart */}
                            <GridItem>
                                <Card bg={cardBg} shadow="md" borderWidth="1px" borderColor={borderColor}>
                                    {" "}
                                    {/* Added border */}
                                    <CardBody p={6}>
                                        <Heading size="md" mb={4} color={useColorModeValue("gray.700", "gray.200")}>
                                            Quarterly Turnover Rate
                                        </Heading>
                                        <Box h="300px">
                                            <TurnoverRateChart />
                                        </Box>
                                    </CardBody>
                                </Card>
                            </GridItem>

                            {/* Salary Distribution Chart */}
                            <GridItem>
                                <Card bg={cardBg} shadow="md" borderWidth="1px" borderColor={borderColor}>
                                    {" "}
                                    {/* Added border */}
                                    <CardBody p={6}>
                                        <Heading size="md" mb={4} color={useColorModeValue("gray.700", "gray.200")}>
                                            Salary Distribution by Role
                                        </Heading>
                                        <Box h="300px">
                                            <SalaryDistributionChart />
                                        </Box>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        </Grid>
                    </CardBody>
                </Card>
            </MotionBox>
        </Container>
    )
}

export default ReportsPage
