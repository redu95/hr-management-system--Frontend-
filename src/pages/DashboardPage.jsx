// src/pages/DashboardPage.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Placeholder for the chart component
const HeadcountChart = () => {
    return (
        <div className="bg-slate-50 p-4 rounded-lg h-full flex items-center justify-center">
            <p className="text-slate-400 font-medium">[Bar Chart Placeholder]</p>
        </div>
    );
};

// Reusable component for the list of recent hires
const RecentHiresList = () => {
    const hires = [
        { name: 'Lana Rhoades', title: 'Sales Executive', avatar: 'L' },
        { name: 'John Sins', title: 'Customer Support', avatar: 'J' },
        { name: 'Dani Daniels', title: 'Finance Analyst', avatar: 'D' },
        { name: 'Eva Elfie', title: 'Marketing Intern', avatar: 'E' },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            <h3 className="text-lg font-semibold text-slate-800">Recent Hires</h3>
            <ul className="mt-4 space-y-4">
                {hires.map((hire, index) => (
                    <li key={index} className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                           {hire.avatar}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-700">{hire.name}</p>
                            <p className="text-sm text-slate-500">{hire.title}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// UPDATED KpiCard component with PrimeIcons
const KpiCard = ({ icon, title, value, color, index }) => {
    const colors = {
        sky: 'text-sky-500 bg-sky-100',
        amber: 'text-amber-500 bg-amber-100',
        rose: 'text-rose-500 bg-rose-100',
        green: 'text-green-500 bg-green-100',
    };

    return (
        <motion.div
            className="bg-white p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <i className={`pi ${icon} text-2xl p-3 rounded-full ${colors[color]}`}></i>
            <p className="text-3xl font-bold mt-4 text-slate-800">{value}</p>
            <p className="text-slate-500">{title}</p>
        </motion.div>
    );
};

// The main Dashboard Page component with updated icon names
const DashboardPage = () => {
    const kpiData = [
        { icon: 'pi-users', title: 'Total Employees', value: '248', color: 'sky' },
        { icon: 'pi-user-minus', title: 'Employees on Leave', value: '12', color: 'amber' },
        { icon: 'pi-inbox', title: 'Pending Requests', value: '5', color: 'rose' },
        { icon: 'pi-user-plus', title: 'New Hires (Month)', value: '8', color: 'green' },
    ];

    return (
        <div className="p-4 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((item, index) => (
                    <KpiCard
                        key={index}
                        icon={item.icon}
                        title={item.title}
                        value={item.value}
                        color={item.color}
                        index={index}
                    />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-slate-800">Headcount by Department</h3>
                    <div className="h-80 mt-4">
                       <HeadcountChart />
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <RecentHiresList />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
