"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Grid,
    GridItem,
    FormControl,
    FormLabel,
    Input,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    InputGroup,
    InputRightElement,
    IconButton,
    Switch,
    Tabs,
    TabList,
    TabPanels,
    TabPanel,
    Tab,
    useToast,
    useColorModeValue,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaCog, FaEye, FaEyeSlash, FaCheck } from "react-icons/fa"
import ApiService from "../services/apiService"
import useAuthStore from "../store/authStore"
import { useCeoLogs } from "../hooks/useCeoLogs"
import useMe from "../hooks/useMe"

const MotionBox = motion(Box)

const SettingsPage = () => {
    const toast = useToast()

    // Profile state (fetched from backend)
    const { data: me, isLoading: meLoading, refetch: refetchMe } = useMe()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.600", "gray.300")
    const headingColor = useColorModeValue("gray.800", "gray.100")

    // Profile mutations
    const updateProfile = useMutation({
        mutationFn: (payload) => ApiService.updateCurrentUser(payload),
        onSuccess: async () => {
            toast({ title: "Profile updated", status: "success" })
            await refetchMe()
        },
        onError: (e) => toast({ title: "Failed to update profile", description: e?.message, status: "error" }),
    })

    const changePasswordMut = useMutation({
        mutationFn: ({ old_password, new_password }) => ApiService.changePassword({ old_password, new_password }),
        onSuccess: () => {
            toast({ title: "Password changed", status: "success" })
            setOldPassword("")
            setNewPassword("")
        },
        onError: (e) => toast({ title: "Failed to change password", description: e?.message, status: "error" }),
    })

    useEffect(() => {
        if (me) {
            setFirstName(me.first_name || "")
            setLastName(me.last_name || "")
            setEmail(me.email || "")
        }
    }, [me])

    // Annual Leave Settings
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    // Backend permission: only users with role 'ceo' can manage system settings.
    const isAdminForSettings = (user?.role || "").toLowerCase() === "ceo"
    // Start empty so the UI doesn't show 0 before settings are loaded
    const [annualMaxDays, setAnnualMaxDays] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    // Full settings list UI (allowed keys)
    const allowedSettings = [
        { key: 'annual_leave_request_max_days', label: 'Annual Leave Cap (days)', type: 'int' },
        // Add more allowed keys here as backend allows them
    ]
    const [settingsMap, setSettingsMap] = useState({})
    const [inputs, setInputs] = useState({})
    const [savingMap, setSavingMap] = useState({})
    // CEO logs state
    const [logPage, setLogPage] = useState(1)
    const [logFilters, setLogFilters] = useState({ action: "", actor: "", path: "" })
    const { data: logsData, isFetching: logsLoading } = useCeoLogs(logPage, logFilters)

    // React Query: fetch single key and list
    const { data: annualSetting, isLoading: isAnnualLoading } = useQuery({
        queryKey: ['systemSetting', 'annual_leave_request_max_days'],
        queryFn: () => ApiService.getSystemSettingByKey('annual_leave_request_max_days'),
        enabled: isAdminForSettings,
    })

    const { data: settingsList, isLoading: isListLoading } = useQuery({
        queryKey: ['systemSettings'],
        queryFn: () => ApiService.getSystemSettings(),
        enabled: isAdminForSettings,
    })

    // Derive loaded flag
    const settingsLoaded = isAdminForSettings && !isAnnualLoading

    // When queries resolve, populate local input state
    useEffect(() => {
        if (annualSetting && (annualSetting.int_value ?? annualSetting.int_value === 0)) {
            setAnnualMaxDays(annualSetting.int_value)
        }
    }, [annualSetting])

    useEffect(() => {
        if (!settingsList) return
        const results = Array.isArray(settingsList) ? settingsList : settingsList.results || []
        const map = {}
        results.forEach(item => { map[item.key] = item })
        setSettingsMap(map)
        const newInputs = {}
        allowedSettings.forEach(s => {
            const existing = map[s.key]
            newInputs[s.key] = existing ? (existing.int_value ?? '') : ''
        })
        setInputs(newInputs)
    }, [settingsList])

    // Shared upsert mutation for by-key update/create
    const upsertSettingMutation = useMutation({
        mutationFn: async ({ key, int_value }) => {
            try {
                return await ApiService.updateSystemSettingByKey(key, { int_value })
            } catch (err) {
                if (err?.status === 404) {
                    try {
                        return await ApiService.createSystemSettingByKey(key, { int_value, description: `${key}` })
                    } catch (e2) {
                        if (e2?.status === 400 && e2?.data?.setting) {
                            return await ApiService.updateSystemSettingByKey(key, { int_value })
                        }
                        throw e2
                    }
                }
                throw err
            }
        },
        onSuccess: (_data, vars) => {
            // Invalidate both the key and the list
            queryClient.invalidateQueries({ queryKey: ['systemSetting', vars.key] })
            queryClient.invalidateQueries({ queryKey: ['systemSettings'] })
        },
    })

    const handleSaveAnnualMax = async () => {
        setIsSaving(true)
        try {
            const valueNum = Number(annualMaxDays)
            const updated = await upsertSettingMutation.mutateAsync({ key: 'annual_leave_request_max_days', int_value: valueNum })
            setAnnualMaxDays(updated.int_value ?? valueNum)
            toast({ title: updated?.created ? 'Created' : 'Saved', description: 'Annual leave cap updated', status: 'success', duration: 3000 })
        } catch (e) {
            console.error('Failed saving system setting', e)
            toast({ title: 'Error', description: e?.message || 'Failed to save', status: 'error', duration: 4000 })
        } finally {
            setIsSaving(false)
        }
    }

    // Per-key save handler for the settings list
    const handleSaveKey = async (key) => {
        const raw = inputs[key]
        const num = Number(raw)
        setSavingMap(m => ({ ...m, [key]: true }))
        try {
            const updated = await upsertSettingMutation.mutateAsync({ key, int_value: num })
            setSettingsMap(m => ({ ...m, [key]: updated }))
            toast({ title: 'Saved', description: `${key} updated`, status: 'success', duration: 3000 })
        } catch (e) {
            console.error('Failed saving key', key, e)
            toast({ title: 'Error', description: e?.message || `Failed to save ${key}`, status: 'error', duration: 4000 })
        } finally {
            setSavingMap(m => ({ ...m, [key]: false }))
        }
    }

    return (
        <Container maxW="7xl" py={8}>
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {/* Page Header */}
                <VStack spacing={1} align="start" mb={8}>
                    <Heading size="xl" color="blue.600">
                        <HStack>
                            <FaCog />
                            <Text>Settings</Text>
                        </HStack>
                    </Heading>
                    <Text color={textColor}>Manage your profile, notifications, and company settings.</Text>
                </VStack>

                {/* Removed static leave balance section (no API) */}

                {/* Tabbed View for Settings */}
                <Card bg={cardBg} shadow="lg">
                    <CardBody p={0}>
                        <Tabs variant="enclosed" colorScheme="blue">
                            <TabList>
                                <Tab
                                    _selected={{
                                        bg: useColorModeValue("blue.50", "blue.900"),
                                        color: useColorModeValue("blue.700", "blue.200"),
                                    }}
                                >
                                    Profile
                                </Tab>
                                <Tab
                                    _selected={{
                                        bg: useColorModeValue("blue.50", "blue.900"),
                                        color: useColorModeValue("blue.700", "blue.200"),
                                    }}
                                >
                                    System
                                </Tab>
                                {isAdminForSettings && (
                                    <Tab _selected={{ bg: useColorModeValue("blue.50", "blue.900"), color: useColorModeValue("blue.700", "blue.200") }}>
                                        System Logs
                                    </Tab>
                                )}
                            </TabList>

                            <TabPanels p={6}>
                                {/* Profile Settings Tab */}
                                <TabPanel>
                                    <Heading size="md" mb={4} color={headingColor}>
                                        Your Profile
                                    </Heading>
                                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} maxW="2xl">
                                        <FormControl isRequired>
                                            <FormLabel>First Name</FormLabel>
                                            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} isDisabled={meLoading || updateProfile.isPending} />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Last Name</FormLabel>
                                            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} isDisabled={meLoading || updateProfile.isPending} />
                                        </FormControl>
                                        <GridItem colSpan={{ base: 1, md: 2 }}>
                                            <FormControl>
                                                <FormLabel>Email Address</FormLabel>
                                                <Input value={email} isDisabled />
                                            </FormControl>
                                        </GridItem>
                                    </Grid>
                                    <Button leftIcon={<FaCheck />} colorScheme="blue" mt={6} onClick={() => updateProfile.mutate({ first_name: firstName, last_name: lastName })} isLoading={updateProfile.isPending}>
                                        Save Profile
                                    </Button>

                                    <Heading size="sm" mt={10} mb={3} color={headingColor}>Change Password</Heading>
                                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} maxW="2xl">
                                        <FormControl isRequired>
                                            <FormLabel>Current Password</FormLabel>
                                            <Input type={showPassword ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>New Password</FormLabel>
                                            <InputGroup>
                                                <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                                                <InputRightElement>
                                                    <IconButton variant="ghost" icon={showPassword ? <FaEyeSlash /> : <FaEye />} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} />
                                                </InputRightElement>
                                            </InputGroup>
                                        </FormControl>
                                    </Grid>
                                    <Button leftIcon={<FaCheck />} colorScheme="blue" mt={6} onClick={() => changePasswordMut.mutate({ old_password: oldPassword, new_password: newPassword })} isLoading={changePasswordMut.isPending}>
                                        Change Password
                                    </Button>
                                </TabPanel>

                                {/* System Settings Tab */}
                                <TabPanel>
                                    {/* System-level annual leave cap (CEO-only) */}
                                    {isAdminForSettings && (
                                        <Box mt={6}>
                                            <Heading size="sm" mb={3} color={headingColor}>
                                                System Settings
                                            </Heading>
                                            <VStack align="stretch" spacing={4}>
                                                {/* Quick single-value save remains for backward compatibility */}
                                                <FormControl maxW="xs">
                                                    <FormLabel>Annual Leave Cap (days)</FormLabel>
                                                    <NumberInput
                                                        min={0}
                                                        value={settingsLoaded && annualMaxDays !== "" ? annualMaxDays : undefined}
                                                        onChange={(str, num) => setAnnualMaxDays(num)}
                                                        isDisabled={!settingsLoaded}
                                                    >
                                                        <NumberInputField placeholder={settingsLoaded ? "" : "Loading..."} />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                                <Button mt={0} colorScheme="blue" onClick={handleSaveAnnualMax} isLoading={isSaving || !settingsLoaded}>
                                                    Save Annual Leave Cap
                                                </Button>

                                                {/* Other allowed settings (inline) */}
                                                <Box pt={4}>
                                                    <Heading size="sm" mb={3}>All System Settings</Heading>
                                                    <VStack align="stretch" spacing={3} maxW="md">
                                                        {allowedSettings
                                                            .filter(s => s.key !== 'annual_leave_request_max_days')
                                                            .map((s) => (
                                                                <HStack key={s.key} spacing={3} align="end">
                                                                    <FormControl>
                                                                        <FormLabel mb={1}>{s.label}</FormLabel>
                                                                        <NumberInput
                                                                            min={0}
                                                                            value={inputs[s.key] ?? ''}
                                                                            onChange={(str, num) => setInputs(prev => ({ ...prev, [s.key]: num }))}
                                                                            isDisabled={isListLoading}
                                                                        >
                                                                            <NumberInputField placeholder={isListLoading ? 'Loading...' : ''} />
                                                                            <NumberInputStepper>
                                                                                <NumberIncrementStepper />
                                                                                <NumberDecrementStepper />
                                                                            </NumberInputStepper>
                                                                        </NumberInput>
                                                                    </FormControl>
                                                                    <Button
                                                                        onClick={() => handleSaveKey(s.key)}
                                                                        isLoading={!!savingMap[s.key]}
                                                                        colorScheme="blue"
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                </HStack>
                                                            ))}
                                                    </VStack>
                                                </Box>
                                            </VStack>
                                        </Box>
                                    )}
                                </TabPanel>

                                {/* CEO-only: System Logs */}
                                {isAdminForSettings && (
                                    <TabPanel>
                                        <Heading size="md" mb={4} color={headingColor}>System Logs</Heading>
                                        <Text color={textColor} mb={4}>Recent API actions across the system. CEO visibility only.</Text>

                                        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={4} maxW="4xl">
                                            <FormControl>
                                                <FormLabel>Action</FormLabel>
                                                <Input placeholder="e.g. api_call, user_disabled" value={logFilters.action}
                                                    onChange={(e) => setLogFilters(f => ({ ...f, action: e.target.value }))} />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel>Actor (email contains)</FormLabel>
                                                <Input placeholder="actor email contains" value={logFilters.actor}
                                                    onChange={(e) => setLogFilters(f => ({ ...f, actor: e.target.value }))} />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel>Path contains</FormLabel>
                                                <Input placeholder="/api/..." value={logFilters.path}
                                                    onChange={(e) => setLogFilters(f => ({ ...f, path: e.target.value }))} />
                                            </FormControl>
                                        </Grid>

                                        <Card bg={cardBg} shadow="md">
                                            <CardBody p={0}>
                                                <Box overflowX="auto">
                                                    <Grid templateColumns={{ base: "1fr" }}>
                                                        <Box>
                                                            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 3fr" }} gap={0} px={4} py={3} borderBottomWidth="1px" fontWeight="semibold">
                                                                <Box>Timestamp</Box>
                                                                <Box>Actor</Box>
                                                                <Box>Action</Box>
                                                                <Box>Summary</Box>
                                                            </Grid>
                                                            {logsLoading && (
                                                                <Box px={4} py={3}><Text color={textColor}>Loading...</Text></Box>
                                                            )}
                                                            {!logsLoading && (
                                                                (Array.isArray(logsData?.results) ? logsData.results : []).map((row) => (
                                                                    <Grid key={row.id} templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 3fr" }} gap={0} px={4} py={3} borderBottomWidth="1px">
                                                                        <Box>{new Date(row.timestamp).toLocaleString()}</Box>
                                                                        <Box>{row.actor_email || "-"}</Box>
                                                                        <Box>{row.action || "api_call"}</Box>
                                                                        <Box>{row.summary || `${row.method} ${row.path} -> ${row.status_code}`}</Box>
                                                                    </Grid>
                                                                ))
                                                            )}
                                                            {!logsLoading && (!logsData?.results || logsData.results.length === 0) && (
                                                                <Box px={4} py={3}><Text color={textColor}>No logs.</Text></Box>
                                                            )}
                                                        </Box>
                                                    </Grid>
                                                </Box>
                                            </CardBody>
                                        </Card>

                                        <HStack mt={4}>
                                            <Button variant="outline" onClick={() => setLogPage(p => Math.max(1, p - 1))} isDisabled={!logsData?.previous}>Previous</Button>
                                            <Text color={textColor}>Page {logPage}</Text>
                                            <Button variant="outline" onClick={() => setLogPage(p => (logsData?.next ? p + 1 : p))} isDisabled={!logsData?.next}>Next</Button>
                                        </HStack>
                                    </TabPanel>
                                )}
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>
            </MotionBox>
        </Container>
    )
}

export default SettingsPage
