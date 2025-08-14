"use client"

import { useState, useEffect } from "react"
import {
    Box,
    Button,
    Container,
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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Card,
    CardBody,
    Grid,
    InputGroup,
    InputLeftElement,
    Flex,
    Avatar,
    useColorModeValue,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaUsers, FaArrowUp, FaArrowDown } from "react-icons/fa"
import ApiService from "../services/apiService"
import useAuthStore from "../store/authStore"
import RoleBasedComponent from "../components/common/RoleBasedComponent"
import AttendanceWidget from "../components/common/AttendanceWidget"
import MonthlyAttendance from "../components/common/MonthlyAttendance"
import { useDepartments, useEmployees, useManagers } from '../hooks/useDirectoryData'

const MotionBox = motion(Box)

const DepartmentsPage = () => {
    const { user } = useAuthStore()
    // Show attendance widget for Managers and Employees
    const showAttendance = ["Manager", "Employee"].includes(user?.role)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDepartment, setSelectedDepartment] = useState(null)
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        manager: "",
    })

    const { data: departments = [], isLoading: loadingDepartments } = useDepartments()
    const { data: employees = [], refetch: refetchEmployees } = useEmployees()
    const { data: managers = [], refetch: refetchManagers } = useManagers()
    const loading = loadingDepartments

    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

    const toast = useToast()
    const cardBg = useColorModeValue("white", "gray.800")

    const filteredDepartments = departments.filter(
        (department) =>
            department.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            department.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            department.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const getDepartmentStats = (departmentId) => {
        const departmentEmployees = employees.filter((emp) => emp.department === departmentId)
        return {
            totalEmployees: departmentEmployees.length,
            activeEmployees: departmentEmployees.filter((emp) => emp.is_active).length,
        }
    }

    const handleSubmit = async (isEdit = false) => {
        try {
            // Ensure manager is either a number or null
            const payload = {
                ...formData,
                manager:
                    formData.manager && formData.manager !== ""
                        ? Number(formData.manager)
                        : null,
            }

            if (isEdit) {
                await ApiService.updateDepartment(selectedDepartment.id, payload)
                toast({
                    title: "Success",
                    description: "Department updated successfully",
                    status: "success",
                })
                onEditClose()
            } else {
                await ApiService.createDepartment(payload)
                toast({
                    title: "Success",
                    description: "Department created successfully",
                    status: "success",
                })
                onAddClose()
            }

            // Invalidate cached queries by refetching after mutation
            refetchEmployees();
            refetchManagers();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Operation failed",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleDelete = async () => {
        try {
            await ApiService.deleteDepartment(selectedDepartment.id)
            toast({
                title: "Success",
                description: "Department deleted successfully",
                status: "success",
            })
            onDeleteClose()
            refetchEmployees();
            refetchManagers();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete department",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            code: "",
            description: "",
            manager: "",
        })
        setSelectedDepartment(null)
    }

    const openAddModal = () => {
        resetForm()
        onAddOpen()
    }

    const openEditModal = (department) => {
        setSelectedDepartment(department)
        setFormData({
            name: department.name || "",
            code: department.code || "",
            description: department.description || "",
            // Set manager to "" if not present, else to string id
            manager: department.manager?.id ? String(department.manager.id) : "",
        })
        onEditOpen()
    }

    const openViewModal = (department) => {
        setSelectedDepartment(department)
        onViewOpen()
    }

    const openDeleteModal = (department) => {
        setSelectedDepartment(department)
        onDeleteOpen()
    }

    if (loading) {
        return (
            <Container maxW="7xl" py={8}>
                <Flex justify="center" align="center" h="400px">
                    <VStack spacing={4}>
                        <Spinner size="xl" color="blue.500" />
                        <Text>Loading departments...</Text>
                    </VStack>
                </Flex>
            </Container>
        )
    }

    return (
        <Container maxW="7xl" py={8}>
            {showAttendance && (
                <RoleBasedComponent allowedRoles={["Manager", "Employee"]}>
                    <AttendanceWidget />
                </RoleBasedComponent>
            )}
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {/* Header */}
                <VStack spacing={6} mb={8}>
                    <HStack spacing={4} w="full" justify="space-between">
                        <VStack align="start" spacing={1}>
                            <Heading size="xl" color="blue.600">
                                <HStack>
                                    <FaBuilding />
                                    <Text>Department Management</Text>
                                </HStack>
                            </Heading>
                            <Text color="gray.600" _dark={{ color: "gray.300" }}>
                                Organize your company structure
                            </Text>
                        </VStack>
                        <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={openAddModal}>
                            Add Department
                        </Button>
                    </HStack>

                    {/* Search */}
                    <Card w="full" bg={cardBg}>
                        <CardBody>
                            <InputGroup maxW="400px">
                                <InputLeftElement pointerEvents="none">
                                    <FaSearch color="gray.300" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search departments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </CardBody>
                    </Card>

                    {/* Department Stats */}
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} w="full">
                        <Card bg={cardBg}>
                            <CardBody>
                                <Stat>
                                    <StatLabel>Total Departments</StatLabel>
                                    <StatNumber>{departments.length}</StatNumber>
                                    <StatHelpText>Active departments</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card bg={cardBg}>
                            <CardBody>
                                <Stat>
                                    <StatLabel>Total Employees</StatLabel>
                                    <StatNumber>{employees.length}</StatNumber>
                                    <StatHelpText>Across all departments</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card bg={cardBg}>
                            <CardBody>
                                <Stat>
                                    <StatLabel>Departments with Managers</StatLabel>
                                    <StatNumber>{departments.filter((d) => d.manager).length}</StatNumber>
                                    <StatHelpText>Have assigned managers</StatHelpText>
                                </Stat>
                            </CardBody>
                        </Card>
                    </Grid>
                </VStack>

                {/* Department Table */}
                <Card bg={cardBg}>
                    <CardBody p={0}>
                        {filteredDepartments.length === 0 ? (
                            <Box p={8} textAlign="center">
                                <Text fontSize="lg" color="gray.500">
                                    No departments found
                                </Text>
                            </Box>
                        ) : (
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                                        <Tr>
                                            <Th>Department</Th>
                                            <Th>Code</Th>
                                            <Th>Manager</Th>
                                            <Th>Employees</Th>
                                            <Th>Created</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredDepartments.map((department) => {
                                            const stats = getDepartmentStats(department.id)
                                            return (
                                                <Tr key={department.id} _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}>
                                                    <Td>
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontWeight="semibold">{department.name}</Text>
                                                            <Text fontSize="sm" color="gray.500" noOfLines={1}>
                                                                {department.description || "No description"}
                                                            </Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme="blue" variant="subtle">
                                                            {department.code}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        {department.manager ? (
                                                            <HStack spacing={2}>
                                                                <Avatar
                                                                    size="xs"
                                                                    name={`${department.manager.first_name} ${department.manager.last_name}`}
                                                                />
                                                                <Text fontSize="sm">
                                                                    {department.manager.first_name} {department.manager.last_name}
                                                                </Text>
                                                            </HStack>
                                                        ) : (
                                                            <Text fontSize="sm" color="gray.500">
                                                                No manager
                                                            </Text>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        <HStack spacing={2}>
                                                            <FaUsers color="gray" size="14" />
                                                            <Text>{typeof department.head_count === 'number' ? department.head_count : stats.totalEmployees}</Text>
                                                            <Text fontSize="sm" color="gray.500">
                                                                {/* ({stats.activeEmployees} active) */}
                                                            </Text>
                                                        </HStack>
                                                    </Td>
                                                    <Td>
                                                        <Text fontSize="sm">
                                                            {department.created_at ? new Date(department.created_at).toLocaleDateString() : "N/A"}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <HStack spacing={1}>
                                                            <IconButton
                                                                icon={<FaEye />}
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="blue"
                                                                onClick={() => openViewModal(department)}
                                                                aria-label="View department"
                                                            />
                                                            <IconButton
                                                                icon={<FaEdit />}
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="orange"
                                                                onClick={() => openEditModal(department)}
                                                                aria-label="Edit department"
                                                            />
                                                            <IconButton
                                                                icon={<FaTrash />}
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="red"
                                                                onClick={() => openDeleteModal(department)}
                                                                aria-label="Delete department"
                                                            />
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

            {/* Add Department Modal */}
            <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Department</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Department Name</FormLabel>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Engineering, Marketing"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Department Code</FormLabel>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., ENG, MKT"
                                    maxLength={10}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Manager</FormLabel>
                                <Select
                                    value={formData.manager}
                                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                    placeholder="Select a manager"
                                >
                                    {managers.map((m) => (
                                        <option key={m.id} value={String(m.id)}>
                                            {m.first_name} {m.last_name} {m.job_title ? `- ${m.job_title}` : ''}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the department"
                                    rows={3}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onAddClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={() => handleSubmit(false)}>
                            Add Department
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Department Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Department</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Department Name</FormLabel>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Department Code</FormLabel>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    maxLength={10}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Manager</FormLabel>
                                <Select
                                    value={formData.manager}
                                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                    placeholder="Select a manager"
                                >
                                    {managers.map((m) => (
                                        <option key={m.id} value={String(m.id)}>
                                            {m.first_name} {m.last_name} {m.job_title ? `- ${m.job_title}` : ''}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEditClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={() => handleSubmit(true)}>
                            Update Department
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* View Department Modal */}
            <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Department Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedDepartment && (
                            <VStack spacing={6} align="stretch">
                                <HStack spacing={4}>
                                    <Box
                                        w={16}
                                        h={16}
                                        bg="blue.100"
                                        _dark={{ bg: "blue.900" }}
                                        borderRadius="lg"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <FaBuilding size="32" color="blue" />
                                    </Box>
                                    <VStack align="start" spacing={1}>
                                        <Heading size="lg">{selectedDepartment.name}</Heading>
                                        <Badge colorScheme="blue" variant="subtle">
                                            {selectedDepartment.code}
                                        </Badge>
                                    </VStack>
                                </HStack>

                                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            DESCRIPTION
                                        </Text>
                                        <Text>{selectedDepartment.description || "No description provided"}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            MANAGER
                                        </Text>
                                        {selectedDepartment.manager ? (
                                            <HStack spacing={2}>
                                                <Avatar
                                                    size="sm"
                                                    name={`${selectedDepartment.manager.first_name} ${selectedDepartment.manager.last_name}`}
                                                />
                                                <VStack align="start" spacing={0}>
                                                    <Text>
                                                        {selectedDepartment.manager.first_name} {selectedDepartment.manager.last_name}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        ) : (
                                            <Text color="gray.500">No manager assigned</Text>
                                        )}
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            TOTAL EMPLOYEES
                                        </Text>
                                        <Text>{getDepartmentStats(selectedDepartment.id).totalEmployees}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            ACTIVE EMPLOYEES
                                        </Text>
                                        <Text>{getDepartmentStats(selectedDepartment.id).activeEmployees}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            CREATED DATE
                                        </Text>
                                        <Text>
                                            {selectedDepartment.created_at
                                                ? new Date(selectedDepartment.created_at).toLocaleDateString()
                                                : "N/A"}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            DEPARTMENT ID
                                        </Text>
                                        <Text>#{selectedDepartment.id}</Text>
                                    </Box>
                                </Grid>

                                {/* Department Employees */}
                                <Box>
                                    <Text fontWeight="semibold" color="gray.600" fontSize="sm" mb={3}>
                                        DEPARTMENT EMPLOYEES
                                    </Text>
                                    <VStack spacing={2} align="stretch">
                                        {employees
                                            .filter((emp) => emp.department === selectedDepartment.id)
                                            .slice(0, 5)
                                            .map((employee) => (
                                                <HStack
                                                    key={employee.id}
                                                    spacing={3}
                                                    p={2}
                                                    borderRadius="md"
                                                    bg="gray.50"
                                                    _dark={{ bg: "gray.700" }}
                                                >
                                                    <Avatar size="sm" name={`${employee.first_name} ${employee.last_name}`} />
                                                    <VStack align="start" spacing={0} flex={1}>
                                                        <Text fontWeight="medium">
                                                            {employee.first_name} {employee.last_name}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.500">
                                                            {employee.job_title}
                                                        </Text>
                                                    </VStack>
                                                    <Badge colorScheme={employee.is_active ? "green" : "red"} size="sm">
                                                        {employee.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                    {(user?.role === 'CEO' || user?.role === 'HR') && (
                                                        <HStack>
                                                            {(employee.role || '').toLowerCase() === 'manager' ? (
                                                                <Button size="xs" leftIcon={<FaArrowDown />} colorScheme="orange" variant="outline" onClick={async () => {
                                                                    try {
                                                                        await ApiService.demoteUser(employee.id)
                                                                        toast({ title: 'Demoted to Employee', status: 'success', duration: 2000 })
                                                                        refetchEmployees(); refetchManagers();
                                                                    } catch (e) { toast({ title: 'Demotion failed', description: e.message, status: 'error' }) }
                                                                }}>Demote</Button>
                                                            ) : (
                                                                <Button size="xs" leftIcon={<FaArrowUp />} colorScheme="blue" variant="outline" onClick={async () => {
                                                                    try {
                                                                        await ApiService.promoteUser(employee.id)
                                                                        toast({ title: 'Promoted to Manager', status: 'success', duration: 2000 })
                                                                        refetchEmployees(); refetchManagers();
                                                                    } catch (e) { toast({ title: 'Promotion failed', description: e.message, status: 'error' }) }
                                                                }}>Promote</Button>
                                                            )}
                                                        </HStack>
                                                    )}
                                                </HStack>
                                            ))}
                                        {employees.filter((emp) => emp.department === selectedDepartment.id).length > 5 && (
                                            <Text fontSize="sm" color="gray.500" textAlign="center">
                                                +{employees.filter((emp) => emp.department === selectedDepartment.id).length - 5} more employees
                                            </Text>
                                        )}
                                        {employees.filter((emp) => emp.department === selectedDepartment.id).length === 0 && (
                                            <Text color="gray.500" textAlign="center">
                                                No employees in this department
                                            </Text>
                                        )}
                                    </VStack>
                                </Box>

                                {/* Manager Attendance Overview for CEO/HR */}
                                {(selectedDepartment?.manager?.id) && (
                                    <RoleBasedComponent allowedRoles={["CEO", "HR"]}>
                                        <Box>
                                            <Text fontWeight="semibold" color="gray.600" fontSize="sm" mb={3}>
                                                MANAGER ATTENDANCE
                                            </Text>
                                            <MonthlyAttendance title={`Manager Monthly Attendance`} employeeId={selectedDepartment.manager.id} compact />
                                        </Box>
                                    </RoleBasedComponent>
                                )}
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
                    <ModalHeader>Delete Department</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Alert status="warning">
                            <AlertIcon />
                            <Box>
                                <AlertTitle>Are you sure?</AlertTitle>
                                <AlertDescription>
                                    This action cannot be undone. This will permanently delete the department{" "}
                                    <strong>{selectedDepartment?.name}</strong> and may affect associated employees.
                                </AlertDescription>
                            </Box>
                        </Alert>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={handleDelete}>
                            Delete Department
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    )
}

export default DepartmentsPage
