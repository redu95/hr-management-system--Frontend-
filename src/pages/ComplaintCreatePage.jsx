"use client"
import { useEffect, useState } from "react"
import { Box, Button, FormControl, FormLabel, Heading, HStack, Input, Radio, RadioGroup, Stack, Switch, Textarea, useToast, VStack } from "@chakra-ui/react"
import ApiService from "../services/apiService"
import UserPicker from "../components/tasks/UserPicker"
import useAuthStore from "../store/authStore"
import { useNavigate } from "react-router-dom"
import { useCreateComplaint } from "../hooks/useComplaints"

export default function ComplaintCreatePage() {
    const [type, setType] = useState("employee_complaint")
    const [subject, setSubject] = useState("")
    const [description, setDescription] = useState("")
    const [targetUser, setTargetUser] = useState(null)
    const [sendToCeo, setSendToCeo] = useState(true)
    const [saving, setSaving] = useState(false)
    const [me, setMe] = useState(null)
    const toast = useToast()
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const createComplaint = useCreateComplaint()

    const roleLower = (user?.role || "").toLowerCase()
    const isManager = roleLower === "manager"
    const isEmployee = roleLower === "employee"

    useEffect(() => {
        ApiService.fetchCurrentUser().then(setMe).catch(() => setMe(null))
    }, [])

    useEffect(() => {
        if (isManager) setType("manager_report")
        if (isEmployee) setType("employee_complaint")
    }, [isManager, isEmployee])

    const onSubmit = async () => {
        if (!subject || !description) {
            toast({ title: "Subject and description are required", status: "warning" })
            return
        }
        if (type === "manager_report" && !targetUser?.id) {
            toast({ title: "Please select a target employee", status: "warning" })
            return
        }

        const payload = {
            type,
            subject,
            description,
            ...(type === "manager_report" ? { target_user: targetUser.id } : {}),
            ...(type === "employee_complaint" ? { send_to_ceo: !!sendToCeo } : {}),
        }

        setSaving(true)
        createComplaint.mutate(payload, {
            onSuccess: (res) => { toast({ title: "Submitted", status: "success" }); navigate(`/complaints/${res.id}`) },
            onError: (e) => { const detail = e?.data ? JSON.stringify(e.data) : e.message; toast({ title: "Failed to submit", description: detail, status: "error", duration: 4000 }) },
            onSettled: () => setSaving(false),
        })
    }

    return (
        <VStack align="stretch" spacing={6} padding={4}>
            <Heading size="md">New Complaint / Report</Heading>

            <Box borderWidth="1px" borderRadius="lg" p={4}>
                <VStack align="stretch" spacing={4}>
                    <FormControl>
                        <FormLabel>Type</FormLabel>
                        <RadioGroup value={type} onChange={setType} isDisabled>
                            <Stack direction="row">
                                <Radio value="employee_complaint">Employee complaint</Radio>
                                <Radio value="manager_report">Manager report</Radio>
                            </Stack>
                        </RadioGroup>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Subject</FormLabel>
                        <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={255} placeholder="Subject" />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Description</FormLabel>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Describe the issue..." />
                    </FormControl>

                    {type === "manager_report" && (
                        <FormControl isRequired>
                            <FormLabel>Target employee</FormLabel>
                            <UserPicker role="employee" departmentId={me?.department?.id || null} onSelect={setTargetUser} />
                            {targetUser && <Box mt={2} fontSize="sm">Selected: {targetUser.first_name || ''} {targetUser.last_name || ''} ({targetUser.email})</Box>}
                        </FormControl>
                    )}

                    {type === "employee_complaint" && (
                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="sendToCeo" mb="0">Also notify CEO</FormLabel>
                            <Switch id="sendToCeo" isChecked={sendToCeo} onChange={(e) => setSendToCeo(e.target.checked)} />
                        </FormControl>
                    )}

                    <HStack>
                        <Button onClick={() => navigate(-1)} variant="ghost">Cancel</Button>
                        <Button colorScheme="blue" onClick={onSubmit} isLoading={saving}>Submit</Button>
                    </HStack>
                </VStack>
            </Box>
        </VStack>
    )
}
