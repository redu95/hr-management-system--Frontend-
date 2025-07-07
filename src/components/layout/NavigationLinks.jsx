import React from 'react';
import { NavLink } from 'react-router-dom';

const NavigationLinks = ({ onLinkClick }) => {
    const getNavLinkClass = ({ isActive }) => {
        const baseClasses = "flex items-center space-x-3 p-3 rounded-lg text-slate-600 hover:bg-slate-100";
        const activeClasses = "bg-sky-100 text-sky-900 font-semibold";
        return isActive ? `${baseClasses} ${activeClasses}` : baseClasses;
    };

    return (
        <>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink to="/dashboard" className={getNavLinkClass} onClick={onLinkClick}>
                    <i className="w-6 text-center fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/employees" className={getNavLinkClass} onClick={onLinkClick}>
                    <i className="w-6 text-center fas fa-users"></i>
                    <span>Employees</span>
                </NavLink>
                <NavLink to="/leave" className={getNavLinkClass} onClick={onLinkClick}>
                    <i className="w-6 text-center fas fa-calendar-alt"></i>
                    <span>Leave Mgt.</span>
                </NavLink>
                <NavLink to="/reports" className={getNavLinkClass} onClick={onLinkClick}>
                    <i className="w-6 text-center fas fa-chart-pie"></i>
                    <span>Reports</span>
                </NavLink>
                <NavLink to="/settings" className={getNavLinkClass} onClick={onLinkClick}>
                    <i className="w-6 text-center fas fa-cog"></i>
                    <span>Settings</span>
                </NavLink>
            </nav>
            <div className="px-4 py-6 border-t">
                <NavLink to="/logout" className="flex items-center space-x-3 p-3 rounded-lg text-slate-600 hover:bg-slate-100" onClick={onLinkClick}>
                    <i className="w-6 text-center fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </NavLink>
            </div>
        </>
    );
};

export default NavigationLinks;
