"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
    Select,
    Text,
    VStack,
    HStack,
    useToast,
    useColorModeValue,
    Flex,
    Grid,
    GridItem,
    Badge,
    InputGroup,
    InputRightElement,
    IconButton,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaUserPlus, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa"
import useAuthStore from "../store/authStore"

const MotionBox = motion(Box)
const MotionCard = motion(Card)

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const toast = useToast()

    const { register, user } = useAuthStore()

    const bgGradient = useColorModeValue("linear(to-br, green.50, blue.50)", "linear(to-br, gray.900, green.900)")
    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.600", "gray.300")

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const validateForm = () => {
        if (!formData.username || !formData.email || !formData.password || !formData.role) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return false
        }

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "Passwords do not match",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return false
        }

        if (formData.password.length < 6) {
            toast({
                title: "Weak Password",
                description: "Password must be at least 6 characters long",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return false
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return false
        }

        return true
    }

    const handleRegister = async () => {
        if (!validateForm()) return

        setLoading(true)
        try {
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            }

            await register(userData)

            toast({
                title: "Registration Successful",
                description: `User ${formData.username} has been created successfully`,
                status: "success",
                duration: 3000,
                isClosable: true,
            })

            // Reset form
            setFormData({
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "",
            })
        } catch (error) {
            toast({
                title: "Registration Failed",
                description: error.message || "Failed to create user",
                status: "error",
                duration: 4000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    const getRoleColor = (role) => {
        const colors = {
            CEO: "purple",
            Manager: "blue",
            HR: "green",
            Employee: "gray",
        }
        return colors[role] || "gray"
    }

    return (
        <Box minH="100vh" bgGradient={bgGradient} p={4}>
            <Container maxW="2xl" pt={8}>
                <MotionBox initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                    {/* Header */}
                    <HStack mb={8} spacing={4}>
                        <Button leftIcon={<FaArrowLeft />} variant="ghost" onClick={() => navigate(-1)} size="lg">
                            Back
                        </Button>
                        <VStack align="start" spacing={1}>
                            <Heading size="xl" bgGradient="linear(to-r, green.400, blue.500)" bgClip="text">
                                Register New User
                            </Heading>
                            <Text color={textColor}>Create a new account for the organization</Text>
                        </VStack>
                    </HStack>

                    {/* Registration Form */}
                    <MotionCard
                        bg={cardBg}
                        shadow="2xl"
                        borderRadius="2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <CardBody p={8}>
                            <HStack spacing={4} mb={6} align="center">
                                <Flex
                                    w={12}
                                    h={12}
                                    bg="linear-gradient(135deg, #48bb78 0%, #38b2ac 100%)"
                                    borderRadius="full"
                                    align="center"
                                    justify="center"
                                >
                                    <FaUserPlus color="white" size="20" />
                                </Flex>
                                <VStack align="start" spacing={0}>
                                    <Heading size="lg">User Information</Heading>
                                    <Text fontSize="sm" color={textColor}>
                                        Fill in the details for the new user
                                    </Text>
                                </VStack>
                            </HStack>

                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                {/* Username */}
                                <GridItem>
                                    <FormControl isRequired>
                                        <FormLabel>Username</FormLabel>
                                        <Input
                                            value={formData.username}
                                            onChange={(e) => handleInputChange("username", e.target.value)}
                                            placeholder="Enter username"
                                            size="lg"
                                            disabled={loading}
                                        />
                                    </FormControl>
                                </GridItem>

                                {/* Email */}
                                <GridItem>
                                    <FormControl isRequired>
                                        <FormLabel>Email Address</FormLabel>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            placeholder="Enter email address"
                                            size="lg"
                                            disabled={loading}
                                        />
                                    </FormControl>
                                </GridItem>

                                {/* Role */}
                                <GridItem>
                                    <FormControl isRequired>
                                        <FormLabel>Role</FormLabel>
                                        <Select
                                            value={formData.role}
                                            onChange={(e) => handleInputChange("role", e.target.value)}
                                            placeholder="Select role"
                                            size="lg"
                                            disabled={loading}
                                        >
                                            <option value="CEO">CEO</option>
                                            <option value="Manager">Manager</option>
                                            <option value="HR">HR</option>
                                            <option value="Employee">Employee</option>
                                        </Select>
                                    </FormControl>
                                </GridItem>

                                {/* Password */}
                                <GridItem>
                                    <FormControl isRequired>
                                        <FormLabel>Password</FormLabel>
                                        <InputGroup size="lg">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange("password", e.target.value)}
                                                placeholder="Enter password"
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
                                </GridItem>

                                {/* Confirm Password */}
                                <GridItem colSpan={{ base: 1, md: 2 }}>
                                    <FormControl isRequired>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <InputGroup size="lg">
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                                placeholder="Confirm password"
                                                disabled={loading}
                                            />
                                            <InputRightElement>
                                                <IconButton
                                                    variant="ghost"
                                                    icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                    </FormControl>
                                </GridItem>
                            </Grid>

                            {/* Current User Info */}
                            <Box mt={6} p={4} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="lg">
                                <Text fontSize="sm" color={textColor}>
                                    <Text as="span" fontWeight="medium">
                                        Registering as:
                                    </Text>{" "}
                                    {user?.username} (
                                    <Badge colorScheme={getRoleColor(user?.role)} size="sm">
                                        {user?.role}
                                    </Badge>
                                    )
                                </Text>
                            </Box>

                            {/* Action Buttons */}
                            <HStack justify="flex-end" spacing={4} mt={8}>
                                <Button variant="ghost" onClick={() => navigate(-1)} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button
                                    bgGradient="linear(to-r, green.400, blue.500)"
                                    color="white"
                                    _hover={{
                                        bgGradient: "linear(to-r, green.500, blue.600)",
                                        transform: "translateY(-2px)",
                                    }}
                                    _active={{ transform: "translateY(0)" }}
                                    isLoading={loading}
                                    loadingText="Creating User..."
                                    onClick={handleRegister}
                                    transition="all 0.2s"
                                >
                                    Create User
                                </Button>
                            </HStack>
                        </CardBody>
                    </MotionCard>
                </MotionBox>
            </Container>
        </Box>
    )
}

export default RegisterPage
