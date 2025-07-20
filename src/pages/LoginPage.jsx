import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast'; // Import Toast
import TestTailwind from '../TestTailwind';
import { memoryToken } from '../components/common/RequireAuth';

// Make sure you have Font Awesome linked in your main public/index.html file
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" ... />

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const toast = useRef(null); // Toast ref

    const handleLogin = async () => {
        try {
            console.log(`${import.meta.env.VITE_BASE_URL}/api/auth/token/}`);
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            if (!response.ok) {
                let errorMsg = 'Login failed'; // Default fallback
                try {
                    const errorData = await response.json();
                    // If backend returns errors object, combine all messages
                    if (errorData && errorData.errors) {
                        // Flatten all error arrays into a single array, then join
                        errorMsg = Object.values(errorData.errors)
                            .flat()
                            .join(' ');
                    } else if (errorData && errorData.detail) {
                        errorMsg = errorData.detail;
                    } else if (typeof errorData === 'string') {
                        errorMsg = errorData;
                    } else if (errorData && errorData.message) {
                        errorMsg = errorData.message;
                    }
                } catch (e) {
                    // ignore JSON parse errors, keep fallback errorMsg
                }
                // Show error toast
                toast.current.show({
                    severity: 'error',
                    summary: 'Login Failed',
                    detail: errorMsg,
                    life: 4000
                });
                return;
            }
            const data = await response.json();
            // Store tokens (you can use Zustand or context later)
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            memoryToken.value = data.access; // Set in-memory token
            toast.current.show({
                severity: 'success',
                summary: 'Login Successful',
                detail: 'Welcome back!',
                life: 2000
            });
            setTimeout(() => {
                navigate('/dashboard');
            }, 1200); // Wait before navigating so toast is visible
        } catch (error) {
            console.error('Login error:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Login Error',
                detail: error.message || 'Login failed',
                life: 4000
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 p-4 font-sans transition-colors duration-300">
            <Toast ref={toast} position="top-center" />
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <i className="fas fa-sitemap text-4xl text-sky-600"></i>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">HR Management</h1>
                    <p className="text-slate-500 dark:text-slate-300">Welcome back! Please login to your account.</p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                    <div className="space-y-6">
                        {/* Username Input */}
                        <div>
                            <label htmlFor="username" className="text-sm font-medium text-slate-600 dark:text-slate-200 block mb-1">
                                Username
                            </label>
                            <InputText
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-700 p-2"
                                inputClassName="p-3 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-lg dark:text-slate-100"
                                placeholder="your username"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-slate-600 dark:text-slate-200 block mb-1">
                                Password
                            </label>
                            <Password
                                inputId="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-slate"
                                inputClassName="p-3 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-lg dark:text-slate-100"
                                placeholder="************"
                                feedback={false} // Hides the password strength meter
                                toggleMask // Adds the show/hide password icon
                            />
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex items-center justify-end mt-4">
                        <a href="#" className="text-sm text-[#9a79f3] hover:underline dark:text-[#c1aaff]">
                            Forgot Password?
                        </a>
                    </div>

                    {/* Login Button */}
                    <Button
                        label="Login"
                        onClick={handleLogin}
                        className=" p-4  w-full mt-6 bg-[#8d64fa] border-[#8d64fa] hover:bg-[#5837b2] hover:border-[#8d64fa]"
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
