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
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react"
import ApiService from "../../services/apiService"
import * as DepartmentService from '../../services/departmentService'

const Header = ({ onMenuClick, darkMode, setDarkMode }) => {
    const location = useLocation()
    const { user } = useAuthStore()

    // Add state for current user info from /auth/me
    const [currentUser, setCurrentUser] = useState({})
    const [departmentName, setDepartmentName] = useState('')
    const [deptLoading, setDeptLoading] = useState(false)

    useEffect(() => {
        ApiService.fetchCurrentUser()
            .then(data => setCurrentUser(data))
            .catch(() => setCurrentUser({}))
    }, [])

    // Resolve department name for managers (or when currentUser contains department)
    useEffect(() => {
        let mounted = true
        const resolveDept = async () => {
            setDepartmentName('')
            if (!currentUser) return
            try {
                setDeptLoading(true)
                // If backend includes department on user, prefer that
                if (currentUser.department) {
                    const dep = currentUser.department
                    if (typeof dep === 'string' || typeof dep === 'number') {
                        try {
                            const d = await DepartmentService.getDepartment(dep)
                            if (!mounted) return
                            setDepartmentName(d?.name || '')
                            return
                        } catch (_) {
                            // fallthrough to fetch all
                        }
                    } else if (typeof dep === 'object') {
                        setDepartmentName(dep.name || '')
                        return
                    }
                }

                // If user role is Manager, try to find department where manager == user.id
                if (user?.role === 'Manager') {
                    const deps = await DepartmentService.getDepartments()
                    if (!mounted) return
                    const list = Array.isArray(deps) ? deps : deps?.results || []
                    const found = list.find(d => {
                        // manager may be id or nested object
                        if (!d) return false
                        if (d.manager && typeof d.manager === 'object') return d.manager.id === user.id
                        return d.manager === user.id
                    })
                    if (found) {
                        setDepartmentName(found.name || '')
                        return
                    }
                }
            } catch (e) {
                console.error('Error resolving department name', e)
            } finally {
                if (mounted) setDeptLoading(false)
            }
        }
        resolveDept()
        return () => { mounted = false }
    }, [currentUser, user])

    const bgGradient = useColorModeValue("linear(to-r, purple.600, purple.900)", "linear(to-r, blue.600, purple.700)")

    const getPageTitle = (pathname) => {
    const titles = {
            "/dashboard": "Dashboard",
            "/employees": "Employees",
            "/departments": "Departments",
            "/leave": user?.role === "Employee" ? "My Leave" : "Leave Management",
            "/settings": "Settings",
            "/register": "Register Employee",
            "/profile": "Profile",
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
                        _hover={{ color: "purple.500", bg: "whiteAlpha.200" }}
                        aria-label="Notifications"
                    />

                    {/* User Profile */}
                    <Link to="/profile">
                        <HStack spacing={3} cursor="pointer">
                            <Avatar
                                size="sm"
                                name={currentUser.name || `${currentUser.first_name || ""} ${currentUser.last_name || ""}`}
                                src={`https://ui-avatars.com/api/?name=${currentUser.name || `${currentUser.first_name || ""}+${currentUser.last_name || ""}`}&background=random&color=fff&size=40`}
                                border="2px solid"
                                borderColor="whiteAlpha.300"
                            />
                            <VStack spacing={0} align="start" display={{ base: "none", md: "flex" }}>
                                <Text fontSize="sm" fontWeight="semibold" color="white">
                                    {currentUser.name || `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim()}
                                </Text>
                                <HStack spacing={2}>
                                    <Badge colorScheme={getRoleBadgeColor(user?.role)} size="sm">
                                        {user?.role || "Employee"}
                                    </Badge>
                                    {user?.role === 'Manager' && (
                                        <Text fontSize="xs" color="whiteAlpha.800">{deptLoading ? 'Loading dept…' : (departmentName || 'No department')}</Text>
                                    )}
                                </HStack>
                            </VStack>
                        </HStack>
                    </Link>
                </HStack>
            </Flex>
        </Box>
    )
}

export default Header
