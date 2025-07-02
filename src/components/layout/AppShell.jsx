// src/components/layout/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
// You will create Header.jsx next, for now we can omit it or create a placeholder
// import Header from './Header'; 

const AppLayout = () => {
    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* <Header /> You would put the header component here */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet /> {/* This is where your page component will be rendered */}
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
