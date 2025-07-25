"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
    Box,
    Button,
    Card,
    CardBody,
    Container,
    FormControl,
    FormLabel,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    Text,
    VStack,
    useToast,
    useColorModeValue,
    Flex,
    Grid,
    GridItem,
    Badge,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaUserTie, FaEye, FaEyeSlash } from "react-icons/fa"
import useAuthStore from "../store/authStore"

const MotionBox = motion(Box)
const MotionCard = motion(Card)

const LoginPage = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const toast = useToast()

    const { login, isAuthenticated, user } = useAuthStore()

    const bgGradient = useColorModeValue("linear(to-br, blue.50, purple.50)", "linear(to-br, gray.900, purple.900)")
    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.600", "gray.300")

    const demoCredentials = [
        { role: "CEO", credential: "t@g.com", password: "1234", color: "purple" },
        { role: "HR", credential: "hr_manager@example.com", password: "1234", color: "green" },
        { role: "Manager", credential: "test@example.com", password: "1234", color: "blue" },
        { role: "Employee", credential: "employee@company.com", password: "password123", color: "gray" },
    ]

    const handleLogin = async (event) => {
        event.preventDefault()
        console.log("🔍 [LOGIN_PAGE] Attempting login with:", { email, password }) // Debug log

        if (!email || !password) {
            console.log("⚠️ [LOGIN_PAGE] Missing credentials")
            toast({
                title: "Missing Information",
                description: "Please enter both email and password",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        setLoading(true)
        console.log("🔄 [LOGIN_PAGE] Starting login process")

        try {
            const result = await login(email, password)
            console.log("✅ [LOGIN_PAGE] Login successful:", result) // Debug log

            toast({
                title: "Login Successful",
                description: `Welcome back, ${result.user.username}!`,
                status: "success",
                duration: 2000,
                isClosable: true,
            })

            // Check auth state immediately after login
            const authState = useAuthStore.getState()
            console.log("🔍 [LOGIN_PAGE] Auth state after login:", {
                isAuthenticated: authState.isAuthenticated,
                user: authState.user,
                hasToken: !!authState.accessToken,
            })

            // Always navigate to dashboard after successful login
            console.log("🚀 [LOGIN_PAGE] Navigating to: /dashboard")
            navigate("/dashboard", { replace: true })
        } catch (error) {
            console.error("💥 [LOGIN_PAGE] Login failed:", error) // Debug log
            toast({
                title: "Login Failed",
                description: error.message || "Invalid credentials",
                status: "error",
                duration: 4000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleLogin()
        }
    }

    const handleCopyToClipboard = (text, label) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                toast({
                    title: "Copied to Clipboard",
                    description: `${label} has been copied!`,
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                })
            })
            .catch((err) => {
                console.error("Failed to copy text: ", err)
                toast({
                    title: "Copy Failed",
                    description: "Unable to copy to clipboard.",
                    status: "error",
                    duration: 2000,
                    isClosable: true,
                })
            })
    }

    // Redirect if already authenticated
    useEffect(() => {
        console.log("🔍 [LOGIN_PAGE] Checking if should redirect:", {
            isAuthenticated,
            hasUser: !!user,
            fromPath: location.state?.from?.pathname,
        })

        if (isAuthenticated && user) {
            // Always redirect to dashboard if already authenticated
            console.log("✅ [LOGIN_PAGE] User is authenticated, redirecting to: /dashboard")
            navigate("/dashboard", { replace: true })
        }
    }, [isAuthenticated, user, navigate, location])

    console.log("🔍 [LOGIN_PAGE] Component rendered with state:", {
        isAuthenticated,
        hasUser: !!user,
        userRole: user?.role,
        currentPath: location.pathname,
    })

    // Show loading state while checking authentication
    if (isAuthenticated && user) {
        console.log("🔄 [LOGIN_PAGE] Showing loading state while redirecting")
        return (
            <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
                <VStack spacing={4}>
                    <Text>Redirecting...</Text>
                    <Box className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </VStack>
            </Box>
        )
    }

    return (
        <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center" p={4}>
            <Container maxW="md">
                <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {/* Header Section */}
                    <VStack spacing={6} mb={8} textAlign="center">
                        <MotionBox
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                        >
                            <Flex
                                w={16}
                                h={16}
                                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                borderRadius="full"
                                align="center"
                                justify="center"
                            >
                                <FaUserTie color="white" size="24" />
                            </Flex>
                        </MotionBox>
                        <VStack spacing={2}>
                            <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                                HR Management System
                            </Heading>
                            <Text color={textColor}>Welcome back! Please sign in to your account.</Text>
                        </VStack>
                    </VStack>

                    {/* Login Form Card */}
                    <MotionCard
                        bg={cardBg}
                        shadow="2xl"
                        borderRadius="2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <CardBody p={8}>
                            <VStack spacing={6}>
                                {/* Email Input */}
                                <FormControl>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter your email"
                                        size="lg"
                                        disabled={loading}
                                    />
                                </FormControl>

                                {/* Password Input */}
                                <FormControl>
                                    <FormLabel>Password</FormLabel>
                                    <InputGroup size="lg">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Enter your password"
                                            disabled={loading}
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

                                {/* Forgot Password Link */}
                                <Flex w="full" justify="flex-end">
                                    <Text
                                        as="a"
                                        href="#"
                                        fontSize="sm"
                                        color="blue.500"
                                        _hover={{ color: "blue.600", textDecoration: "underline" }}
                                    >
                                        Forgot Password?
                                    </Text>
                                </Flex>

                                {/* Login Button */}
                                <Button
                                    w="full"
                                    size="lg"
                                    bgGradient="linear(to-r, blue.400, purple.500)"
                                    color="white"
                                    _hover={{
                                        bgGradient: "linear(to-r, blue.500, purple.600)",
                                        transform: "translateY(-2px)",
                                    }}
                                    _active={{ transform: "translateY(0)" }}
                                    isLoading={loading}
                                    loadingText="Signing In..."
                                    onClick={handleLogin}
                                    transition="all 0.2s"
                                >
                                    Sign In
                                </Button>

                                {/* Demo Credentials */}
                                <Box w="full" p={4} bg="gray.50" borderRadius="lg">
                                    <Text fontSize="sm" fontWeight="medium" mb={3} color={textColor}>
                                        Demo Credentials :
                                    </Text>
                                    <Grid templateColumns="repeat(1, 1fr)" gap={2}>
                                        {demoCredentials.map((cred, index) => (
                                            <GridItem key={index}>
                                                <VStack spacing={1} align="start">
                                                    <Badge colorScheme={cred.color} fontSize="xs">
                                                        {cred.role}
                                                    </Badge>
                                                    <Flex gap={2} align="center">
                                                        <Text
                                                            fontSize="xs"
                                                            color={textColor}
                                                            cursor="pointer"
                                                            onClick={() => handleCopyToClipboard(cred.credential, "Email")}
                                                            _hover={{ textDecoration: "underline", color: "blue.500" }}
                                                        >
                                                            {cred.credential}
                                                        </Text>
                                                        <Text fontSize="xx-small" color="gray.500">
                                                            (Click to copy email)
                                                        </Text>
                                                    </Flex>
                                                    <Flex gap={2} align="center">
                                                        <Text
                                                            fontSize="xs"
                                                            color={textColor}
                                                            cursor="pointer"
                                                            onClick={() => handleCopyToClipboard(cred.password, "Password")}
                                                            _hover={{ textDecoration: "underline", color: "blue.500" }}
                                                        >
                                                            {cred.password}
                                                        </Text>
                                                        <Text fontSize="xx-small" color="gray.500">
                                                            (Click to copy password)
                                                        </Text>
                                                    </Flex>
                                                </VStack>
                                            </GridItem>
                                        ))}
                                    </Grid>
                                </Box>
                            </VStack>
                        </CardBody>
                    </MotionCard>
                </MotionBox>
            </Container>
        </Box>
    )
}

export default LoginPage
