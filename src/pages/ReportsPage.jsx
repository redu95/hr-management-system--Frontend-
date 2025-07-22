// src/pages/ReportsPage.jsx
import React from 'react';
import { Button } from 'primereact/button';
import { useThemeStore } from '../store/themeStore'; // Assuming your theme store is here

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register all the components you will use across the charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- Reusable Chart Card Component ---
const ChartCard = ({ title, children }) => (
    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg h-80 flex flex-col transition-colors duration-300">
        <h4 className="font-semibold text-slate-700 dark:text-slate-100 mb-2">{title}</h4>
        <div className="relative flex-grow">
            {children}
        </div>
    </div>
);

// --- Individual Chart Components ---

const HeadcountGrowthChart = ({ isDarkMode }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                ticks: { color: isDarkMode ? '#cbd5e1' : '#64748b' },
                grid: { color: isDarkMode ? '#475569' : '#e2e8f0' }
            },
            x: {
                ticks: { color: isDarkMode ? '#cbd5e1' : '#64748b' },
                grid: { display: false }
            }
        }
    };
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Headcount',
            data: [220, 225, 230, 238, 245, 248],
            borderColor: '#0ea5e9', // sky-500
            backgroundColor: 'rgba(14, 165, 233, 0.2)',
            fill: true,
            tension: 0.4,
        }],
    };
    return <Line options={options} data={data} />;
};

const EmployeeDiversityChart = ({ isDarkMode }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: isDarkMode ? '#cbd5e1' : '#64748b' }
            }
        }
    };
    const data = {
        labels: ['Technology', 'Marketing', 'Sales', 'Finance', 'Support'],
        datasets: [{
            data: [85, 45, 55, 30, 60],
            backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
            borderColor: isDarkMode ? '#475569' : '#ffffff',
            borderWidth: 2,
        }],
    };
    return <Doughnut options={options} data={data} />;
};

const TurnoverRateChart = ({ isDarkMode }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                ticks: { color: isDarkMode ? '#cbd5e1' : '#64748b', callback: (value) => value + '%' },
                grid: { color: isDarkMode ? '#475569' : '#e2e8f0' }
            },
            x: {
                ticks: { color: isDarkMode ? '#cbd5e1' : '#64748b' },
                grid: { display: false }
            }
        }
    };
    const data = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
            label: 'Turnover Rate',
            data: [2.1, 1.8, 2.5, 2.2],
            borderColor: '#ef4444', // rose-500
            tension: 0.4,
        }],
    };
    return <Line options={options} data={data} />;
};

const SalaryDistributionChart = ({ isDarkMode }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                ticks: { color: isDarkMode ? '#cbd5e1' : '#64748b', callback: (value) => '$' + value/1000 + 'k' },
                grid: { color: isDarkMode ? '#475569' : '#e2e8f0' }
            },
            x: {
                ticks: { color: isDarkMode ? '#cbd5e1' : '#64748b' },
                grid: { display: false }
            }
        }
    };
    const data = {
        labels: ['Intern', 'Junior', 'Mid-Level', 'Senior', 'Lead'],
        datasets: [{
            label: 'Average Salary',
            data: [45000, 65000, 85000, 110000, 135000],
            backgroundColor: 'rgba(245, 158, 11, 0.6)', // amber-500 with opacity
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 1,
            borderRadius: 5,
        }],
    };
    return <Bar options={options} data={data} />;
};


// --- Main Reports Page Component ---
const ReportsPage = () => {
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reports & Analytics</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Generate and view key organizational reports.</p>
                </div>
                <Button 
                    label="Export All" 
                    icon="pi pi-download" 
                    className="p-button-secondary"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Executive Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ChartCard title="Headcount Growth (YTD)">
                        <HeadcountGrowthChart isDarkMode={isDarkMode} />
                    </ChartCard>
                    <ChartCard title="Employee Diversity by Department">
                        <EmployeeDiversityChart isDarkMode={isDarkMode} />
                    </ChartCard>
                    <ChartCard title="Quarterly Turnover Rate">
                        <TurnoverRateChart isDarkMode={isDarkMode} />
                    </ChartCard>
                    <ChartCard title="Salary Distribution by Role">
                        <SalaryDistributionChart isDarkMode={isDarkMode} />
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
