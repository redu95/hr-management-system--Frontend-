// Format applied_date as relative time
const getRelativeTime = (dateString) => {
    if (!dateString) return "N/A";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec} seconds ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minutes ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hours ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} days ago`;
}
"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    IconButton,
    useDisclosure,
    Input,
    useToast,
    Spinner,
    Card,
    CardBody,
    CardHeader,
    Grid,
    GridItem,
    InputGroup,
    InputLeftElement,
    Avatar,
    useColorModeValue,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Select,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Textarea,
    Container,
    Button,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import {
    FaCalendarAlt,
    FaPlus,
    FaTrash,
    FaEye,
    FaSearch,
    FaCheck,
    FaTimes,
    FaClock,
    FaCalendarCheck,
    FaCalendarTimes,
    FaHourglass,
} from "react-icons/fa"
import ApiService from "../services/apiService"
import useAuthStore from "../store/authStore"

const MotionBox = motion(Box)

const MyLeave = () => {
    const queryClient = useQueryClient()
    const chakraToast = useToast() // Use Chakra UI's toast
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

    const { user } = useAuthStore()

    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.600", "gray.300")
    const headingColor = useColorModeValue("gray.800", "gray.100")
    const hoverBg = useColorModeValue("gray.50", "gray.700")
    const statusColors = {
        Approved: useColorModeValue("green", "green.500"),
        Denied: useColorModeValue("red", "red.500"),
        Pending: useColorModeValue("yellow", "yellow.500"),
        default: useColorModeValue("gray", "gray.500"),
    }
    const statusIcons = {
        Approved: <FaCheck />,
        Denied: <FaTimes />,
        Pending: <FaClock />,
        default: <FaHourglass />,
    }

    // Check if user can manage leave requests
    const canManageLeave = ["CEO", "HR", "Manager"].includes(user?.role)

    // State for the request leave modal
    const [leaveRequestForm, setLeaveRequestForm] = useState({
        start_date: "",
        end_date: "",
        reason: "",
    })

    // State for employees
    const [employees, setEmployees] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [selectedRequest, setSelectedRequest] = useState(null)

    // Fetch leave requests
    const { isLoading, data: leaveRequests } = useQuery({
        queryKey: ["leaveRequests"],
        queryFn: ApiService.getLeaveRequests,
    })

    // Fetch employees
    const { data: fetchedEmployees } = useQuery({
        queryKey: ["employees"],
        queryFn: ApiService.getEmployees,
        enabled: canManageLeave, // Only fetch employees if user can manage leave
    })

    useEffect(() => {
        if (fetchedEmployees) {
            setEmployees(Array.isArray(fetchedEmployees) ? fetchedEmployees : fetchedEmployees.results || [])
        }
    }, [fetchedEmployees])

    // Mutation for creating leave requests
    const createLeaveRequestMutation = useMutation({
        mutationFn: ApiService.createLeaveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries(["leaveRequests"])
            onAddClose()
            setLeaveRequestForm({
                start_date: "",
                end_date: "",
                reason: "",
            })
            chakraToast({
                title: "Success",
                description: "Leave request submitted successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            })
        },
        onError: (error) => {
            chakraToast({
                title: "Error",
                description: error.message || "Failed to submit leave request",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        },
    })

    // Mutation for updating leave requests (approve/deny)
    const updateLeaveRequestMutation = useMutation({
        mutationFn: ApiService.updateLeaveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries(["leaveRequests"])
            chakraToast({
                title: "Success",
                description: `Leave request updated successfully`,
                status: "success",
                duration: 3000,
                isClosable: true,
            })
        },
        onError: (error) => {
            chakraToast({
                title: "Error",
                description: error.message || "Failed to update leave request",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        },
    })

    // Mutation for deleting leave requests
    const deleteLeaveRequestMutation = useMutation({
        mutationFn: ApiService.deleteLeaveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries(["leaveRequests"])
            onDeleteClose()
            chakraToast({
                title: "Success",
                description: "Leave request deleted successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            })
        },
        onError: (error) => {
            chakraToast({
                title: "Error",
                description: error.message || "Failed to delete leave request",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        },
    })

    // Handle form input changes
    const handleFormChange = (e, field) => {
        setLeaveRequestForm((prev) => ({
            ...prev,
            [field]: e?.target ? e.target.value : e,
        }))
    }

    // Handle submitting the leave request
    const handleRequestLeave = () => {
        // Do not send employee field, backend assigns it
        const { start_date, end_date, reason } = leaveRequestForm
        createLeaveRequestMutation.mutate({ start_date, end_date, reason })
    }

    // Handle approving a leave request
    const handleApprove = (leaveRequest) => {
        // Only CEO/HR/Manager can approve
        if (!canManageLeave) return
        updateLeaveRequestMutation.mutate({
            id: leaveRequest.id,
            data: { status: "Approved" },
        })
    }

    // Handle denying a leave request
    const handleDeny = (leaveRequest) => {
        // Only CEO/HR/Manager can deny
        if (!canManageLeave) return
        updateLeaveRequestMutation.mutate({
            id: leaveRequest.id,
            data: { status: "Denied" },
        })
    }

    // Handle deleting a leave request
    const handleDelete = () => {
        // Only owner or CEO/HR/Manager can delete (UI allows, backend enforces)
        deleteLeaveRequestMutation.mutate(selectedRequest.id)
    }

    // Get leave statistics
    const getLeaveStats = () => {
        const requests = leaveRequests?.results || [] // Ensure leaveRequests is an array
        const total = requests.length
        const pending = requests.filter((req) => req.status === "Pending").length
        const approved = requests.filter((req) => req.status === "Approved").length
        const denied = requests.filter((req) => req.status === "Denied").length

        return { total, pending, approved, denied }
    }

    const stats = getLeaveStats()

    // Filter leave requests
    const filteredRequests = (leaveRequests?.results || leaveRequests || []).filter((request) => {
        // Debug logs for filtering
        console.log("🧑‍💻 [MyLeave] user.id:", user?.id, "| request.employee:", request.employee)

        // Remove redundant filtering for employees
        const employee = employees.find((emp) => emp.id === request.employee) || {}
        const employeeName = `${employee.first_name || ""} ${employee.last_name || ""}`.toLowerCase()

        const matchesSearch =
            employeeName.includes(searchTerm.toLowerCase()) ||
            request.reason?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = !filterStatus || request.status === filterStatus

        return matchesSearch && matchesStatus
    })

    // Calculate days between dates
    const calculateDays = (startDate, endDate) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        return diffDays
    }

    // Get status color
    const getStatusColor = (status) => {
        return statusColors[status] || statusColors.default
    }

    // Get status icon
    const getStatusIcon = (status) => {
        return statusIcons[status] || statusIcons.default
    }

    if (isLoading) {
        return (
            <Container maxW="7xl" py={8}>
                <VStack spacing={4} justify="center" align="center" h="400px">
                    <Spinner size="xl" color="blue.500" />
                    <Text>Loading leave requests...</Text>
                </VStack>
            </Container>
        )
    }

    return (
        <Container maxW="7xl" py={8}>
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {/* Header */}
                <VStack spacing={6} mb={8}>
                    <HStack spacing={4} w="full" justify="space-between">
                        <VStack align="start" spacing={1}>
                            <Heading size="xl" color="blue.600">
                                <HStack>
                                    <FaCalendarAlt />
                                    <Text>{canManageLeave ? "Leave Management" : "My Leave Requests"}</Text>
                                </HStack>
                            </Heading>
                            <Text color={textColor}>
                                {canManageLeave ? "Manage employee leave requests" : "Track your leave requests and balance"}
                            </Text>
                        </VStack>
                        <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={onAddOpen}>
                            Request Leave
                        </Button>
                    </HStack>

                    {/* Statistics Cards */}
                    <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6} w="full">
                        <Card bg={cardBg} shadow="md">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textColor}>Total Requests</StatLabel>
                                    <StatNumber color="blue.500">{stats.total}</StatNumber>
                                    <StatHelpText color={textColor}>
                                        <HStack>
                                            <FaCalendarAlt />
                                            <Text>All time</Text>
                                        </HStack>
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card bg={cardBg} shadow="md">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textColor}>Pending</StatLabel>
                                    <StatNumber color="yellow.500">{stats.pending}</StatNumber>
                                    <StatHelpText color={textColor}>
                                        <HStack>
                                            <FaClock />
                                            <Text>Awaiting approval</Text>
                                        </HStack>
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card bg={cardBg} shadow="md">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textColor}>Approved</StatLabel>
                                    <StatNumber color="green.500">{stats.approved}</StatNumber>
                                    <StatHelpText color={textColor}>
                                        <HStack>
                                            <FaCalendarCheck />
                                            <Text>Approved requests</Text>
                                        </HStack>
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card bg={cardBg} shadow="md">
                            <CardBody>
                                <Stat>
                                    <StatLabel color={textColor}>Denied</StatLabel>
                                    <StatNumber color="red.500">{stats.denied}</StatNumber>
                                    <StatHelpText color={textColor}>
                                        <HStack>
                                            <FaCalendarTimes />
                                            <Text>Denied requests</Text>
                                        </HStack>
                                    </StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    </Grid>

                    {/* Filters */}
                    <Card w="full" bg={cardBg} shadow="md">
                        <CardBody>
                            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4}>
                                <GridItem>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <FaSearch color="gray.300" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder={canManageLeave ? "Search by employee name or reason..." : "Search leave requests..."}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </GridItem>
                                <GridItem>
                                    <Select
                                        placeholder="Filter by Status"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Denied">Denied</option>
                                    </Select>
                                </GridItem>
                            </Grid>
                        </CardBody>
                    </Card>
                </VStack>

                {/* Leave Requests Table */}
                <Card bg={cardBg} shadow="md">
                    <CardHeader>
                        <Heading size="md" color={headingColor}>
                            Leave Requests
                        </Heading>
                    </CardHeader>
                    <CardBody p={0}>
                        {filteredRequests.length === 0 ? (
                            <Box p={8} textAlign="center">
                                <VStack spacing={4}>
                                    <FaCalendarAlt size="48" color={textColor} />
                                    <Text fontSize="lg" color={textColor}>
                                        No leave requests found
                                    </Text>
                                    <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={onAddOpen}>
                                        Create Your First Request
                                    </Button>
                                </VStack>
                            </Box>
                        ) : (
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead bg={hoverBg}>
                                        <Tr>
                                            {canManageLeave && <Th color={textColor}>Employee</Th>}
                                            <Th color={textColor}>Leave Period</Th>
                                            <Th color={textColor}>Duration</Th>
                                            <Th color={textColor}>Reason</Th>
                                            <Th color={textColor}>Status</Th>
                                            <Th color={textColor}>Submitted</Th>
                                            <Th color={textColor}>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredRequests.map((request) => {
                                            const employee = employees.find((emp) => emp.id === request.employee) || {}
                                            const days = calculateDays(request.start_date, request.end_date)

                                            return (
                                                <Tr key={request.id} _hover={{ bg: hoverBg }}>
                                                    {canManageLeave && (
                                                        <Td>
                                                            <HStack spacing={3}>
                                                                <Avatar
                                                                    size="sm"
                                                                    name={`${employee.first_name} ${employee.last_name}`}
                                                                    src={`https://ui-avatars.com/api/?name=${employee.first_name}+${employee.last_name}&background=random`}
                                                                />
                                                                <VStack align="start" spacing={0}>
                                                                    <Text fontWeight="semibold" color={headingColor}>
                                                                        {employee.first_name} {employee.last_name}
                                                                    </Text>
                                                                    <Text fontSize="sm" color={textColor}>
                                                                        {employee.job_title}
                                                                    </Text>
                                                                </VStack>
                                                            </HStack>
                                                        </Td>
                                                    )}
                                                    <Td>
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontWeight="medium" color={headingColor}>
                                                                {new Date(request.start_date).toLocaleDateString()} -{" "}
                                                                {new Date(request.end_date).toLocaleDateString()}
                                                            </Text>
                                                            <Text fontSize="sm" color={textColor}>
                                                                {new Date(request.start_date).toLocaleDateString("en-US", { weekday: "short" })} -{" "}
                                                                {new Date(request.end_date).toLocaleDateString("en-US", { weekday: "short" })}
                                                            </Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme="blue" variant="subtle">
                                                            {days} {days === 1 ? "day" : "days"}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Text noOfLines={2} maxW="200px" color={headingColor}>
                                                            {request.reason || "No reason provided"}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={getStatusColor(request.status)} variant="subtle">
                                                            <HStack spacing={1}>
                                                                {getStatusIcon(request.status)}
                                                                <Text>{request.status}</Text>
                                                            </HStack>
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Text fontSize="sm" color={textColor}>
                                                            {getRelativeTime(request.applied_date)}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <HStack spacing={1}>
                                                            <IconButton
                                                                icon={<FaEye />}
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="blue"
                                                                onClick={() => {
                                                                    setSelectedRequest(request)
                                                                    onViewOpen()
                                                                }}
                                                                aria-label="View request"
                                                            />
                                                            {canManageLeave && request.status === "Pending" && (
                                                                <>
                                                                    <IconButton
                                                                        icon={<FaCheck />}
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        colorScheme="green"
                                                                        onClick={() => handleApprove(request)}
                                                                        aria-label="Approve request"
                                                                    />
                                                                    <IconButton
                                                                        icon={<FaTimes />}
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        colorScheme="red"
                                                                        onClick={() => handleDeny(request)}
                                                                        aria-label="Deny request"
                                                                    />
                                                                </>
                                                            )}
                                                            {(request.status === "Pending" || canManageLeave) && (
                                                                <IconButton
                                                                    icon={<FaTrash />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    colorScheme="red"
                                                                    onClick={() => {
                                                                        setSelectedRequest(request)
                                                                        onDeleteOpen()
                                                                    }}
                                                                    aria-label="Delete request"
                                                                />
                                                            )}
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            )
                                        })}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </CardBody>
                </Card>
            </MotionBox>

            {/* Add Leave Request Modal */}
            <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Request New Leave</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Start Date</FormLabel>
                                <Input
                                    type="date"
                                    value={leaveRequestForm.start_date}
                                    onChange={(e) => handleFormChange(e, "start_date")}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>End Date</FormLabel>
                                <Input
                                    type="date"
                                    value={leaveRequestForm.end_date}
                                    onChange={(e) => handleFormChange(e, "end_date")}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Reason for Leave</FormLabel>
                                <Textarea
                                    value={leaveRequestForm.reason}
                                    onChange={(e) => handleFormChange(e, "reason")}
                                    placeholder="e.g., Vacation, Sick Leave, Personal"
                                    rows={3}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onAddClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleRequestLeave} isLoading={createLeaveRequestMutation.isPending}>
                            Submit Request
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* View Leave Request Modal */}
            <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Leave Request Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedRequest && (
                            <VStack spacing={4} align="stretch">
                                <HStack spacing={4}>
                                    <Avatar
                                        size="lg"
                                        name={`${employees.find((e) => e.id === selectedRequest.employee)?.first_name || ""} ${employees.find((e) => e.id === selectedRequest.employee)?.last_name || ""}`}
                                        src={`https://ui-avatars.com/api/?name=${employees.find((e) => e.id === selectedRequest.employee)?.first_name || ""}+${employees.find((e) => e.id === selectedRequest.employee)?.last_name || ""}&background=random&size=128`}
                                    />
                                    <VStack align="start" spacing={0}>
                                        <Heading size="md">
                                            {employees.find((e) => e.id === selectedRequest.employee)?.first_name}{" "}
                                            {employees.find((e) => e.id === selectedRequest.employee)?.last_name}
                                        </Heading>
                                        <Text fontSize="sm" color={textColor}>
                                            {employees.find((e) => e.id === selectedRequest.employee)?.job_title}
                                        </Text>
                                        <Badge colorScheme={getStatusColor(selectedRequest.status)} mt={1}>
                                            {selectedRequest.status}
                                        </Badge>
                                    </VStack>
                                </HStack>

                                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                    <Box>
                                        <Text fontWeight="semibold" color={textColor} fontSize="sm">
                                            START DATE
                                        </Text>
                                        <Text color={headingColor}>{new Date(selectedRequest.start_date).toLocaleDateString()}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color={textColor} fontSize="sm">
                                            END DATE
                                        </Text>
                                        <Text color={headingColor}>{new Date(selectedRequest.end_date).toLocaleDateString()}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color={textColor} fontSize="sm">
                                            DURATION
                                        </Text>
                                        <Text color={headingColor}>
                                            {calculateDays(selectedRequest.start_date, selectedRequest.end_date)} days
                                        </Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color={textColor} fontSize="sm">
                                            SUBMITTED ON
                                        </Text>
                                        <Text color={headingColor}>
                                            {getRelativeTime(selectedRequest.applied_date)}
                                        </Text>
                                    </Box>
                                </Grid>
                                <Box>
                                    <Text fontWeight="semibold" color={textColor} fontSize="sm">
                                        REASON
                                    </Text>
                                    <Text color={headingColor}>{selectedRequest.reason || "No reason provided"}</Text>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onViewClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Delete Leave Request</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            Are you sure you want to delete this leave request for{" "}
                            <Text as="span" fontWeight="bold">
                                {employees.find((e) => e.id === selectedRequest?.employee)?.first_name}{" "}
                                {employees.find((e) => e.id === selectedRequest?.employee)?.last_name}
                            </Text>{" "}
                            from {selectedRequest?.start_date} to {selectedRequest?.end_date}? This action cannot be undone.
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={handleDelete} isLoading={deleteLeaveRequestMutation.isPending}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    )
}

export default MyLeave
