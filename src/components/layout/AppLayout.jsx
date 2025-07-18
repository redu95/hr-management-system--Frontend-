"use client"
import { Outlet } from "react-router-dom"
import {
    Box,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    useColorMode,
    Flex,
    VStack,
    Image,
    Text,
} from "@chakra-ui/react"
import Header from "./Header"
import NavigationLinks from "./NavigationLinks"
import guestHomeLogo from "../../assets/guesthome.svg"

const DesktopSidebar = () => {
    return (
        <Box
            w="64"
            bg="white"
            _dark={{ bg: "gray.800" }}
            shadow="md"
            display={{ base: "none", lg: "flex" }}
            flexDirection="column"
            borderRight="1px"
            borderColor="gray.200"
            _dark={{ borderColor: "gray.700" }}
        >
            <VStack p={6} borderBottom="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
                <Image src={guestHomeLogo || "/placeholder.svg"} alt="Guest Home Logo" w={16} h={16} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.500" _dark={{ color: "gray.300" }}>
                    HRMS
                </Text>
            </VStack>
            <NavigationLinks />
        </Box>
    )
}

const AppLayout = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Flex h="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
            {/* Desktop Sidebar */}
            <DesktopSidebar />

            {/* Mobile Sidebar */}
            <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        <VStack spacing={2}>
                            <Image src={guestHomeLogo || "/placeholder.svg"} alt="Guest Home Logo" w={12} h={12} />
                            <Text fontSize="lg" fontWeight="semibold" color="gray.500" _dark={{ color: "gray.300" }}>
                                HRMS
                            </Text>
                        </VStack>
                    </DrawerHeader>
                    <DrawerBody p={0}>
                        <NavigationLinks onLinkClick={onClose} />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <Flex flex={1} direction="column" overflow="hidden">
                <Header onMenuClick={onOpen} darkMode={colorMode === "dark"} setDarkMode={toggleColorMode} />
                <Box flex={1} overflow="auto" bg="gray.50" _dark={{ bg: "gray.900" }}>
                    <Outlet />
                </Box>
            </Flex>
        </Flex>
    )
}

export default AppLayout
