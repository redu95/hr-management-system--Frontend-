// src/components/features/EmployeeTable.jsx
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

// Dummy data - you will replace this with data from TanStack React Query
const employees = [
    { 
        id: 'EMP-001', 
        name: 'Minasie Lemma', 
        title: 'Chief Technology Officer(CTO)', 
        department: 'Technology', 
        email: 'minasie.e@company.com',
        avatar: 'M'
    },
    { 
        id: 'EMP-002', 
        name: 'Naol Lemma', 
        title: 'Chief Executive Officer(CEO)', 
        department: 'Management', 
        email: 'naol.d@company.com',
        avatar: 'N'
    },
    { 
        id: 'EMP-003', 
        name: 'Eleni Lemma', 
        title: 'Human Resource Manager(HR)', 
        department: 'Human Resources', 
        email: 'eleni.s@company.com',
        avatar: 'E'
    },
    { 
        id: 'EMP-004', 
        name: 'Yididya Lemma', 
        title: 'Frontend Developer', 
        department: 'Technology', 
        email: 'yididya.k@company.com',
        avatar: 'Y'
    },
];

const EmployeeTable = () => {

    // Template for the "Name" column to include avatar and ID
    const nameBodyTemplate = (rowData) => {
        return (
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-100 flex items-center justify-center font-bold">
                    {rowData.avatar}
                </div>
                <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-100">{rowData.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{rowData.id}</p>
                </div>
            </div>
        );
    };

    // Template for the "Actions" column
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex items-center space-x-2">
                <Button icon="pi pi-eye" className="p-button-rounded p-button-text p-button-info" aria-label="View" />
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" aria-label="Edit" />
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl transition-colors duration-300">
            <DataTable 
                value={employees} 
                responsiveLayout="scroll" 
                className="p-datatable-customers dark:bg-slate-800 dark:text-slate-100"
            >
                <Column header="Name" body={nameBodyTemplate} style={{ minWidth: '14rem' }} />
                <Column field="title" header="Job Title" style={{ minWidth: '14rem' }} />
                <Column field="department" header="Department" style={{ minWidth: '10rem' }} />
                <Column field="email" header="Email" style={{ minWidth: '14rem' }} />
                <Column header="Actions" body={actionBodyTemplate} style={{ minWidth: '8rem' }} />
            </DataTable>
        </div>
    );
};

export default EmployeeTable;
