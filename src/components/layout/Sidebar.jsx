// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    // This function is used by NavLink to apply active styles
    const getNavLinkClass = ({ isActive }) => {
        const baseClasses = "flex items-center space-x-3 p-3 rounded-lg text-slate-600 hover:bg-slate-100";
        const activeClasses = "bg-sky-100 text-sky-900 font-semibold";
        return isActive ? `${baseClasses} ${activeClasses}` : baseClasses;
    };

    return (
        <aside className="w-64 bg-white shadow-md flex-col hidden lg:flex">
            {/* Logo/Header */}
            <div className="p-6 text-center border-b">
                <i className="fas fa-sitemap text-3xl text-sky-600"></i>
                <h1 className="text-2xl font-bold text-slate-800 mt-2">HRM</h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink to="/" className={getNavLinkClass}>
                    <i className="w-6 text-center fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/employees" className={getNavLinkClass}>
                    <i className="w-6 text-center fas fa-users"></i>
                    <span>Employees</span>
                </NavLink>
                <NavLink to="/leave" className={getNavLinkClass}>
                    <i className="w-6 text-center fas fa-calendar-alt"></i>
                    <span>Leave Mgt.</span>
                </NavLink>
                <NavLink to="/reports" className={getNavLinkClass}>
                    <i className="w-6 text-center fas fa-chart-pie"></i>
                    <span>Reports</span>
                </NavLink>
                <NavLink to="/settings" className={getNavLinkClass}>
                    <i className="w-6 text-center fas fa-cog"></i>
                    <span>Settings</span>
                </NavLink>
            </nav>

            {/* Logout Section */}
            <div className="px-4 py-6 border-t">
                <NavLink to="/login" className="flex items-center space-x-3 p-3 rounded-lg text-slate-600 hover:bg-slate-100">
                    <i className="w-6 text-center fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
