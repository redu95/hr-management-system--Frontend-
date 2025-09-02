"use client"
import { useMemo, useState } from 'react'
import useAuthStore from '../store/authStore'
import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    IconButton,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Select,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useToast,
    Textarea,
    Badge,
    Divider,
} from '@chakra-ui/react'
import { FaEllipsisV, FaPlus, FaSearch, FaCheck, FaTrash } from 'react-icons/fa'
import { useTasks, useCreateTask, useMarkDone, useDeleteTask } from '../services/taskService'
import ApiService from '../services/apiService'
import { useEffect } from 'react'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer'
import KanbanBoard from '../components/tasks/KanbanBoard'

const PriorityBadge = ({ value }) => {
    const color = {
        low: 'gray',
        medium: 'blue',
        high: 'orange',
        critical: 'red',
    }[String(value || '').toLowerCase()] || 'gray'
    return <Badge colorScheme={color} textTransform="capitalize">{value}</Badge>
}

export default function TasksPage() {
    const toast = useToast()
    const [search, setSearch] = useState('')
    const [ordering, setOrdering] = useState('due_date')
    // const [priority, setPriority] = useState('')

    const [page, setPage] = useState(1)
    const { data, isLoading, isError, refetch } = useTasks({ search, ordering, page })
    const rows = useMemo(() => (data?.results || data || []), [data])
    const hasNext = Boolean(data?.next)
    const hasPrev = Boolean(data?.previous) || page > 1

    const createTask = useCreateTask()
    const markDone = useMarkDone()
    const delTask = useDeleteTask()

    const [form, setForm] = useState({
        title: '',
        description: '',
        department: '',
        assignee: '',
        due_date: '',
        priority: 'medium',
        estimate_hours: '',
    })

    const [departments, setDepartments] = useState([])
    const [deptLoading, setDeptLoading] = useState(false)
    const [deptError, setDeptError] = useState('')
    const [employeesList, setEmployeesList] = useState([])
    const [empLoading, setEmpLoading] = useState(false)
    const [empError, setEmpError] = useState('')

    const { user } = useAuthStore()

    useEffect(() => {
        const load = async () => {
            setDeptLoading(true)
            setDeptError('')
            try {
                const data = await ApiService.getDepartments()
                const list = Array.isArray(data) ? data : data?.results || []
                setDepartments(list)
            } catch (e) {
                setDeptError(e.message)
            } finally {
                setDeptLoading(false)
            }
        }
        load()
    }, [])

    // If user is Manager, load employees for their department
    useEffect(() => {
        const loadEmployees = async () => {
            if (!user || user.role !== 'Manager') return
            setEmpLoading(true)
            setEmpError('')
            try {
                // If backend provides department on user, use it; otherwise leave blank
                const deptId = user.department || ''
                const data = await ApiService.searchUsers({ role: 'employee', department: deptId })
                const list = Array.isArray(data) ? data : data?.results || []
                setEmployeesList(list)
            } catch (e) {
                setEmpError(e.message)
            } finally {
                setEmpLoading(false)
            }
        }
        loadEmployees()
    }, [user])

    const handleCreate = async () => {
        try {
            const payload = {
                title: form.title,
                description: form.description,
                priority: form.priority,
                estimate_hours: form.estimate_hours || undefined,
                due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined,
                department: form.department ? Number(form.department) : undefined,
                ...(form.assignee ? { assignees: [Number(form.assignee)] } : {}),
            }
            await createTask.mutateAsync(payload)
            toast({ title: 'Task created', status: 'success' })
            setForm({ title: '', description: '', department: '', due_date: '', priority: 'medium', estimate_hours: '' })
        } catch (e) {
            toast({ title: 'Create failed', description: e.message, status: 'error' })
        }
    }

    const bg = useColorModeValue('white', 'gray.800')
    const border = useColorModeValue('gray.200', 'gray.700')
    const [activeTaskId, setActiveTaskId] = useState(null)
    const [view, setView] = useState('kanban') // 'table' | 'kanban'

    return (
        <Stack spacing={6} padding={5}>
            <Flex align="center" justify="space-between">
                <Heading size="lg">Tasks</Heading>
            </Flex>

            {/* Create form - hide for Employee role */}
            {user?.role !== 'Employee' && (
                <Box bg={bg} borderWidth="1px" borderColor={border} borderRadius="md" p={4}>
                    <Heading size="sm" mb={3}>Create Task</Heading>
                <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
                    <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </Select>
                    {/* Role-based selector: Departments for CEO/HR, Employees for Manager */}
                    {user?.role === 'CEO' || user?.role === 'HR' ? (
                        <Select placeholder={deptLoading ? 'Loading departments...' : 'Select department'} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} isInvalid={!!deptError}>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name || `Department ${d.id}`}</option>
                            ))}
                        </Select>
                    ) : user?.role === 'Manager' ? (
                        <Select placeholder={empLoading ? 'Loading employees...' : 'Select employee'} value={form.assignee || ''} onChange={(e) => setForm({ ...form, assignee: e.target.value })} isInvalid={!!empError}>
                            {employeesList.map((emp) => (
                                <option key={emp.id} value={emp.id}>{emp.first_name ? `${emp.first_name} ${emp.last_name || ''}`.trim() : emp.username || emp.email || `User ${emp.id}`}</option>
                            ))}
                        </Select>
                    ) : null}
                    <Input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                    <Input placeholder="Estimate (hours)" value={form.estimate_hours} onChange={(e) => setForm({ ...form, estimate_hours: e.target.value })} />
                </Stack>
                <Textarea mt={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <HStack mt={3} justify="flex-end">
                    <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={handleCreate} isLoading={createTask.isPending}>
                        Add Task
                    </Button>
                </HStack>
                </Box>
            )}

            {/* Filters */}
            <Flex gap={3} align="center" wrap="wrap">
                <Box flex="1" position="relative">
                    <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} pl={9} />
                    <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.500">
                        <FaSearch />
                    </Box>
                </Box>
                <Select w="220px" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
                    <option value="due_date">Order by due date</option>
                    <option value="priority">Order by priority</option>
                    <option value="created_at">Order by created</option>
                </Select>
                <Select w="180px" value={view} onChange={(e) => setView(e.target.value)}>
                    <option value="table">Table view</option>
                    <option value="kanban">Kanban view</option>
                </Select>
                <Button onClick={() => refetch()} isLoading={isLoading}>Refresh</Button>
            </Flex>

            {view === 'table' ? (
                <Box bg={bg} borderWidth="1px" borderColor={border} borderRadius="md" overflowX="auto">
                    <Table size="sm">
                        <Thead>
                            <Tr>
                                <Th>Title</Th>
                                <Th>Priority</Th>
                                <Th>Status</Th>
                                <Th>Due</Th>
                                <Th>Assignees</Th>
                                <Th isNumeric>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {isError && (
                                <Tr>
                                    <Td colSpan={6}>
                                        <Text color="red.400">Failed to load tasks</Text>
                                    </Td>
                                </Tr>
                            )}
                            {!isLoading && rows.length === 0 && (
                                <Tr>
                                    <Td colSpan={6}>
                                        <Text color="gray.500">No tasks</Text>
                                    </Td>
                                </Tr>
                            )}
                            {rows.map((t) => (
                                <Tr key={t.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} onClick={() => setActiveTaskId(t.id)} cursor="pointer">
                                    <Td>
                                        <Text fontWeight="semibold">{t.title}</Text>
                                        {t.description && (
                                            <Text color="gray.500" noOfLines={1} fontSize="sm">{t.description}</Text>
                                        )}
                                    </Td>
                                    <Td><PriorityBadge value={t.priority} /></Td>
                                    <Td textTransform="capitalize">{t.status}</Td>
                                    <Td>{t.due_date ? new Date(t.due_date).toLocaleString() : '—'}</Td>
                                    <Td>{Array.isArray(t.assignees) ? t.assignees.length : 0}</Td>
                                    <Td isNumeric>
                                        <HStack justify="flex-end" spacing={1}>
                                            <IconButton aria-label="Mark done" icon={<FaCheck />} size="sm" variant="ghost" onClick={async (e) => {
                                                e.stopPropagation()
                                                try { await markDone.mutateAsync(t.id); toast({ title: 'Marked done', status: 'success' }) } catch (e) { toast({ title: 'Failed', description: e.message, status: 'error' }) }
                                            }} isLoading={markDone.isPending} />
                                            <IconButton aria-label="Delete" icon={<FaTrash />} size="sm" variant="ghost" colorScheme="red" onClick={async (e) => {
                                                e.stopPropagation()
                                                try { await delTask.mutateAsync(t.id); toast({ title: 'Deleted', status: 'success' }) } catch (e) { toast({ title: 'Failed', description: e.message, status: 'error' }) }
                                            }} isLoading={delTask.isPending} />
                                            <Menu>
                                                <MenuButton as={IconButton} aria-label="More" icon={<FaEllipsisV />} size="sm" variant="ghost" onClick={(e) => e.stopPropagation()} />
                                                <MenuList>
                                                    <MenuItem onClick={() => navigator.clipboard.writeText(String(t.id))}>Copy ID</MenuItem>
                                                    <MenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(t, null, 2))}>Copy JSON</MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            ) : (
                <KanbanBoard tasks={rows} onOpenTask={(t) => setActiveTaskId(t.id)} />
            )}
            <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                    {Array.isArray(rows) ? `${rows.length} of ${data?.count ?? rows.length}` : ''}
                </Text>
                <HStack>
                    <Button onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={!hasPrev}>Previous</Button>
                    <Text>Page {page}</Text>
                    <Button onClick={() => setPage((p) => (hasNext ? p + 1 : p))} isDisabled={!hasNext}>Next</Button>
                </HStack>
            </HStack>
            <Divider />
            <Text fontSize="sm" color="gray.500">Note: actions are permission-aware on the backend; this UI shows basic controls.</Text>

            <TaskDetailDrawer taskId={activeTaskId} isOpen={!!activeTaskId} onClose={() => setActiveTaskId(null)} />
        </Stack>
    )
}
