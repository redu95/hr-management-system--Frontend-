// src/pages/ReportsPage.jsx
import React from 'react';
import { Button } from 'primereact/button';

// Placeholder component for a chart. You'll replace this with a real Chart.js component.
const ChartPlaceholder = ({ title }) => {
    return (
        <div className="bg-slate-50 p-4 rounded-lg h-full flex flex-col">
            <h4 className="font-semibold text-slate-700 mb-2">{title}</h4>
            <div className="flex-grow flex items-center justify-center text-slate-400">
                <p>[{title} Placeholder]</p>
            </div>
        </div>
    );
};


const ReportsPage = () => {
    return (
        <div className="p-4 sm:p-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
                    <p className="text-sm text-slate-500 mt-1">Generate and view key organizational reports.</p>
                </div>
                <Button 
                    label="Export All" 
                    icon="pi pi-download" 
                    className="p-button-secondary"
                />
            </div>

            {/* Main Content Area */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Executive Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Headcount Growth Chart */}
                    <div className="h-80">
                        <ChartPlaceholder title="Headcount Growth (YTD)" />
                    </div>

                    {/* Employee Diversity Chart */}
                    <div className="h-80">
                        <ChartPlaceholder title="Employee Diversity by Department" />
                    </div>

                    {/* Turnover Rate Chart */}
                    <div className="h-80">
                        <ChartPlaceholder title="Quarterly Turnover Rate" />
                    </div>

                    {/* Salary Distribution Chart */}
                    <div className="h-80">
                        <ChartPlaceholder title="Salary Distribution by Role" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
