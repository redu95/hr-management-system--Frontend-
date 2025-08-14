"use client"

import { NavLink } from "react-router-dom"
import { VStack, Box, Text, HStack, useColorModeValue } from "@chakra-ui/react"
import {
    FaTachometerAlt,
    FaUsers,
    FaBuilding,
    FaCalendarAlt,
    FaChartBar,
    FaCog,
    FaUserPlus,
    FaSignOutAlt,
} from "react-icons/fa"
import useAuthStore from "../../store/authStore"
import RoleBasedComponent from "../common/RoleBasedComponent"
import { usePrefetchDirectory } from '../../hooks/useDirectoryData'

const NavigationLinks = ({ onLinkClick }) => {
    const { user } = useAuthStore()
    const prefetchDirectory = usePrefetchDirectory()

    const activeBg = useColorModeValue("blue.50", "blue.900")
    const activeColor = useColorModeValue("blue.700", "blue.200")
    const hoverBg = useColorModeValue("gray.100", "gray.700")
    const textColor = useColorModeValue("gray.700", "gray.100")

    const NavItem = ({ to, icon: Icon, children, onClick, prefetch }) => (
        <NavLink to={to} onClick={onClick} onMouseEnter={prefetch} onFocus={prefetch}>
            {({ isActive }) => (
                <HStack
                    w="full"
                    p={3}
                    borderRadius="lg"
                    bg={isActive ? activeBg : "transparent"}
                    color={isActive ? activeColor : textColor}
                    _hover={{ bg: isActive ? activeBg : hoverBg }}
                    transition="all 0.2s"
                    cursor="pointer"
                >
                    <Icon size="18" />
                    <Text fontWeight="medium">{children}</Text>
                </HStack>
            )}
        </NavLink>
    )

    return (
        <VStack spacing={0} align="stretch" flex={1}>
            <VStack spacing={2} p={4} flex={1} align="stretch">
                {/* Dashboard - Available to all roles */}
                <NavItem to="/dashboard" icon={FaTachometerAlt} onClick={onLinkClick}>
                    Dashboard
                </NavItem>

                {/* Employees - Available to CEO, Manager, HR */}
                <RoleBasedComponent requiredPermission="canManageEmployees">
                    <NavItem to="/employees" icon={FaUsers} onClick={onLinkClick}>
                        Employees
                    </NavItem>
                </RoleBasedComponent>

                {/* Departments - Available to CEO, HR */}
                <RoleBasedComponent requiredPermission="canManageDepartments">
                    <NavItem to="/departments" icon={FaBuilding} onClick={onLinkClick}>
                        Departments
                    </NavItem>
                </RoleBasedComponent>

                {/* Leave Management - Different access levels */}
                {user?.role === "Employee" ? (
                    <NavItem to="/my-leave" icon={FaCalendarAlt} onClick={onLinkClick}>
                        My Leave
                    </NavItem>
                ) : (
                    <NavItem to="/leave" icon={FaCalendarAlt} onClick={onLinkClick}>
                        Leave Management
                    </NavItem>
                )}

                {/* Reports - Available to CEO, Manager, HR */}
                <RoleBasedComponent requiredPermission="canViewReports">
                    <NavItem to="/reports" icon={FaChartBar} onClick={onLinkClick}>
                        Reports
                    </NavItem>
                </RoleBasedComponent>

                {/* Register Users - Available to CEO, HR */}
                <RoleBasedComponent requiredPermission="canRegisterUsers">
                    <NavItem to="/register" icon={FaUserPlus} onClick={onLinkClick}>
                        Register User
                    </NavItem>
                </RoleBasedComponent>

                {/* Settings - Available to CEO, HR */}
                <RoleBasedComponent requiredPermission="canManageSettings">
                    <NavItem to="/settings" icon={FaCog} onClick={onLinkClick}>
                        Settings
                    </NavItem>
                </RoleBasedComponent>
            </VStack>

            <Box p={4} borderTop="1px" borderColor={useColorModeValue("gray.200", "gray.700")}>
                <NavItem to="/logout" icon={FaSignOutAlt} onClick={onLinkClick}>
                    Logout
                </NavItem>
            </Box>
        </VStack>
    )
}

export default NavigationLinks
