"use client"
import { Box, Heading, HStack, Text, VStack, Divider, Button, useToast, Select, Spinner } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ApiService from "../services/apiService"
import ComplaintStatusBadge from "../components/common/ComplaintStatusBadge"
import useAuthStore from "../store/authStore"

export default function ComplaintDetailPage() {
    const { id } = useParams()
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(false)
    const toast = useToast()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const canUpdateStatus = ["HR", "CEO"].includes(user?.role)

    const load = async () => {
        setLoading(true)
        try {
            const res = await ApiService.getComplaint(id)
            setItem(res)
        } catch (err) {
            toast({ title: "Not found or no access", description: err.message, status: "error" })
            navigate("/complaints")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [id])

    const onSetStatus = async (status) => {
        try {
            await ApiService.setComplaintStatus(id, status)
            toast({ title: "Status updated", status: "success" })
            load()
        } catch (err) {
            toast({ title: "Failed to update status", description: err.message, status: "error" })
        }
    }

    if (loading && !item) {
        return (
            <HStack p={4}><Spinner size="sm" /><Text>Loading...</Text></HStack>
        )
    }
    if (!item) return null

    return (
        <VStack align="stretch" spacing={4} padding={4}>
            <HStack justify="space-between">
                <Heading size="md">Complaint #{item.id}</Heading>
                <HStack>
                    <ComplaintStatusBadge status={item.status} />
                    {canUpdateStatus && (
                        <Select size="sm" value={item.status} onChange={(e) => onSetStatus(e.target.value)}>
                            <option value="open">open</option>
                            <option value="in_review">in_review</option>
                            <option value="resolved">resolved</option>
                            <option value="dismissed">dismissed</option>
                        </Select>
                    )}
                </HStack>
            </HStack>

            <Box borderWidth="1px" borderRadius="lg" p={4}>
                <VStack align="stretch" spacing={2}>
                    <HStack>
                        <Text fontWeight="medium">Type:</Text>
                        <Text>{item.type?.replace(/_/g, " ")}</Text>
                    </HStack>
                    <HStack>
                        <Text fontWeight="medium">Subject:</Text>
                        <Text>{item.subject}</Text>
                    </HStack>
                    <HStack>
                        <Text fontWeight="medium">Created By:</Text>
                        <Text>{item.created_by ? `${item.created_by.first_name || ''} ${item.created_by.last_name || ''}`.trim() || item.created_by.email : "-"}</Text>
                    </HStack>
                    <HStack>
                        <Text fontWeight="medium">Target:</Text>
                        <Text>{item.target_user_detail ? `${item.target_user_detail.first_name || ''} ${item.target_user_detail.last_name || ''}`.trim() || item.target_user_detail.email : "-"}</Text>
                    </HStack>
                    <HStack>
                        <Text fontWeight="medium">Send to CEO:</Text>
                        <Text>{String(item.send_to_ceo)}</Text>
                    </HStack>
                    <HStack>
                        <Text fontWeight="medium">Created:</Text>
                        <Text>{new Date(item.created_at).toLocaleString()}</Text>
                    </HStack>
                    <HStack>
                        <Text fontWeight="medium">Updated:</Text>
                        <Text>{new Date(item.updated_at).toLocaleString()}</Text>
                    </HStack>
                    <Divider />
                    <Box>
                        <Text fontWeight="medium" mb={2}>Description</Text>
                        <Text whiteSpace="pre-wrap">{item.description}</Text>
                    </Box>
                </VStack>
            </Box>

            <HStack>
                <Button onClick={() => navigate(-1)} variant="ghost">Back</Button>
                <Button onClick={() => navigate("/complaints")} variant="outline">All Complaints</Button>
            </HStack>
        </VStack>
    )
}
