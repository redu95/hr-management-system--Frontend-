"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "primereact/button"
import { Tag } from "primereact/tag"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Toast } from "primereact/toast"
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

const LeaveManagementPage = () => {
    const queryClient = useQueryClient()
    const toast = useRef(null)
    const chakraToast = useToast()
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

    const { user } = useAuthStore()

    const cardBg = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    // Check if user can manage leave requests
    const canManageLeave = ["CEO", "HR", "Manager"].includes(user?.role)

    // State for the request leave modal
    const [leaveRequestForm, setLeaveRequestForm] = useState({
        start_date: "",
        end_date: "",
        reason: "",
    })

    // State for available leave types (replace with API call if needed)
    const [leaveTypes, setLeaveTypes] = useState([
        { label: "Vacation", value: "Vacation" },
        { label: "Sick Leave", value: "Sick Leave" },
        { label: "Personal", value: "Personal" },
    ])

    // State for employees (replace with API call if needed)
    const [employees, setEmployees] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [selectedRequest, setSelectedRequest] = useState(null)

    // Fetch leave requests
    const {
        isLoading,
        isError,
        data: leaveRequests,
        error,
    } = useQuery({
        queryKey: ["leaveRequests"],
        queryFn: ApiService.getLeaveRequests,
    })

    // Fetch employees
    const { data: fetchedEmployees } = useQuery({
        queryKey: ["employees"],
        queryFn: ApiService.getEmployees,
        enabled: canManageLeave,
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
        createLeaveRequestMutation.mutate(leaveRequestForm)
    }

    // Handle approving a leave request
    const handleApprove = (leaveRequest) => {
        updateLeaveRequestMutation.mutate({
            id: leaveRequest.id,
            data: { status: "APPROVED" }, // Send "APPROVED" status
        })
    }

    // Handle denying a leave request
    const handleDeny = (leaveRequest) => {
        updateLeaveRequestMutation.mutate({
            id: leaveRequest.id,
            data: { status: "DENIED" }, // Send "DENIED" status
        })
    }

    // Handle deleting a leave request
    const handleDelete = () => {
        deleteLeaveRequestMutation.mutate(selectedRequest.id)
    }

    // Template for the Employee column
    const employeeBodyTemplate = (rowData) => {
        const employee = employees.find((emp) => emp.id === rowData.employee) || {}
        return (
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold ">
                    {employee.first_name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {`${employee.first_name} ${employee.last_name}`}
                </span>
            </div>
        )
    }

    // Template for the Leave Type column with colored tags
    const leaveTypeBodyTemplate = (rowData) => {
        const severityMap = {
            Vacation: "info",
            "Sick Leave": "warning",
            Personal: "success",
        }
        return <Tag value={rowData.reason} severity={severityMap[rowData.reason]} />
    }

    // Template for the Actions column
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex items-center space-x-2">
                <Button
                    label="Approve"
                    className="p-button-sm p-button-success p-button-text dark:text-slate-100"
                    onClick={() => handleApprove(rowData)}
                />
                <Button
                    label="Deny"
                    className="p-button-sm p-button-danger p-button-text "
                    onClick={() => handleDeny(rowData)}
                />
                <IconButton
                    icon={<FaEye />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => onViewOpen(rowData)}
                    aria-label="View request"
                />
                {canManageLeave && (
                    <IconButton
                        icon={<FaTrash />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => onDeleteOpen(rowData)}
                        aria-label="Delete request"
                    />
                )}
            </div>
        )
    }

    // Get leave statistics
    const getLeaveStats = () => {
        // Ensure leaveRequests is an array before accessing its properties
        const requests = leaveRequests || []
        const total = requests.length
        const pending = requests.filter((req) => req.status === "Pending").length
        const approved = requests.filter((req) => req.status === "Approved").length
        const denied = requests.filter((req) => req.status === "Denied").length

        return { total, pending, approved, denied }
    }

    const stats = getLeaveStats()

    // Filter leave requests
    const filteredRequests = (leaveRequests || []).filter((request) => {
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
        const diffTime = Math.abs(end - start)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        return diffDays
    }

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "green"
            case "Denied":
                return "red"
            case "Pending":
                return "yellow"
            default:
                return "gray"
        }
    }

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case "Approved":
                return <FaCheck />
            case "Denied":
                return <FaTimes />
            case "Pending":
                return <FaClock />
            default:
                return <FaHourglass />
        }
    }

    if (isLoading) {
        return (
            <div className="p-4 sm:p-8">
                <Toast ref={toast} />
                <div className="flex justify-center items-center h-400px">
                    <VStack spacing={4}>
                        <Spinner size="xl" color="blue.500" />
                        <Text>Loading leave requests...</Text>
                    </VStack>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8">
            <Toast ref={toast} />
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
                        <Text color="gray.600" _dark={{ color: "gray.300" }}>
                            {canManageLeave ? "Manage employee leave requests" : "Track your leave requests and balance"}
                        </Text>
                    </VStack>
                    <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={onAddOpen}>
                        Request Leave
                    </Button>
                </HStack>

                {/* Statistics Cards */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6} w="full">
                    <Card bg={cardBg}>
                        <CardBody>
                            <Stat>
                                <StatLabel>Total Requests</StatLabel>
                                <StatNumber color="blue.500">{stats.total}</StatNumber>
                                <StatHelpText>
                                    <HStack>
                                        <FaCalendarAlt />
                                        <Text>All time</Text>
                                    </HStack>
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                    <Card bg={cardBg}>
                        <CardBody>
                            <Stat>
                                <StatLabel>Pending</StatLabel>
                                <StatNumber color="yellow.500">{stats.pending}</StatNumber>
                                <StatHelpText>
                                    <HStack>
                                        <FaClock />
                                        <Text>Awaiting approval</Text>
                                    </HStack>
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                    <Card bg={cardBg}>
                        <CardBody>
                            <Stat>
                                <StatLabel>Approved</StatLabel>
                                <StatNumber color="green.500">{stats.approved}</StatNumber>
                                <StatHelpText>
                                    <HStack>
                                        <FaCalendarCheck />
                                        <Text>Approved requests</Text>
                                    </HStack>
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                    <Card bg={cardBg}>
                        <CardBody>
                            <Stat>
                                <StatLabel>Denied</StatLabel>
                                <StatNumber color="red.500">{stats.denied}</StatNumber>
                                <StatHelpText>
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
                <Card w="full" bg={cardBg}>
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
            <Card bg={cardBg}>
                <CardHeader>
                    <Heading size="md">Leave Requests</Heading>
                </CardHeader>
                <CardBody p={0}>
                    {filteredRequests.length === 0 ? (
                        <Box p={8} textAlign="center">
                            <VStack spacing={4}>
                                <FaCalendarAlt size="48" color="gray" />
                                <Text fontSize="lg" color="gray.500">
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
                                <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                                    <Tr>
                                        {canManageLeave && <Th>Employee</Th>}
                                        <Th>Leave Period</Th>
                                        <Th>Duration</Th>
                                        <Th>Reason</Th>
                                        <Th>Status</Th>
                                        <Th>Submitted</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredRequests.map((request) => {
                                        const employee = employees.find((emp) => emp.id === request.employee) || {}
                                        const days = calculateDays(request.start_date, request.end_date)

                                        return (
                                            <Tr key={request.id} _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}>
                                                {canManageLeave && (
                                                    <Td>
                                                        <HStack spacing={3}>
                                                            <Avatar
                                                                size="sm"
                                                                name={`${employee.first_name} ${employee.last_name}`}
                                                                src={`https://ui-avatars.com/api/?name=${employee.first_name}+${employee.last_name}&background=random`}
                                                            />
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontWeight="semibold">
                                                                    {employee.first_name} {employee.last_name}
                                                                </Text>
                                                                <Text fontSize="sm" color="gray.500">
                                                                    {employee.job_title}
                                                                </Text>
                                                            </VStack>
                                                        </HStack>
                                                    </Td>
                                                )}
                                                <Td>
                                                    <VStack align="start" spacing={1}>
                                                        <Text fontWeight="medium">
                                                            {new Date(request.start_date).toLocaleDateString()} -{" "}
                                                            {new Date(request.end_date).toLocaleDateString()}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.500">
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
                                                    <Text noOfLines={2} maxW="200px">
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
                                                    <Text fontSize="sm">
                                                        {request.created_at ? new Date(request.created_at).toLocaleDateString() : "N/A"}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    <HStack spacing={1}>
                                                        <IconButton
                                                            icon={<FaEye />}
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="blue"
                                                            onClick={() => onViewOpen(request)}
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
                                                                onClick={() => onDeleteOpen(request)}
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
        </div>
    )
}

export default LeaveManagementPage
