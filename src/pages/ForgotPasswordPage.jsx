"use client"

import { useState } from "react"
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
    Text,
    VStack,
    useToast,
    useColorModeValue,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaEnvelope } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

const MotionBox = motion(Box)
const MotionCard = motion(Card)

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const toast = useToast()
    const navigate = useNavigate()

    const bgGradient = useColorModeValue("linear(to-br, blue.50, purple.50)", "linear(to-br, gray.900, purple.900)")
    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.600", "gray.300")

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) {
            toast({
                title: "Missing Email",
                description: "Please enter your email address.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/request-password-reset/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to send reset email")
            setLoading(false)
            setSubmitted(true)
            toast({
                title: "Reset Email Sent",
                description: data.message || "If this email exists, you will receive password reset instructions.",
                status: "success",
                duration: 4000,
                isClosable: true,
            })
            // Navigate to reset password page, passing email
            setTimeout(() => {
                navigate("/reset-password", { state: { email } })
            }, 1000)
        } catch (err) {
            setLoading(false)
            toast({
                title: "Error",
                description: err.message || "Failed to send reset email.",
                status: "error",
                duration: 4000,
                isClosable: true,
            })
        }
    }

    return (
        <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center" p={4}>
            <Container maxW="md">
                <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <VStack spacing={6} mb={8} textAlign="center">
                        <MotionBox
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                        >
                            <Box
                                w={16}
                                h={16}
                                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <FaEnvelope color="white" size="24" />
                            </Box>
                        </MotionBox>
                        <VStack spacing={2}>
                            <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                                Forgot Password
                            </Heading>
                            <Text color={textColor}>
                                Enter your email address and we'll send you instructions to reset your password.
                            </Text>
                        </VStack>
                    </VStack>
                    <MotionCard
                        bg={cardBg}
                        shadow="2xl"
                        borderRadius="2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <CardBody p={8}>
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={6}>
                                    <FormControl>
                                        <FormLabel>Email Address</FormLabel>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            size="lg"
                                            disabled={loading || submitted}
                                        />
                                    </FormControl>
                                    <Button
                                        w="full"
                                        size="lg"
                                        colorScheme="blue"
                                        type="submit"
                                        isLoading={loading}
                                        isDisabled={submitted}
                                    >
                                        {submitted ? "Email Sent" : "Send OTP"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        w="full"
                                        onClick={() => navigate("/login")}
                                        disabled={loading}
                                    >
                                        Back to Login
                                    </Button>
                                </VStack>
                            </form>
                        </CardBody>
                    </MotionCard>
                </MotionBox>
            </Container>
        </Box>
    )
}

export default ForgotPasswordPage
