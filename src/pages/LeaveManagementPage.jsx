// src/pages/LeaveManagementPage.jsx
import React from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

// Dummy data - you will replace this with data from TanStack React Query
const pendingRequests = [
    { 
        id: 1,
        employee: { name: 'Eva Elfie', avatar: 'E' },
        leaveType: 'Vacation',
        startDate: '2025-07-10',
        endDate: '2025-07-15',
        days: 5,
        reason: 'Family trip to the coast.'
    },
    { 
        id: 2,
        employee: { name: 'John Smith', avatar: 'J' },
        leaveType: 'Sick Leave',
        startDate: '2025-07-02',
        endDate: '2025-07-02',
        days: 1,
        reason: 'Feeling unwell.'
    },
    { 
        id: 3,
        employee: { name: 'Mia Khalifa', avatar: 'M' },
        leaveType: 'Personal',
        startDate: '2025-07-08',
        endDate: '2025-07-08',
        days: 1,
        reason: 'Appointment.'
    },
    { 
        id: 1,
        employee: { name: 'Eva Elfie', avatar: 'E' },
        leaveType: 'Vacation',
        startDate: '2025-07-10',
        endDate: '2025-07-15',
        days: 5,
        reason: 'Family trip to the coast.'
    },
    { 
        id: 2,
        employee: { name: 'John Smith', avatar: 'J' },
        leaveType: 'Sick Leave',
        startDate: '2025-07-02',
        endDate: '2025-07-02',
        days: 1,
        reason: 'Feeling unwell.'
    },
    { 
        id: 3,
        employee: { name: 'Mia Khalifa', avatar: 'M' },
        leaveType: 'Personal',
        startDate: '2025-07-08',
        endDate: '2025-07-08',
        days: 1,
        reason: 'Appointment.'
    },
];

const LeaveManagementPage = () => {

    // Template for the Employee column
    const employeeBodyTemplate = (rowData) => {
        return (
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                    {rowData.employee.avatar}
                </div>
                <span className="font-semibold text-slate-700">{rowData.employee.name}</span>
            </div>
        );
    };

    // Template for the Leave Type column with colored tags
    const leaveTypeBodyTemplate = (rowData) => {
        const severityMap = {
            'Vacation': 'info',
            'Sick Leave': 'warning',
            'Personal': 'success'
        };
        return <Tag value={rowData.leaveType} severity={severityMap[rowData.leaveType]} />;
    };

    // Template for the Actions column
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex items-center space-x-2">
                <Button label="Approve" className="p-button-sm p-button-success p-button-text" />
                <Button label="Deny" className="p-button-sm p-button-danger p-button-text" />
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-8">
            {/* Top section with title and action button */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Leave Management</h2>
                    <p className="text-sm text-slate-500 mt-1">Review pending requests and manage leave balances.</p>
                </div>
                <Button 
                    label="Request Leave" 
                    icon="pi pi-plus" 
                    className="p-button-primary"
                />
            </div>

            {/* Pending Requests Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Pending Requests</h3>
                <DataTable value={pendingRequests} responsiveLayout="scroll">
                    <Column header="Employee" body={employeeBodyTemplate} />
                    <Column header="Leave Type" body={leaveTypeBodyTemplate} />
                    <Column field="startDate" header="Start Date" />
                    <Column field="endDate" header="End Date" />
                    <Column field="days" header="Days" />
                    <Column header="Actions" body={actionBodyTemplate} />
                </DataTable>
            </div>

        </div>
    );
};

export default LeaveManagementPage;
