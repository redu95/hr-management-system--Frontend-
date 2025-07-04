// src/components/layout/Header.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const Header = ({ onMenuClick }) => { // Accept onMenuClick prop
    const location = useLocation();

    const getPageTitle = (pathname) => {
        if (pathname === '/') return 'Dashboard';
        const title = pathname.replace('/', '').charAt(0).toUpperCase() + pathname.slice(2);
        return title.replace('Mgt', 'Management');
    };

    const pageTitle = getPageTitle(location.pathname);

    return (
        <header className="bg-purple-400 shadow-sm p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                {/* Hamburger Menu Button - visible only on small screens */}
                <Button 
                    icon="pi pi-bars" 
                    className="p-button-rounded p-button-text lg:hidden" 
                    onClick={onMenuClick} 
                />
                <h2 className="text-2xl font-bold text-slate-800 hidden md:block">
                    {pageTitle}
                </h2>
            </div>

           {/* Right-side controls */}
            <div className="flex items-center space-x-4 sm:space-x-6">
                {/* Search Bar */}
                <span className="relative hidden sm:inline-flex">
                    <InputText
                        placeholder="Search..."
                        className="w-72 md:w-96 p-inputtext-lg pr-10"
                    />
                    <i className="pi pi-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                </span>

                {/* Notification Icon */}
                <i className="pi pi-bell p-text-secondary text-xl cursor-pointer" />

                {/* User Profile */}
                <div className="flex items-center space-x-3 cursor-pointer">
                    <img 
                        src="https://placehold.co/40x40/E2E8F0/475569?text=A" 
                        className="w-10 h-10 rounded-full" 
                        alt="Admin"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/E2E8F0/475569?text=A'; }}
                    />
                    <div className="hidden md:block">
                        {/* This data will eventually come from your Zustand store */}
                        <p className="font-semibold text-sm">Alex Turner</p>
                        <p className="text-xs text-slate-500">Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
