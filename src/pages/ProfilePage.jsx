"use client";

import { useEffect, useState } from "react";
import { useToast, useColorModeValue } from "@chakra-ui/react";
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
} from "@chakra-ui/react";

import ApiService from "../services/apiService";
import useAuthStore from "../store/authStore";

const MotionBox = motion(Box);

const ProfilePage = () => {
    const toast = useToast();
    const { user } = useAuthStore();

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

    const cardBg = useColorModeValue("white", "gray.800");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const headingColor = useColorModeValue("gray.800", "gray.100");

    useEffect(() => {
        ApiService.fetchCurrentUser()
            .then((data) => {
                setCurrentUser(data);
                setName(data.name || "");
                setFirstName(data.first_name || "");
                setLastName(data.last_name || "");
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
            const payload = user?.role === 'Employee' 
                ? { name }
                : { first_name: firstName, last_name: lastName };

            const updated = await ApiService.apiCall("/api/auth/me/", {
                method: "PUT",
                body: JSON.stringify(payload),
            });
            setCurrentUser(updated);
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
        }
    };

    const handleChangePassword = () => {
        // Implement change password logic here
        toast({
            title: "Password Changed",
            description: "Your password has been updated successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

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
                                    name={currentUser.name || `${firstName} ${lastName}`}
                                    src={`https://ui-avatars.com/api/?name=${currentUser.name || `${firstName}+${lastName}`}&background=random&color=fff&size=128`}
                                />
                                <VStack align="start">
                                    <Heading size="lg" color={headingColor}>
                                        {currentUser.name || `${firstName} ${lastName}`}
                                    </Heading>
                                    <Text color={textColor}>{email}</Text>
                                </VStack>
                            </HStack>

                            <Heading size="md" color={headingColor}>
                                Profile Information
                            </Heading>
                            {user?.role === 'Employee' ? (
                                <FormControl>
                                    <FormLabel>Full Name</FormLabel>
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </FormControl>
                            ) : (
                                <>
                                    <FormControl>
                                        <FormLabel>First Name</FormLabel>
                                        <Input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Last Name</FormLabel>
                                        <Input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </FormControl>
                                </>
                            )}
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
                            >
                                Save Profile
                            </Button>

                            {/* Change Password Section */}
                            <Heading size="md" color={headingColor}>
                                Change Password
                            </Heading>
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
                                            aria-label={
                                                showOldPassword ? "Hide password" : "Show password"
                                            }
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            <FormControl>
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
                                            aria-label={
                                                showNewPassword ? "Hide password" : "Show password"
                                            }
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            <Button
                                leftIcon={<FaCheck />}
                                colorScheme="blue"
                                onClick={handleChangePassword}
                            >
                                Change Password
                            </Button>
                        </VStack>
                    </CardBody>
                </Card>
            </MotionBox>
        </Container>
    );
};

export default ProfilePage;
