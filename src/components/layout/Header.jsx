"use client"

import { useLocation } from "react-router-dom"
import {
    Box,
    Flex,
    Heading,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Switch,
    HStack,
    Avatar,
    VStack,
    Text,
    Badge,
    useColorModeValue,
} from "@chakra-ui/react"
import { FaSearch, FaBell, FaSun, FaMoon, FaBars } from "react-icons/fa"
import useAuthStore from "../../store/authStore"

const Header = ({ onMenuClick, darkMode, setDarkMode }) => {
    const location = useLocation()
    const { user } = useAuthStore()

    const bgGradient = useColorModeValue("linear(to-r, blue.500, purple.600)", "linear(to-r, blue.600, purple.700)")

    const getPageTitle = (pathname) => {
        const titles = {
            "/dashboard": "Dashboard",
            "/employees": "Employees",
            "/departments": "Departments",
            "/leave": user?.role === "Employee" ? "My Leave" : "Leave Management",
            "/reports": "Reports",
            "/settings": "Settings",
            "/register": "Register Employee",
        }
        return titles[pathname] || "HRMS"
    }

    const getRoleBadgeColor = (role) => {
        const colors = {
            CEO: "purple",
            Manager: "blue",
            HR: "green",
            Employee: "gray",
        }
        return colors[role] || "gray"
    }

    const pageTitle = getPageTitle(location.pathname)

    return (
        <Box as="header" bgGradient={bgGradient} shadow="sm" p={4}>
            <Flex justify="space-between" align="center">
                <HStack spacing={4}>
                    {/* Hamburger Menu Button - visible only on small screens */}
                    <IconButton
                        icon={<FaBars />}
                        variant="ghost"
                        color="white"
                        display={{ base: "flex", lg: "none" }}
                        onClick={onMenuClick}
                        aria-label="Open menu"
                    />
                    <Heading size="lg" color="white" display={{ base: "none", md: "block" }}>
                        {pageTitle}
                    </Heading>
                </HStack>

                {/* Right-side controls */}
                <HStack spacing={{ base: 2, sm: 4, md: 6 }}>
                    {/* Search Bar */}
                    <InputGroup size="md" w={{ base: "200px", md: "300px", lg: "400px" }} display={{ base: "none", sm: "flex" }}>
                        <Input
                            placeholder="Search..."
                            bg="whiteAlpha.200"
                            border="none"
                            color="white"
                            _placeholder={{ color: "whiteAlpha.700" }}
                            _focus={{ bg: "whiteAlpha.300" }}
                        />
                        <InputRightElement>
                            <FaSearch color="white" opacity={0.7} />
                        </InputRightElement>
                    </InputGroup>

                    {/* Dark/Light Mode Switch */}
                    <HStack spacing={2}>
                        {darkMode ? <FaMoon color="white" /> : <FaSun color="white" />}
                        <Switch isChecked={darkMode} onChange={setDarkMode} colorScheme="yellow" size="md" />
                    </HStack>

                    {/* Notification Icon */}
                    <IconButton
                        icon={<FaBell />}
                        variant="ghost"
                        color="white"
                        _hover={{ color: "yellow.300", bg: "whiteAlpha.200" }}
                        aria-label="Notifications"
                    />

                    {/* User Profile */}
                    <HStack spacing={3} cursor="pointer">
                        <Avatar
                            size="sm"
                            name={user?.username || "User"}
                            src={`https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random&color=fff&size=40`}
                            border="2px solid"
                            borderColor="whiteAlpha.300"
                        />
                        <VStack spacing={0} align="start" display={{ base: "none", md: "flex" }}>
                            <Text fontSize="sm" fontWeight="semibold" color="white">
                                {user?.username || "User"}
                            </Text>
                            <Badge colorScheme={getRoleBadgeColor(user?.role)} size="sm">
                                {user?.role || "Employee"}
                            </Badge>
                        </VStack>
                    </HStack>
                </HStack>
            </Flex>
        </Box>
    )
}

export default Header
