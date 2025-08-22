"use client"
import { useEffect, useMemo, useState } from 'react'
import {
    Avatar,
    Badge,
    Box,
    Button,
    Divider,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    HStack,
    IconButton,
    Input,
    Select,
    Spinner,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    Textarea,
    useToast,
    VisuallyHidden,
} from '@chakra-ui/react'
import { FaCheck, FaPlus, FaTrash } from 'react-icons/fa'
import {
    useTask,
    useUpdateTask,
    useAssignTask,
    useUnassignTask,
    useTaskComments,
    useCreateComment,
    useTaskAttachments,
    useUploadAttachment,
    useTaskAssignmentHistory,
} from '../../services/taskService'
import ApiService from '../../services/apiService'
import UserPicker from './UserPicker'
import useAuthStore from '../../store/authStore'

const Field = ({ label, children }) => (
    <Stack spacing={1}>
        <Text fontSize="xs" color="gray.500">{label}</Text>
        {children}
    </Stack>
)

function DepartmentSelect({ value, onChange, isDisabled = false }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError('')
            try {
                const data = await ApiService.getDepartments()
                const list = Array.isArray(data) ? data : data?.results || []
                setItems(list)
            } catch (e) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <Select w="260px" value={value} onChange={(e) => onChange?.(e.target.value)} isDisabled={isDisabled} isInvalid={!!error} placeholder={loading ? 'Loading...' : 'Select department'}>
            {items.map((d) => (
                <option key={d.id} value={d.id}>{d.name || `Department ${d.id}`}</option>
            ))}
        </Select>
    )
}

export default function TaskDetailDrawer({ taskId, isOpen, onClose }) {
    const toast = useToast()
    const { data: task, isLoading, refetch } = useTask(taskId)
        const { user, hasPermission } = useAuthStore()
    const updateTask = useUpdateTask()
    const assignTask = useAssignTask()
    const unassignTask = useUnassignTask()
    const { data: commentsData } = useTaskComments({ task: taskId })
    const createComment = useCreateComment()
    const { data: attachmentsData } = useTaskAttachments({ task: taskId })
    const uploadAttachment = useUploadAttachment()
    const { data: historyData } = useTaskAssignmentHistory({ task: taskId })

    const comments = useMemo(() => commentsData?.results || commentsData || [], [commentsData])
    const attachments = useMemo(() => attachmentsData?.results || attachmentsData || [], [attachmentsData])
    const history = useMemo(() => historyData?.results || historyData || [], [historyData])

        const [edit, setEdit] = useState({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', department: '' })
    useEffect(() => {
        if (task) {
            setEdit({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                status: task.status || 'todo',
                    due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
                    department: task.department || '',
            })
        }
    }, [task])

    const handleSave = async () => {
        try {
            await updateTask.mutateAsync({
                id: taskId,
                data: {
                    title: edit.title,
                    description: edit.description,
                    priority: edit.priority,
                    status: edit.status,
                      due_date: edit.due_date ? new Date(edit.due_date).toISOString() : null,
                      ...(edit.department ? { department: Number(edit.department) } : {}),
                },
            })
            toast({ title: 'Task updated', status: 'success' })
            refetch()
        } catch (e) {
            toast({ title: 'Update failed', description: e.message, status: 'error' })
        }
    }

    const onSelectUser = async (u) => {
        try {
            await assignTask.mutateAsync({ id: taskId, assignees: [u.id] })
            toast({ title: `Assigned to ${u.username || u.email || u.id}`, status: 'success' })
            refetch()
        } catch (e) {
            toast({ title: 'Assign failed', description: e.message, status: 'error' })
        }
    }

    const onUnassign = async (uid) => {
        try {
            await unassignTask.mutateAsync({ id: taskId, assignees: [uid] })
            toast({ title: 'Unassigned', status: 'success' })
            refetch()
        } catch (e) {
            toast({ title: 'Unassign failed', description: e.message, status: 'error' })
        }
    }

    const [commentInput, setCommentInput] = useState('')
    const onAddComment = async () => {
        if (!commentInput.trim()) return
        try {
            await createComment.mutateAsync({ task: taskId, content: commentInput })
            setCommentInput('')
            toast({ title: 'Comment added', status: 'success' })
            refetch()
        } catch (e) {
            toast({ title: 'Comment failed', description: e.message, status: 'error' })
        }
    }

    const onUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            await uploadAttachment.mutateAsync({ task: taskId, file })
            toast({ title: 'Attachment uploaded', status: 'success' })
            refetch()
        } catch (er) {
            toast({ title: 'Upload failed', description: er.message, status: 'error' })
        }
    }

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Task #{taskId}</DrawerHeader>
                <DrawerBody>
                    {isLoading ? (
                        <Flex align="center" justify="center" h="200px"><Spinner /></Flex>
                    ) : !task ? (
                        <Text>Task not found.</Text>
                    ) : (
                        <Tabs variant="enclosed" isFitted>
                            <TabList>
                                <Tab>Details</Tab>
                                <Tab>Assignees</Tab>
                                <Tab>Comments</Tab>
                                <Tab>Attachments</Tab>
                                <Tab>History</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <Stack spacing={4}>
                                        <Field label="Title">
                                            <Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
                                        </Field>
                                        <Field label="Description">
                                            <Textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
                                        </Field>
                                        <HStack>
                                            <Field label="Priority">
                                                <Select w="200px" value={edit.priority} onChange={(e) => setEdit({ ...edit, priority: e.target.value })}>
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="critical">Critical</option>
                                                </Select>
                                            </Field>
                                            <Field label="Status">
                                                <Select w="200px" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                                                    <option value="todo">To do</option>
                                                    <option value="in_progress">In progress</option>
                                                    <option value="done">Done</option>
                                                </Select>
                                            </Field>
                                            <Field label="Due date">
                                                <Input type="datetime-local" w="260px" value={edit.due_date} onChange={(e) => setEdit({ ...edit, due_date: e.target.value })} />
                                            </Field>
                                                        </HStack>
                                                        <HStack>
                                                            <Field label="Department">
                                                                <DepartmentSelect value={edit.department} onChange={(v) => setEdit({ ...edit, department: v })} isDisabled={!(user?.role === 'HR' || user?.role === 'CEO')} />
                                                            </Field>
                                        </HStack>
                                        <HStack justify="flex-end">
                                            <Button leftIcon={<FaCheck />} colorScheme="blue" onClick={handleSave} isLoading={updateTask.isPending}>Save</Button>
                                        </HStack>
                                    </Stack>
                                </TabPanel>
                                <TabPanel>
                                    <Stack spacing={3}>
                                        <UserPicker onSelect={onSelectUser} departmentId={edit.department || task?.department || null} role="employee" />
                                        <Divider />
                                        <Stack>
                                            <Text fontWeight="bold">Current assignees</Text>
                                            <Stack>
                                                {(task.assignees || []).length === 0 && <Text color="gray.500">No assignees</Text>}
                                                {(task.assignees || []).map((uid) => (
                                                    <HStack key={uid} justify="space-between">
                                                        <Text>user:{uid}</Text>
                                                        <IconButton aria-label="remove" icon={<FaTrash />} size="sm" onClick={() => onUnassign(uid)} isLoading={unassignTask.isPending} />
                                                    </HStack>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                </TabPanel>
                                <TabPanel>
                                    <Stack spacing={3}>
                                        <Textarea placeholder="Write a comment" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} />
                                        <HStack justify="flex-end">
                                            <Button onClick={onAddComment} isLoading={createComment.isPending}>Comment</Button>
                                        </HStack>
                                        <Divider />
                                        <Stack>
                                            {(comments || []).length === 0 && <Text color="gray.500">No comments</Text>}
                                            {(comments || []).map((c) => (
                                                <Box key={c.id} p={3} borderWidth="1px" borderRadius="md">
                                                    <HStack justify="space-between">
                                                        <Text fontWeight="semibold">user:{c.author}</Text>
                                                        <Text fontSize="xs" color="gray.500">{new Date(c.created_at).toLocaleString()}</Text>
                                                    </HStack>
                                                    <Text mt={2}>{c.content}</Text>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Stack>
                                </TabPanel>
                                <TabPanel>
                                    <Stack spacing={3}>
                                        <Button as="label" w="fit-content">
                                            <VisuallyHidden as="input" type="file" onChange={onUpload} />
                                            Upload file
                                        </Button>
                                        <Divider />
                                        <Stack>
                                            {(attachments || []).length === 0 && <Text color="gray.500">No attachments</Text>}
                                            {(attachments || []).map((a) => (
                                                <HStack key={a.id} justify="space-between" p={2} borderWidth="1px" borderRadius="md">
                                                    <Text isTruncated maxW="70%">{a.file}</Text>
                                                    <Text fontSize="xs" color="gray.500">{new Date(a.uploaded_at).toLocaleString()}</Text>
                                                </HStack>
                                            ))}
                                        </Stack>
                                    </Stack>
                                </TabPanel>
                                <TabPanel>
                                    <Stack>
                                        {(history || []).length === 0 && <Text color="gray.500">No history</Text>}
                                        {(history || []).map((h) => (
                                            <HStack key={h.id} justify="space-between" p={2} borderWidth="1px" borderRadius="md">
                                                <Text>Assigned to user:{h.assigned_to} by user:{h.assigned_by}</Text>
                                                <Text fontSize="xs" color="gray.500">{new Date(h.created_at).toLocaleString()}</Text>
                                            </HStack>
                                        ))}
                                    </Stack>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    )}
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    )
}
