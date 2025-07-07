// src/pages/DashboardPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register the components you will use
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- Chart Component ---
const HeadcountChart = () => {
    // Chart options
    const options = {
        responsive: true,
        maintainAspectRatio: false, // Important to allow custom height
        plugins: {
            legend: {
                display: false, // We don't need a legend for a single dataset
            },
            title: {
                display: false, // The title is already in the card header
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#e2e8f0', // slate-200
                },
                ticks: {
                    color: '#64748b', // slate-500
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#64748b', // slate-500
                }
            }
        }
    };

    // Dummy data for the chart
    const data = {
        labels: ['Marketing', 'Finance', 'Technology', 'Customer Support', 'Sales'],
        datasets: [
            {
                label: 'Headcount',
                data: [45, 30, 85, 60, 55],
                backgroundColor: 'rgba(14, 165, 233, 0.6)', // sky-500 with opacity
                borderColor: 'rgba(14, 165, 233, 1)',
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    };

    return <Bar options={options} data={data} />;
};

// Reusable component for the list of recent hires
const RecentHiresList = () => {
    const hires = [
        { name: 'Minase Lemma', title: 'CTO(Chief Technology Officer)', avatar: 'M' },
        { name: 'Naol Lemma', title: 'CEO(Chief Executive Officer)', avatar: 'N' },
        { name: 'Eleni Lemma', title: 'HR (Human Resource)', avatar: 'E' },
        { name: 'Yididya Lemma', title: 'Frontend Developer', avatar: 'Y' },
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
