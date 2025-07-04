// src/components/layout/AppLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import MobileSidebar from './MobileSidebar';
import NavigationLinks from './NavigationLinks'; // Import the reusable links
import guestHomeLogo from '../../assets/guesthome.svg'; // Import the SVG


// This is the static sidebar for desktop view
const DesktopSidebar = () => {
    return (
        <aside className="w-64 bg-white shadow-md flex-col hidden lg:flex">
            <div className="p-6 text-center border-b">
                <img src={guestHomeLogo} alt="Guest Home Logo" className="w-16 h-16 mx-auto mb-2" />
                <span className="text-base font-semibold text-slate-500 mt-2 inline-block">HRMS</span>
            </div>
            <NavigationLinks />
        </aside>
    );
};


const AppLayout = () => {
    const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Renders the static sidebar for large screens */}
            <DesktopSidebar />

            {/* Renders the PrimeReact sidebar for small screens */}
            <MobileSidebar 
                visible={mobileSidebarVisible} 
                onHide={() => setMobileSidebarVisible(false)} 
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setMobileSidebarVisible(true)} />
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
