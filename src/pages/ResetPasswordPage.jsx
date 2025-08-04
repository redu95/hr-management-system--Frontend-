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
import { FaKey } from "react-icons/fa"
import { useLocation, useNavigate } from "react-router-dom"

const MotionBox = motion(Box)
const MotionCard = motion(Card)

const ResetPasswordPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const toast = useToast()
    const [email, setEmail] = useState(location.state?.email || "")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const bgGradient = useColorModeValue("linear(to-br, blue.50, purple.50)", "linear(to-br, gray.900, purple.900)")
    const cardBg = useColorModeValue("white", "gray.800")
    const textColor = useColorModeValue("gray.600", "gray.300")

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !otp || !newPassword) {
            toast({
                title: "Missing Fields",
                description: "Please fill in all fields.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return
        }
        setLoading(true)
        try {
            // Log payload for debugging
            console.log("Reset password payload:", { email, otp, new_password: newPassword })
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/reset-password/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, new_password: newPassword }),
            })
            // Try to parse error details if present
            let data
            try {
                data = await res.json()
            } catch {
                data = {}
            }
            if (!res.ok) {
                // Log full backend response for debugging
                console.error("Reset password error response:", data)
                // User-friendly error extraction
                let errorMsg =
                    (Array.isArray(data.new_password) && data.new_password.length > 0)
                        ? `Password: ${data.new_password[0]}`
                        : (Array.isArray(data.otp) && data.otp.length > 0)
                        ? `OTP: ${data.otp[0]}`
                        : (Array.isArray(data.email) && data.email.length > 0)
                        ? `Email: ${data.email[0]}`
                        : data.message || data.detail || JSON.stringify(data) || "Failed to reset password"
                toast({
                    title: "Error",
                    description: errorMsg,
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                })
                setLoading(false)
                return
            }
            toast({
                title: "Password Reset",
                description: data.message || "Password reset successful.",
                status: "success",
                duration: 4000,
                isClosable: true,
            })
            setTimeout(() => {
                navigate("/login")
            }, 1000)
        } catch (err) {
            toast({
                title: "Error",
                description: err.message || "Failed to reset password.",
                status: "error",
                duration: 4000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
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
                                <FaKey color="white" size="24" />
                            </Box>
                        </MotionBox>
                        <VStack spacing={2}>
                            <Heading size="xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                                Reset Password
                            </Heading>
                            <Text color={textColor}>
                                Enter the OTP sent to your email and your new password.
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
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>OTP</FormLabel>
                                        <Input
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter OTP"
                                            size="lg"
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>New Password</FormLabel>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            size="lg"
                                        />
                                    </FormControl>
                                    <Button
                                        w="full"
                                        size="lg"
                                        colorScheme="blue"
                                        type="submit"
                                        isLoading={loading}
                                    >
                                        Reset Password
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

export default ResetPasswordPage
