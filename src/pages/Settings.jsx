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
    Card,
    CardBody,
    Grid,
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

const MotionBox = motion(Box)

const SettingsPage = () => {
    const toast = useToast()

    // State for Profile Settings
    const [name, setName] = useState("Alex Turner")
    const [email, setEmail] = useState("admin@company.com")
    const [newPassword, setNewPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    // State for Notification Settings
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [pushNotifications, setPushNotifications] = useState(false)

    const cardBg = useColorModeValue("white", "gray.800")
    const balanceCardBgLight = useColorModeValue("blue.50", "blue.900")
    const balanceCardBgAmber = useColorModeValue("yellow.50", "yellow.900")
    const balanceCardBgGreen = useColorModeValue("green.50", "green.900")
    const balanceCardTextLight = useColorModeValue("blue.700", "blue.300")
    const balanceCardTextAmber = useColorModeValue("yellow.700", "yellow.300")
    const balanceCardTextGreen = useColorModeValue("green.700", "green.300")
    const textColor = useColorModeValue("gray.600", "gray.300")
    const headingColor = useColorModeValue("gray.800", "gray.100")

    const handleSaveProfile = () => {
        // Implement save logic here
        toast({
            title: "Profile Saved",
            description: "Your profile settings have been updated.",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }

    const handleSaveNotifications = () => {
        // Implement save logic here
        toast({
            title: "Preferences Saved",
            description: "Your notification preferences have been updated.",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }

    const handleSaveCompanyInfo = () => {
        // Implement save logic here
        toast({
            title: "Company Info Saved",
            description: "Company details have been updated.",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
    }

    // Annual Leave Settings
    const { user } = useAuthStore()
    // Backend permission: only users with role 'ceo' can manage system settings.
    const isAdminForSettings = (user?.role || "").toLowerCase() === "ceo"
    // Start empty so the UI doesn't show 0 before settings are loaded
    const [annualMaxDays, setAnnualMaxDays] = useState("")
    const [settingsLoaded, setSettingsLoaded] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    // Full settings list UI (allowed keys)
    const allowedSettings = [
        { key: 'annual_leave_request_max_days', label: 'Annual Leave Cap (days)', type: 'int' },
        // Add more allowed keys here as backend allows them
    ]
    const [settingsMap, setSettingsMap] = useState({})
    const [inputs, setInputs] = useState({})
    const [listLoading, setListLoading] = useState(false)
    const [savingMap, setSavingMap] = useState({})

    // Load system settings on mount
    useEffect(() => {
        const load = async () => {
            try {
                // Load the single key for the top-level quick input
                const found = await ApiService.getSystemSettingByKey('annual_leave_request_max_days')
                if (found && (found.int_value ?? found.int_value === 0)) {
                    setAnnualMaxDays(found.int_value)
                } else {
                    setAnnualMaxDays("")
                }

                // Also load full settings list so we can render all allowed keys
                setListLoading(true)
                const list = await ApiService.getSystemSettings()
                const results = Array.isArray(list) ? list : list.results || []
                const map = {}
                results.forEach(item => { map[item.key] = item })
                setSettingsMap(map)
                // populate inputs from map for allowed keys
                const newInputs = {}
                allowedSettings.forEach(s => {
                    const existing = map[s.key]
                    newInputs[s.key] = existing ? (existing.int_value ?? '') : ''
                })
                setInputs(newInputs)
                setListLoading(false)
            } catch (e) {
                // ignore
            } finally {
                setSettingsLoaded(true)
            }
        }
        if (isAdminForSettings) load()
    }, [isAdminForSettings])

    const handleSaveAnnualMax = async () => {
        setIsSaving(true)
        try {
            const valueNum = Number(annualMaxDays)
            // Prefer PATCH by key; if 404, then POST by key; if POST 400 (exists), fallback to PATCH
            try {
                const updated = await ApiService.updateSystemSettingByKey('annual_leave_request_max_days', { int_value: valueNum })
                setAnnualMaxDays(updated.int_value ?? valueNum)
                toast({ title: 'Saved', description: 'Annual leave cap updated', status: 'success', duration: 3000 })
            } catch (err) {
                if (err?.status === 404) {
                    try {
                        const created = await ApiService.createSystemSettingByKey('annual_leave_request_max_days', { int_value: valueNum, description: 'Annual cap (days)' })
                        setAnnualMaxDays(created.int_value ?? valueNum)
                        toast({ title: 'Created', description: 'Annual leave cap created', status: 'success', duration: 3000 })
                    } catch (e2) {
                        // If backend returns 400 with existing setting, attempt PATCH again
                        if (e2?.status === 400 && e2?.data?.setting) {
                            const patched = await ApiService.updateSystemSettingByKey('annual_leave_request_max_days', { int_value: valueNum })
                            setAnnualMaxDays(patched.int_value ?? valueNum)
                            toast({ title: 'Saved', description: 'Annual leave cap updated', status: 'success', duration: 3000 })
                        } else {
                            throw e2
                        }
                    }
                } else {
                    throw err
                }
            }
        } catch (e) {
            console.error('Failed saving system setting', e)
            toast({ title: 'Error', description: e?.message || 'Failed to save', status: 'error', duration: 4000 })
        } finally {
            setIsSaving(false)
            setSettingsLoaded(true)
        }
    }

    // Per-key save handler for the settings list
    const handleSaveKey = async (key) => {
        const raw = inputs[key]
        const num = Number(raw)
        setSavingMap(m => ({ ...m, [key]: true }))
        try {
            try {
                const updated = await ApiService.updateSystemSettingByKey(key, { int_value: num })
                setSettingsMap(m => ({ ...m, [key]: updated }))
                toast({ title: 'Saved', description: `${key} updated`, status: 'success', duration: 3000 })
            } catch (err) {
                if (err?.status === 404) {
                    const created = await ApiService.createSystemSettingByKey(key, { int_value: num, description: `${key}` })
                    setSettingsMap(m => ({ ...m, [key]: created }))
                    toast({ title: 'Created', description: `${key} created`, status: 'success', duration: 3000 })
                } else if (err?.status === 400 && err?.data?.setting) {
                    // backend says exists; patch it
                    const patched = await ApiService.updateSystemSettingByKey(key, { int_value: num })
                    setSettingsMap(m => ({ ...m, [key]: patched }))
                    toast({ title: 'Saved', description: `${key} updated`, status: 'success', duration: 3000 })
                } else {
                    throw err
                }
            }
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

                {/* User's Leave Balance Section */}
                <Card bg={cardBg} shadow="lg" mb={6}>
                    <CardBody p={6}>
                        <Heading size="md" mb={4} color={headingColor}>
                            Your Leave Balance
                        </Heading>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} textAlign="center">
                            <Box p={4} borderRadius="lg" bg={balanceCardBgLight}>
                                <Text fontSize="3xl" fontWeight="bold" color={balanceCardTextLight}>
                                    14
                                </Text>
                                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                    Vacation Days Left
                                </Text>
                            </Box>
                            <Box p={4} borderRadius="lg" bg={balanceCardBgAmber}>
                                <Text fontSize="3xl" fontWeight="bold" color={balanceCardTextAmber}>
                                    8
                                </Text>
                                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                    Sick Days Left
                                </Text>
                            </Box>
                            <Box p={4} borderRadius="lg" bg={balanceCardBgGreen}>
                                <Text fontSize="3xl" fontWeight="bold" color={balanceCardTextGreen}>
                                    2
                                </Text>
                                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                    Personal Days Left
                                </Text>
                            </Box>
                        </Grid>
                    </CardBody>
                </Card>

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
                                    Notifications
                                </Tab>
                                <Tab
                                    _selected={{
                                        bg: useColorModeValue("blue.50", "blue.900"),
                                        color: useColorModeValue("blue.700", "blue.200"),
                                    }}
                                >
                                    Company
                                </Tab>
                            </TabList>

                            <TabPanels p={6}>
                                {/* Profile Settings Tab */}
                                <TabPanel>
                                    <Heading size="md" mb={4} color={headingColor}>
                                        Your Profile
                                    </Heading>
                                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} maxW="2xl">
                                        <FormControl>
                                            <FormLabel>Full Name</FormLabel>
                                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Email Address</FormLabel>
                                            <Input value={email} onChange={(e) => setEmail(e.target.value)} isDisabled />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>New Password</FormLabel>
                                            <InputGroup>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter new password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                                <InputRightElement>
                                                    <IconButton
                                                        variant="ghost"
                                                        icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                                    />
                                                </InputRightElement>
                                            </InputGroup>
                                        </FormControl>
                                    </Grid>
                                    <Button leftIcon={<FaCheck />} colorScheme="blue" mt={6} onClick={handleSaveProfile}>
                                        Save Profile
                                    </Button>
                                </TabPanel>

                                {/* Notification Settings Tab */}
                                <TabPanel>
                                    <Heading size="md" mb={4} color={headingColor}>
                                        Notification Preferences
                                    </Heading>
                                    <VStack spacing={4} align="stretch" maxW="md">
                                        <HStack
                                            justify="space-between"
                                            p={4}
                                            borderWidth="1px"
                                            borderRadius="lg"
                                            borderColor={useColorModeValue("gray.200", "gray.700")}
                                        >
                                            <Box>
                                                <Text fontWeight="medium" color={headingColor}>
                                                    Email Notifications
                                                </Text>
                                                <Text fontSize="sm" color={textColor}>
                                                    Receive updates and alerts via email.
                                                </Text>
                                            </Box>
                                            <Switch
                                                isChecked={emailNotifications}
                                                onChange={(e) => setEmailNotifications(e.target.checked)}
                                            />
                                        </HStack>
                                        <HStack
                                            justify="space-between"
                                            p={4}
                                            borderWidth="1px"
                                            borderRadius="lg"
                                            borderColor={useColorModeValue("gray.200", "gray.700")}
                                        >
                                            <Box>
                                                <Text fontWeight="medium" color={headingColor}>
                                                    Push Notifications
                                                </Text>
                                                <Text fontSize="sm" color={textColor}>
                                                    Get notifications directly on your device.
                                                </Text>
                                            </Box>
                                            <Switch isChecked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} />
                                        </HStack>
                                    </VStack>
                                    <Button leftIcon={<FaCheck />} colorScheme="blue" mt={6} onClick={handleSaveNotifications}>
                                        Save Preferences
                                    </Button>
                                </TabPanel>

                                {/* Company Settings Tab (for Admins) */}
                                <TabPanel>
                                    <Heading size="md" mb={4} color={headingColor}>
                                        Company Details
                                    </Heading>
                                    <Text color={textColor} mb={4}>
                                        This section would be visible to Administrators only.
                                    </Text>
                                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} maxW="2xl">
                                        <FormControl>
                                            <FormLabel>Company Name</FormLabel>
                                            <Input value="HRM Inc." />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Website</FormLabel>
                                            <Input value="www.hrm-inc.com" />
                                        </FormControl>
                                    </Grid>
                                    <Button leftIcon={<FaCheck />} colorScheme="blue" mt={6} onClick={handleSaveCompanyInfo}>
                                        Save Company Info
                                    </Button>

                                    {/* System-level annual leave cap (Admins only) */}
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

                                            </VStack>
                                        </Box>
                                    )}
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>
            </MotionBox>
        </Container>
    )
}

export default SettingsPage
