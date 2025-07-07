// src/pages/EmployeesPage.jsx
import React from 'react';
import { Button } from 'primereact/button';
import EmployeeTable from '../components/common/EmployeeTable'; // Adjust path if needed

const EmployeesPage = () => {
    return (
        <div className="p-4 sm:p-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Employee List</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Manage all employees in the organization.</p>
                    </div>
                    <Button 
                        label="Add Employee" 
                        icon="pi pi-plus" 
                        className="p-button-primary"
                    />
                </div>

                {/* Employee Table */}
                <EmployeeTable />
            </div>
        </div>
    );
};

export default EmployeesPage;
