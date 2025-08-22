"use client"

import { useState } from "react"
import { useEmployees, useDepartments } from '../hooks/useDirectoryData'
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
    Avatar,
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
    Switch,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Card,
    CardBody,
    Grid,
    GridItem,
    InputGroup,
    InputLeftElement,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useColorModeValue,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaUsers, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaDownload, FaChevronDown } from "react-icons/fa"
import ApiService from "../services/apiService"
import useAuthStore from "../store/authStore"
import RoleBasedComponent from "../components/common/RoleBasedComponent"
import AttendanceWidget from "../components/common/AttendanceWidget"
import MonthlyAttendance from "../components/common/MonthlyAttendance"

const MotionBox = motion(Box)

const EmployeesPage = () => {
    const { user } = useAuthStore()
    const showAttendance = ["Manager", "Employee"].includes(user?.role)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterDepartment, setFilterDepartment] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        job_title: "",
        department: "",
        phone_number: "",
        date_of_birth: "",
        is_active: true,
    })

    const { data: employees = [], isLoading: loadingEmployees, refetch: refetchEmployees } = useEmployees()
    const { data: departments = [] } = useDepartments()
    const loading = loadingEmployees

    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

    const toast = useToast()

    const cardBg = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    // Filter employees
    const filteredEmployees = employees.filter((employee) => {
        const term = searchTerm.toLowerCase()
        const matchesSearch =
            employee.first_name?.toLowerCase().includes(term) ||
            employee.last_name?.toLowerCase().includes(term) ||
            employee.email?.toLowerCase().includes(term) ||
            employee.job_title?.toLowerCase().includes(term) ||
            employee.department?.name?.toLowerCase().includes(term) ||
            employee.department_details?.name?.toLowerCase().includes(term)

        const empDeptId = typeof employee.department === 'object' ? employee.department?.id : employee.department
        const matchesDepartment = !filterDepartment || empDeptId === Number.parseInt(filterDepartment)
        const matchesStatus = !filterStatus || employee.is_active?.toString() === filterStatus

        return matchesSearch && matchesDepartment && matchesStatus
    })

    // Handle form submission
    const handleSubmit = async (isEdit = false) => {
        try {
            const payload = {
                ...formData,
                department: formData.department ? Number.parseInt(formData.department) : null,
            }

            if (isEdit) {
                await ApiService.updateEmployee(selectedEmployee.id, payload)
                toast({
                    title: "Success",
                    description: "Employee updated successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                })
                onEditClose()
            } else {
                await ApiService.createEmployee(payload)
                toast({
                    title: "Success",
                    description: "Employee created successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                })
                onAddClose()
            }

            refetchEmployees()
            resetForm()
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

    // Handle delete
    const handleDelete = async () => {
        try {
            await ApiService.deleteEmployee(selectedEmployee.id)
            toast({
                title: "Success",
                description: "Employee deleted successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            })
            onDeleteClose()
            refetchEmployees()
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete employee",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            first_name: "",
            last_name: "",
            email: "",
            job_title: "",
            department: "",
            phone_number: "",
            date_of_birth: "",
            is_active: true,
        })
        setSelectedEmployee(null)
    }

    // Open modals
    const openAddModal = () => {
        resetForm()
        onAddOpen()
    }

    const openEditModal = (employee) => {
        setSelectedEmployee(employee)
        setFormData({
            first_name: employee.first_name || "",
            last_name: employee.last_name || "",
            email: employee.email || "",
            job_title: employee.job_title || "",
            department: employee.department?.toString() || "",
            phone_number: employee.phone_number || "",
            date_of_birth: employee.date_of_birth || "",
            is_active: employee.is_active ?? true,
        })
        onEditOpen()
    }

    const openViewModal = (employee) => {
        setSelectedEmployee(employee)
        onViewOpen()
    }

    const openDeleteModal = (employee) => {
        setSelectedEmployee(employee)
        onDeleteOpen()
    }

    if (loading) {
        return (
            <Container maxW="7xl" py={8}>
                <Flex justify="center" align="center" h="400px">
                    <VStack spacing={4}>
                        <Spinner size="xl" color="blue.500" />
                        <Text>Loading employees...</Text>
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
                                    <FaUsers />
                                    <Text>Employee Management</Text>
                                </HStack>
                            </Heading>
                            <Text color="gray.600" _dark={{ color: "gray.300" }}>
                                Manage your organization's workforce
                            </Text>
                        </VStack>
                        <HStack spacing={3}>
                            <Menu>
                                <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="outline">
                                    <FaDownload />
                                </MenuButton>
                                <MenuList>
                                    <MenuItem>Export as CSV</MenuItem>
                                    <MenuItem>Export as PDF</MenuItem>
                                </MenuList>
                            </Menu>
                            {user?.role !== "Manager" && (
                                <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={openAddModal}>
                                    Add Employee
                                </Button>
                            )}
                        </HStack>
                    </HStack>

                    {/* Filters */}
                    <Card w="full" bg={cardBg}>
                        <CardBody>
                            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4}>
                                <GridItem>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <FaSearch color="gray.300" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Search employees..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </GridItem>
                                {user?.role !== "Manager" && (
                                    <GridItem>
                                        <Select
                                            placeholder="Filter by Department"
                                            value={filterDepartment}
                                            onChange={(e) => setFilterDepartment(e.target.value)}
                                        >
                                            {departments.map((dept) => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </GridItem>
                                )}
                                <GridItem>
                                    <Select
                                        placeholder="Filter by Status"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </Select>
                                </GridItem>
                            </Grid>
                        </CardBody>
                    </Card>
                </VStack>

                {/* Employee Table */}
                <Card bg={cardBg}>
                    <CardBody p={0}>
                        {filteredEmployees.length === 0 ? (
                            <Box p={8} textAlign="center">
                                <Text fontSize="lg" color="gray.500">
                                    No employees found
                                </Text>
                            </Box>
                        ) : (
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                                        <Tr>
                                            <Th>Employee</Th>
                                            <Th>Job Title</Th>
                                            <Th>Department</Th>
                                            <Th>Phone</Th>
                                            <Th>Status</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredEmployees.map((employee) => (
                                            <Tr key={employee.id} _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}>
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
                                                                {employee.email}
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                </Td>
                                                <Td>{employee.job_title}</Td>
                                                <Td>
                                                    <Badge colorScheme="blue" variant="subtle">
                                                        {employee.department?.name || "N/A"}
                                                    </Badge>
                                                </Td>
                                                <Td>{employee.phone_number || "N/A"}</Td>
                                                <Td>
                                                    <Badge colorScheme={employee.is_active ? "green" : "red"}>
                                                        {employee.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    <HStack spacing={1}>
                                                        <IconButton
                                                            icon={<FaEye />}
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="blue"
                                                            onClick={() => openViewModal(employee)}
                                                            aria-label="View employee"
                                                        />
                                                        {user?.role !== "Manager" && (
                                                            <IconButton
                                                                icon={<FaEdit />}
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="orange"
                                                                onClick={() => openEditModal(employee)}
                                                                aria-label="Edit employee"
                                                            />
                                                        )}
                                                        <IconButton
                                                            icon={<FaTrash />}
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="red"
                                                            onClick={() => openDeleteModal(employee)}
                                                            aria-label="Delete employee"
                                                        />
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </CardBody>
                </Card>
            </MotionBox>

            {/* Add Employee Modal */}
            <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Employee</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                            <GridItem>
                                <FormControl isRequired>
                                    <FormLabel>First Name</FormLabel>
                                    <Input
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl isRequired>
                                    <FormLabel>Last Name</FormLabel>
                                    <Input
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                                <FormControl isRequired>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Job Title</FormLabel>
                                    <Input
                                        value={formData.job_title}
                                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Department</FormLabel>
                                    <Select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Phone Number</FormLabel>
                                    <Input
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Date of Birth</FormLabel>
                                    <Input
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                                <FormControl display="flex" alignItems="center">
                                    <FormLabel mb="0">Active Status</FormLabel>
                                    <Switch
                                        isChecked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                </FormControl>
                            </GridItem>
                        </Grid>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onAddClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={() => handleSubmit(false)}>
                            Add Employee
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Employee Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Employee</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                            <GridItem>
                                <FormControl isRequired>
                                    <FormLabel>First Name</FormLabel>
                                    <Input
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl isRequired>
                                    <FormLabel>Last Name</FormLabel>
                                    <Input
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                                <FormControl isRequired>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Job Title</FormLabel>
                                    <Input
                                        value={formData.job_title}
                                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Department</FormLabel>
                                    <Select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Phone Number</FormLabel>
                                    <Input
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Date of Birth</FormLabel>
                                    <Input
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    />
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                                <FormControl display="flex" alignItems="center">
                                    <FormLabel mb="0">Active Status</FormLabel>
                                    <Switch
                                        isChecked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                </FormControl>
                            </GridItem>
                        </Grid>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEditClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={() => handleSubmit(true)}>
                            Update Employee
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* View Employee Modal */}
            <Modal isOpen={isViewOpen} onClose={onViewClose} size="4xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Employee Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedEmployee && (
                            <VStack spacing={6} align="stretch">
                                <HStack spacing={4}>
                                    <Avatar
                                        size="xl"
                                        name={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                                        src={`https://ui-avatars.com/api/?name=${selectedEmployee.first_name}+${selectedEmployee.last_name}&background=random&size=128`}
                                    />
                                    <VStack align="start" spacing={1}>
                                        <Heading size="lg">
                                            {selectedEmployee.first_name} {selectedEmployee.last_name}
                                        </Heading>
                                        <Text color="gray.600">{selectedEmployee.job_title}</Text>
                                        <Badge colorScheme={selectedEmployee.is_active ? "green" : "red"}>
                                            {selectedEmployee.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </VStack>
                                </HStack>

                                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            EMAIL
                                        </Text>
                                        <Text>{selectedEmployee.email}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            PHONE
                                        </Text>
                                        <Text>{selectedEmployee.phone_number || "N/A"}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            DEPARTMENT
                                        </Text>
                                        <Text>{selectedEmployee.department_details?.name || "N/A"}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            DATE OF BIRTH
                                        </Text>
                                        <Text>{selectedEmployee.date_of_birth || "N/A"}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            DATE JOINED
                                        </Text>
                                        <Text>{selectedEmployee.date_joined || "N/A"}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="semibold" color="gray.600" fontSize="sm">
                                            EMPLOYEE ID
                                        </Text>
                                        <Text>#{selectedEmployee.id}</Text>
                                    </Box>
                                </Grid>

                                {/* Attendance for this employee - visible to CEO/HR and also Manager (for their team) */}
                                <RoleBasedComponent allowedRoles={["CEO", "HR", "Manager"]}
                                    fallback={null}
                                >
                                    <Box mt={2}>
                                        <MonthlyAttendance title={`Attendance - ${selectedEmployee.first_name} ${selectedEmployee.last_name}`} employeeId={selectedEmployee.id} />
                                    </Box>
                                </RoleBasedComponent>
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
                    <ModalHeader>Delete Employee</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Alert status="warning">
                            <AlertIcon />
                            <Box>
                                <AlertTitle>Are you sure?</AlertTitle>
                                <AlertDescription>
                                    This action cannot be undone. This will permanently delete the employee{" "}
                                    <strong>
                                        {selectedEmployee?.first_name} {selectedEmployee?.last_name}
                                    </strong>{" "}
                                    and all associated data.
                                </AlertDescription>
                            </Box>
                        </Alert>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={handleDelete}>
                            Delete Employee
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    )
}

export default EmployeesPage
