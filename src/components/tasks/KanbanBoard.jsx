"use client"
import { useMemo } from 'react'
import { Badge, Box, Button, Heading, HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { useUpdateTask } from '../../services/taskService'

const Column = ({ title, color, items, onMove, onOpen }) => {
    const bg = useColorModeValue('gray.50', 'gray.800')
    const cardBg = useColorModeValue('white', 'gray.700')
    return (
        <Stack flex={1} minW={{ base: 'full', md: '300px' }} spacing={3} bg={bg} p={3} borderRadius="md" borderWidth="1px">
            <HStack justify="space-between">
                <Heading size="sm">{title}</Heading>
                <Badge colorScheme={color}>{items.length}</Badge>
            </HStack>
            {items.map((t) => (
                <Box key={t.id} p={3} bg={cardBg} borderWidth="1px" borderRadius="md" _hover={{ shadow: 'sm' }}>
                    <Text fontWeight="semibold" cursor="pointer" onClick={() => onOpen?.(t)}>{t.title}</Text>
                    <Text fontSize="sm" color="gray.500" noOfLines={2}>{t.description}</Text>
                    <HStack mt={2} justify="space-between">
                        <Badge textTransform="capitalize" colorScheme={{ low: 'gray', medium: 'blue', high: 'orange', critical: 'red' }[t.priority] || 'gray'}>{t.priority}</Badge>
                        <HStack>
                            {onMove && (
                                <>
                                    <Button size="xs" onClick={() => onMove(t, 'todo')}>To do</Button>
                                    <Button size="xs" onClick={() => onMove(t, 'in_progress')}>In progress</Button>
                                    <Button size="xs" onClick={() => onMove(t, 'done')}>Done</Button>
                                </>
                            )}
                        </HStack>
                    </HStack>
                </Box>
            ))}
            {items.length === 0 && <Text color="gray.500">No tasks</Text>}
        </Stack>
    )
}

export default function KanbanBoard({ tasks = [], onOpenTask }) {
    const updateTask = useUpdateTask()
    const byStatus = useMemo(() => ({
        todo: tasks.filter((t) => t.status === 'todo'),
        in_progress: tasks.filter((t) => t.status === 'in_progress'),
        done: tasks.filter((t) => t.status === 'done'),
    }), [tasks])

    const moveTo = async (task, status) => {
        if (!task || task.status === status) return
        try {
            await updateTask.mutateAsync({ id: task.id, data: { status } })
        } catch (_) { }
    }

    return (
        <HStack align="flex-start" spacing={4} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
            <Column title="To do" color="gray" items={byStatus.todo} onMove={moveTo} onOpen={onOpenTask} />
            <Column title="In progress" color="blue" items={byStatus.in_progress} onMove={moveTo} onOpen={onOpenTask} />
            <Column title="Done" color="green" items={byStatus.done} onMove={moveTo} onOpen={onOpenTask} />
        </HStack>
    )
}
