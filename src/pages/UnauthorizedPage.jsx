"use client"

import { useNavigate } from "react-router-dom"
import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    VStack,
    useColorModeValue,
    Badge,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaLock, FaHome } from "react-icons/fa"
import useAuthStore from "../store/authStore"

const MotionBox = motion(Box)

const UnauthorizedPage = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const bgGradient = useColorModeValue("linear(to-br, red.50, orange.50)", "linear(to-br, gray.900, red.900)")

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
        <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center" p={4}>
            <Container maxW="md">
                <MotionBox
                    textAlign="center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <MotionBox
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                        mb={6}
                    >
                        <Box
                            w={24}
                            h={24}
                            bg="red.100"
                            _dark={{ bg: "red.900" }}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx="auto"
                        >
                            <FaLock size="48" color="#E53E3E" />
                        </Box>
                    </MotionBox>

                    <VStack spacing={6}>
                        <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
                            <Heading size="2xl" bgGradient="linear(to-r, red.400, orange.500)" bgClip="text" mb={4}>
                                Access Denied
                            </Heading>
                            <Text fontSize="lg" color={useColorModeValue("gray.600", "gray.300")} mb={2}>
                                You don't have permission to access this page.
                            </Text>
                            <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
                                Your current role:{" "}
                                <Badge colorScheme={getRoleColor(user?.role)} ml={1}>
                                    {user?.role || "Unknown"}
                                </Badge>
                            </Text>
                        </MotionBox>

                        <MotionBox
                            w="full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                        >
                            <VStack spacing={4}>
                                <Button
                                    leftIcon={<FaHome />}
                                    colorScheme="blue"
                                    size="lg"
                                    onClick={() => navigate("/dashboard")}
                                    w="full"
                                    _hover={{ transform: "translateY(-2px)" }}
                                    transition="all 0.2s"
                                >
                                    Go to Dashboard
                                </Button>

                                <Button variant="ghost" onClick={() => navigate(-1)} w="full">
                                    Go Back
                                </Button>
                            </VStack>
                        </MotionBox>

                        <MotionBox
                            w="full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                        >
                            <Alert status="warning" borderRadius="lg">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle fontSize="sm">Need access?</AlertTitle>
                                    <AlertDescription fontSize="sm">Contact your administrator or HR department.</AlertDescription>
                                </Box>
                            </Alert>
                        </MotionBox>
                    </VStack>
                </MotionBox>
            </Container>
        </Box>
    )
}

export default UnauthorizedPage
