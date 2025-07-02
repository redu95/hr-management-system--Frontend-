import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';

// Make sure you have Font Awesome linked in your main public/index.html file
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" ... />

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        // TODO: Replace with real API call in the future
        // Simulate async login
        setTimeout(() => {
            navigate('/dashboard');
        }, 500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4 font-sans">
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <i className="fas fa-sitemap text-4xl text-sky-600"></i>
                    <h1 className="text-3xl font-bold text-slate-800 mt-2">HR Management</h1>
                    <p className="text-slate-500">Welcome back! Please login to your account.</p>
                </div>

                {/* Login Form Card */}
                <div className="bg-red p-8 rounded-xl shadow-lg border border-slate-100">
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
                                className="w-full p-3 bg-slate-50 border-slate-200" // Base styling
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
                                className="w-full" // The component nests the input, so style the input with inputClassName
                                inputClassName="w-full p-3 bg-slate-50 border-slate-200"
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
