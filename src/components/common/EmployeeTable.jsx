// src/components/features/EmployeeTable.jsx
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

// Dummy data - you will replace this with data from TanStack React Query
const employees = [
    { 
        id: 'EMP-001', 
        name: 'Eva Elfie', 
        title: 'Digital Marketing Lead', 
        department: 'Marketing', 
        email: 'eva.e@company.com',
        avatar: 'E'
    },
    { 
        id: 'EMP-002', 
        name: 'Jane Doe', 
        title: 'Finance Manager', 
        department: 'Finance', 
        email: 'jane.d@company.com',
        avatar: 'J'
    },
    { 
        id: 'EMP-003', 
        name: 'John Smith', 
        title: 'Senior Developer', 
        department: 'Technology', 
        email: 'john.s@company.com',
        avatar: 'J'
    },
    { 
        id: 'EMP-004', 
        name: 'Mia Khalifa', 
        title: 'Customer Support Rep', 
        department: 'Customer Support', 
        email: 'mia.k@company.com',
        avatar: 'M'
    },
];

const EmployeeTable = () => {

    // Template for the "Name" column to include avatar and ID
    const nameBodyTemplate = (rowData) => {
        return (
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                    {rowData.avatar}
                </div>
                <div>
                    <p className="font-semibold text-slate-700">{rowData.name}</p>
                    <p className="text-sm text-slate-500">{rowData.id}</p>
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
        <DataTable value={employees} responsiveLayout="scroll" className="p-datatable-customers">
            <Column header="Name" body={nameBodyTemplate} style={{ minWidth: '14rem' }} />
            <Column field="title" header="Job Title" style={{ minWidth: '14rem' }} />
            <Column field="department" header="Department" style={{ minWidth: '10rem' }} />
            <Column field="email" header="Email" style={{ minWidth: '14rem' }} />
            <Column header="Actions" body={actionBodyTemplate} style={{ minWidth: '8rem' }} />
        </DataTable>
    );
};

export default EmployeeTable;
