// src/components/layout/NavigationLinks.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const NavigationLinks = ({ onLinkClick }) => {
    const getNavLinkClass = ({ isActive }) => {
        // Updated active classes for the new design
        const baseClasses = "flex items-center space-x-4 p-3 rounded-lg text-slate-700 hover:bg-slate-100 font-medium dark:text-slate-100";
        const activeClasses = "bg-sky-100 text-sky-700 dark:text-slate-100 dark:bg-sky-900";
        return isActive ? `${baseClasses} ${activeClasses}` : baseClasses;
    };

    return (
        <>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink to="/dashboard" className={getNavLinkClass} onClick={onLinkClick}>
                    <i className="pi pi-th-large w-6 text-center text-lg dark:text-slate-100"></i>
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/employees" className={getNavLinkClass} onClick={onLinkClick}>
                    <i className="pi pi-users w-6 text-center text-lg dark:text-slate-100"></i>
                    <span>Employees</span>
                </NavLink>
                <NavLink to="/leave" className={getNavLinkClass} onClick={onLinkClick}>
                    <i className="pi pi-calendar w-6 text-center text-lg dark:text-slate-100"></i>
                    <span>Leave Mgt.</span>
                </NavLink>
                <NavLink to="/reports" className={getNavLinkClass} onClick={onLinkClick}>
                    <i className="pi pi-chart-bar w-6 text-center text-lg dark:text-slate-100"></i>
                    <span>Reports</span>
                </NavLink>
                <NavLink to="/settings" className={getNavLinkClass} onClick={onLinkClick}>
                    <i className="pi pi-cog w-6 text-center text-lg dark:text-slate-100"></i>
                    <span>Settings</span>
                </NavLink>
            </nav>
            <div className="px-4 py-6 border-t">
                <NavLink to="/logout" className="flex items-center space-x-4 p-3 rounded-lg text-slate-700 hover:bg-slate-100 font-medium dark:text-slate-100" onClick={onLinkClick}>
                    <i className="pi pi-sign-out w-6 text-center text-lg"></i>
                    <span>Logout</span>
                </NavLink>
            </div>
        </>
    );
};

export default NavigationLinks;
