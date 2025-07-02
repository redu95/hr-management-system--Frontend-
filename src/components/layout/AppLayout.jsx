// src/components/layout/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
 import Header from './Header'; 

const AppLayout = () => {
    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <div className="flex-1 overflow-y-auto">
                    <Outlet /> {/* This is where the page component will be rendered */}
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
