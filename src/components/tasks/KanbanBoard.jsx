"use client"
import { useMemo } from 'react'
import { Badge, Box, Heading, HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useUpdateTask } from '../../services/taskService'

const Card = ({ t, index, onOpen }) => {
    const cardBg = useColorModeValue('white', 'gray.700')
    return (
        <Draggable draggableId={String(t.id)} index={index}>
            {(provided, snapshot) => (
                <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    p={3}
                    bg={cardBg}
                    borderWidth="1px"
                    borderRadius="md"
                    _hover={{ shadow: 'sm' }}
                    opacity={snapshot.isDragging ? 0.9 : 1}
                >
                    <Text fontWeight="semibold" cursor="pointer" onClick={() => onOpen?.(t)}>
                        {t.title}
                    </Text>
                    {t.description && (
                        <Text fontSize="sm" color="gray.500" noOfLines={2}>
                            {t.description}
                        </Text>
                    )}
                    <HStack mt={2} justify="space-between">
                        <Badge textTransform="capitalize" colorScheme={{ low: 'gray', medium: 'blue', high: 'orange', critical: 'red' }[t.priority] || 'gray'}>
                            {t.priority}
                        </Badge>
                        {t.due_date && (
                            <Text fontSize="xs" color="gray.500">{new Date(t.due_date).toLocaleDateString()}</Text>
                        )}
                    </HStack>
                </Box>
            )}
        </Draggable>
    )
}

const Column = ({ droppableId, title, color, items, onOpen }) => {
    const bg = useColorModeValue('gray.50', 'gray.800')
    return (
        <Stack flex={1} minW={{ base: 'full', md: '320px' }} spacing={3} bg={bg} p={3} borderRadius="md" borderWidth="1px">
            <HStack justify="space-between">
                <Heading size="sm">{title}</Heading>
                <Badge colorScheme={color}>{items.length}</Badge>
            </HStack>
            <Droppable droppableId={droppableId} type="TASK">
                {(provided, snapshot) => (
                    <Stack ref={provided.innerRef} {...provided.droppableProps} spacing={3} minH="40px"
                        bg={snapshot.isDraggingOver ? 'blackAlpha.50' : 'transparent'} borderRadius="md">
                        {items.map((t, idx) => (
                            <Card key={t.id} t={t} index={idx} onOpen={onOpen} />
                        ))}
                        {provided.placeholder}
                        {items.length === 0 && !snapshot.isDraggingOver && (
                            <Text color="gray.500">No tasks</Text>
                        )}
                    </Stack>
                )}
            </Droppable>
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

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result || {}
        if (!destination) return
        if (destination.droppableId === source.droppableId) return
        const id = Number(draggableId)
        const nextStatus = destination.droppableId
        try {
            await updateTask.mutateAsync({ id, data: { status: nextStatus } })
        } catch (_) {
            // ignore failure; React Query invalidation will keep UI consistent
        }
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <HStack align="flex-start" spacing={4} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
                <Column droppableId="todo" title="To do" color="gray" items={byStatus.todo} onOpen={onOpenTask} />
                <Column droppableId="in_progress" title="In progress" color="blue" items={byStatus.in_progress} onOpen={onOpenTask} />
                <Column droppableId="done" title="Done" color="green" items={byStatus.done} onOpen={onOpenTask} />
            </HStack>
        </DragDropContext>
    )
}
