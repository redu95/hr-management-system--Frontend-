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
    const [email, setEmail] = useState('');
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
                    username: email,
                    password: password
                })
            });
            if (!response.ok) {
                // let errorMsg = 'Invalid credentials. No account found with the entered email and password.';
                try {
                    const errorData = await response.json();
                    // Django returns { detail: "No active account found with the given credentials" }
                    if (errorData && errorData.detail) {
                        errorMsg = errorData.detail;
                    }
                } catch {
                    // ignore JSON parse errors
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
        <div className="min-h-screen flex items-center justify-center bg-white p-4 font-sans">
            <Toast ref={toast} position="top-center" />
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <i className="fas fa-sitemap text-4xl text-sky-600"></i>
                    <h1 className="text-3xl font-bold text-slate-800 mt-2">HR Management</h1>
                    <p className="text-slate-500">Welcome back! Please login to your account.</p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                    <div className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-slate-600 block mb-1">
                                Email Address
                            </label>
                            <InputText
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full" // wrapper
                                inputClassName="p-3 bg-slate-50 border-slate-200 rounded-lg" // input itself
                                placeholder="you@company.com"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-slate-600 block mb-1">
                                Password
                            </label>
                            <Password
                                inputId="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full"
                                inputClassName="p-3 bg-slate-50 border-slate-200 rounded-lg"
                                placeholder="************"
                                feedback={false} // Hides the password strength meter
                                toggleMask // Adds the show/hide password icon
                            />
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex items-center justify-end mt-4">
                        <a href="#" className="text-sm text-sky-600 hover:underline">
                            Forgot Password?
                        </a>
                    </div>

                    {/* Login Button */}
                    <Button
                        label="Login"
                        onClick={handleLogin}
                        className="w-full mt-6 bg-sky-600 border-sky-600 hover:bg-sky-700 hover:border-sky-700"
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
