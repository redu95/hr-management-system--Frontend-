"use client";

import { useEffect, useState } from "react";
import { useToast, useColorModeValue, useDisclosure } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";

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
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    Avatar,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react";

import ApiService from "../services/apiService";
import useAuthStore from "../store/authStore";

const MotionBox = motion(Box);

const ProfilePage = () => {
    const toast = useToast();
    const { user } = useAuthStore();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Helper to compose/split names
    const getFullName = (first, last) => [first, last].filter(Boolean).join(" ").trim();
    const splitFullName = (full) => {
        const parts = (full || "").trim().split(/\s+/);
        const first = parts.shift() || "";
        const last = parts.join(" ");
        return { first_name: first, last_name: last };
    };

    // State for Profile Information
    const [name, setName] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");

    // State for Password Change
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [currentUser, setCurrentUser] = useState({});
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const cardBg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const headingColor = useColorModeValue("gray.800", "gray.100");

    useEffect(() => {
        ApiService.fetchCurrentUser()
            .then((data) => {
                setCurrentUser(data);
                // Populate full name using first_name + last_name
                setFirstName(data.first_name || "");
                setLastName(data.last_name || "");
                setName(getFullName(data.first_name, data.last_name));
                setEmail(data.email || "");
            })
            .catch(() => {
                setCurrentUser({});
                setName("");
                setFirstName("");
                setLastName("");
            });
    }, []);

    const handleSaveProfile = async () => {
        try {
            setIsSaving(true);
            // Build payload: for Employee, split the Full Name input into first/last
            const payload =
                user?.role === "Employee"
                    ? splitFullName(name)
                    : { first_name: firstName, last_name: lastName };

            await ApiService.updateCurrentUser(payload);

            // Refetch the current user to reflect saved changes
            const refreshed = await ApiService.fetchCurrentUser();
            setCurrentUser(refreshed);
            setFirstName(refreshed.first_name || "");
            setLastName(refreshed.last_name || "");
            setName(getFullName(refreshed.first_name, refreshed.last_name));
            setEmail(refreshed.email || "");

            toast({
                title: "Profile Saved",
                description: "Your profile information has been updated.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Update Failed",
                description: error.message || "Could not update profile.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const closePasswordModal = () => {
        setOldPassword("");
        setNewPassword("");
        setShowOldPassword(false);
        setShowNewPassword(false);
        onClose();
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            toast({
                title: "Missing fields",
                description: "Please fill in both old and new passwords.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        if (oldPassword === newPassword) {
            toast({
                title: "Invalid password",
                description: "New password must be different from old password.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            setIsChangingPassword(true);
            await ApiService.changePassword({
                old_password: oldPassword,
                new_password: newPassword,
            });
            toast({
                title: "Password Changed",
                description: "Your password has been updated successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            closePasswordModal();
        } catch (error) {
            toast({
                title: "Change password failed",
                description: error.message || "Could not change password.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Derive a display name consistently from first_name + last_name
    const displayName = getFullName(currentUser.first_name || firstName, currentUser.last_name || lastName);

    return (
        <Container maxW="md" py={8}>
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card bg={cardBg} shadow="lg">
                    <CardBody>
                        <VStack spacing={6} align="stretch">
                            {/* Profile Information */}
                            <HStack spacing={4}>
                                <Avatar
                                    size="xl"
                                    name={displayName}
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128`}
                                />
                                <VStack align="start">
                                    <Heading size="lg" color={headingColor}>
                                        {displayName}
                                    </Heading>
                                    <Text color={textColor}>{email}</Text>
                                </VStack>
                            </HStack>

                            <Heading size="md" color={headingColor}>
                                Profile Information
                            </Heading>
                            
                                <FormControl>
                                    <FormLabel>Full Name</FormLabel>
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </FormControl>
    
                            <FormControl>
                                <FormLabel>Email Address</FormLabel>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    isDisabled
                                />
                            </FormControl>
                            <Button
                                leftIcon={<FaCheck />}
                                colorScheme="blue"
                                onClick={handleSaveProfile}
                                isLoading={isSaving}
                                loadingText="Saving"
                            >
                                Save Profile
                            </Button>

                            {/* Change Password Button */}
                            <Button colorScheme="blue" variant="outline" onClick={onOpen}>
                                Change Password
                            </Button>
                        </VStack>
                    </CardBody>
                </Card>
            </MotionBox>

            {/* Change Password Modal */}
            <Modal isOpen={isOpen} onClose={closePasswordModal} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Change Password</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Old Password</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showOldPassword ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                                <InputRightElement>
                                    <IconButton
                                        icon={showOldPassword ? <FaEyeSlash /> : <FaEye />}
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        aria-label={showOldPassword ? "Hide password" : "Show password"}
                                        size="sm"
                                        variant="ghost"
                                    />
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel>New Password</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <InputRightElement>
                                    <IconButton
                                        icon={showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                                        size="sm"
                                        variant="ghost"
                                    />
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={closePasswordModal} isDisabled={isChangingPassword}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            leftIcon={<FaCheck />}
                            onClick={handleChangePassword}
                            isLoading={isChangingPassword}
                            loadingText="Changing"
                        >
                            Change Password
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default ProfilePage;
