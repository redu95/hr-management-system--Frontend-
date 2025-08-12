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
import { useEffect, useState } from "react"
import ApiService from "../services/apiService"

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
const KpiCard = ({ icon: Icon, title, value, color, index, loading = false }) => {
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

const DashboardPage = () => {
    const { user } = useAuthStore()

    // Add state for current user info from /auth/me
    const [currentUser, setCurrentUser] = useState({})
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedField, setSelectedField] = useState(null)
    const [fieldValue, setFieldValue] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        ApiService.fetchCurrentUser()
            .then(data => setCurrentUser(data))
            .catch(() => setCurrentUser({}))
    }, [])

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

    const kpiData = [
        { icon: FaUsers, title: "Total Employees", value: "248", color: "sky" },
        { icon: FaUserMinus, title: "Employees on Leave", value: "12", color: "amber" },
        { icon: FaInbox, title: "Pending Requests", value: "5", color: "rose" },
        { icon: FaUserPlus, title: "New Hires (Month)", value: "8", color: "green" },
    ]

    // Filter KPIs based on user role
    const getFilteredKPIs = () => {
        if (user?.role === "Employee") {
            const dash = currentUser.dashboard || {};
            return [
                { icon: FaUsers, title: "My Team Size", value: dash.my_team_size ?? "-", color: "sky" },
                { icon: FaUserMinus, title: "My Leave Days Used", value: dash.my_leave_days_used ?? "-", color: "amber" },
                { icon: FaInbox, title: "My Pending Requests", value: dash.my_pending_requests ?? "-", color: "rose" },
                { icon: FaUserPlus, title: "Days Until Next Review", value: dash.days_until_next_review ?? "-", color: "green" },
            ];
        }
        return kpiData;
    }

    const isProfileLoading = !currentUser || Object.keys(currentUser).length === 0
    const kpis = getFilteredKPIs()

    return (
        <>
            <Container maxW="7xl" p={{ base: 4, sm: 8 }}>
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
                                loading={user?.role === "Employee" ? isProfileLoading : false}
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
