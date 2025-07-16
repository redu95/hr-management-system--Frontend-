// src/components/features/EmployeeTable.jsx
import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';

const EmployeeTable = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const toast = useRef(null);
    const navigate = useNavigate();

    // State for modals
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // State for the Edit form
    const [editForm, setEditForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        job_title: '',
        department: null,
        phone_number: '',
        date_of_birth: null,
        is_active: true,
    });
    const [editLoading, setEditLoading] = useState(false);

    // --- Reusable Data Fetching Function ---
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/employees`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (!res.ok) {
                if (res.status === 401) {
                    navigate('/login');
                }
                throw new Error('Failed to fetch employees');
            }
            const data = await res.json();
            let results = data.results || data;
            console.log('Fetched Employees:', results);
            setEmployees(Array.isArray(results) ? results : []);
            // employees.forEach(emp => {  console.log('Employee departments:', emp.department_details); });
        } catch (err) {
            console.error(err);
            setEmployees([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEmployees(); // Initial fetch

        const fetchDepartments = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/departments`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    setDepartments(data.results || data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchDepartments();
    }, [navigate]);

    // --- Open Modals ---
    const openViewModal = (employee) => {
        setSelectedEmployee(employee);
        setShowViewModal(true);
    };

    const openEditModal = (employee) => {
        setSelectedEmployee(employee);
        setEditForm({
            ...employee,
            // Ensure department is an object for the dropdown
            department: departments.find(d => d.id === (employee.department?.id || employee.department)),
            // Ensure date_of_birth is a Date object for the calendar
            date_of_birth: employee.date_of_birth ? new Date(employee.date_of_birth) : null,
        });
        setShowEditModal(true);
    };

    // --- Handle Edit Form ---
    const handleEditFormChange = (e, field) => {
        const value = e?.target ? e.target.value : e;
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return;
    setEditLoading(true);

    try {
        const token = localStorage.getItem('accessToken');

        // --- FIX IS HERE ---

        // 1. Create a mutable copy of the form data
        const payload = { ...editForm };

        // 2. Set the department ID
        payload.department = payload.department?.id || null;

        // 3. IMPORTANT: Delete the old department_details object
        delete payload.department_details;

        // 4. Format the date
        payload.date_of_birth = payload.date_of_birth ? new Date(payload.date_of_birth).toISOString().split('T')[0] : null;

        // --- END FIX ---

        console.log('Final Payload Sent to API:', payload);

        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/employees/${selectedEmployee.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errData = await res.json();
            // This will grab the specific error message from Django
            const errorMessage = errData.department?.[0] || 'Failed to update. Check all fields.';
            throw new Error(errorMessage);
        }

        setShowEditModal(false);
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Employee updated!' });
        fetchEmployees();

    } catch (err) {
        console.error("Update Error:", err);
        toast.current?.show({ severity: 'error', summary: 'Error', detail: err.message });
    } finally {
        setEditLoading(false);
    }
};

    // --- Body Templates ---
    const nameBodyTemplate = (rowData) => (
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-100 flex items-center justify-center font-bold">
                {rowData.first_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
                <p className="font-semibold text-slate-700 dark:text-slate-100">{rowData.first_name} {rowData.last_name}</p>
            </div>
        </div>
    );
    
    const actionBodyTemplate = (rowData) => (
        <div className="flex items-center space-x-2">
            <Button icon="pi pi-eye" className="p-button-rounded p-button-text p-button-info" onClick={() => openViewModal(rowData)} />
            <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" onClick={() => openEditModal(rowData)} />
        </div>
    );

    const activeBodyTemplate = (rowData) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${rowData.is_active ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'}`}>
            {rowData.is_active ? 'Active' : 'Inactive'}
        </span>
    );
    
    const departmentBodyTemplate = (rowData) => (
        <span>{rowData.department_details?.name || ''}</span>
    );

    const renderDetail = (label, value) => (
        <div className="grid grid-cols-3 gap-4">
            <dt className="font-medium text-slate-500 dark:text-slate-400 col-span-1">{label}</dt>
            <dd className="text-slate-700 dark:text-slate-200 col-span-2">{value || 'N/A'}</dd>
        </div>
    );

    return (
        <div className="bg-white pb-11 dark:bg-slate-800 rounded-xl transition-colors duration-300">
            <Toast ref={toast} />

            {/* View Employee Modal */}
            <Dialog header="Employee Details" visible={showViewModal} style={{ width: '32rem' }} onHide={() => setShowViewModal(false)} modal pt={{
        // Targets the main dialog container
        root: {
            className: 'dark:border dark:border-slate-700'
        },
        // Targets the header section
        header: {
            className: 'dark:bg-slate-800 dark:text-slate-200 dark:border-b dark:border-slate-700'
        },
        // Targets the actual title text
        title: {
            className: 'dark:text-slate-200'
        },
        // Targets the close button and its icon
        closeButton: {
            className: 'dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'
        },
        closeButtonIcon: {
            className: 'dark:text-slate-400'
        },
        // Targets the content area
        content: {
            className: 'dark:bg-slate-800 dark:text-slate-300'
        },
        // Targets the footer section
        footer: {
            className: 'dark:bg-slate-800 dark:border-t dark:border-slate-700'
        }
    }}>
                {selectedEmployee && (
                    <div className="p-4 space-y-4">
                        {renderDetail('Full Name', `${selectedEmployee.first_name} ${selectedEmployee.last_name}`)}
                        {renderDetail('Email', selectedEmployee.email)}
                        {renderDetail('Phone Number', selectedEmployee.phone_number)}
                        {renderDetail('Job Title', selectedEmployee.job_title)}
                        {renderDetail('Department', selectedEmployee.department_details?.name)}
                        {renderDetail('Date of Birth', selectedEmployee.date_of_birth)}
                        {renderDetail('Status', selectedEmployee.is_active ? 'Active' : 'Inactive')}
                    </div>
                )}
            </Dialog>

            {/* Edit Employee Modal */}
            <Dialog header="Edit Employee" visible={showEditModal} style={{ width: '32rem' }} onHide={() => setShowEditModal(false)} modal pt={{
        // Targets the main dialog container
        root: {
            className: 'dark:border dark:border-slate-700'
        },
        // Targets the header section
        header: {
            className: 'dark:bg-slate-800 dark:text-slate-200 dark:border-b dark:border-slate-700'
        },
        // Targets the actual title text
        title: {
            className: 'dark:text-slate-200'
        },
        // Targets the close button and its icon
        closeButton: {
            className: 'dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'
        },
        closeButtonIcon: {
            className: 'dark:text-slate-400'
        },
        // Targets the content area
        content: {
            className: 'dark:bg-slate-800 dark:text-slate-300'
        },
        // Targets the footer section
        footer: {
            className: 'dark:bg-slate-800 dark:border-t dark:border-slate-700'
        }
    }} footer={
                <div className="dark:bg-slate-800 p-3 rounded-b-md">
                    <Button label="Cancel" icon="pi pi-times" className=" pr-4 p-button-text dark:text-slate-300" onClick={() => setShowEditModal(false)} />
                    <Button label="Save Changes" icon="pi pi-check" className="p-button-success  dark:text-slate-300" loading={editLoading} onClick={handleEditEmployee} />
                </div>
            }
            >
                <div className="p-fluid space-y-4  dark:bg-slate-800 dark:text-slate-300">
                    <div><label>First Name</label><InputText className=' dark:bg-slate-800 dark:text-slate-300' value={editForm.first_name} onChange={e => handleEditFormChange(e, 'first_name')} /></div>
                    <div><label>Last Name</label><InputText className=' dark:bg-slate-800 dark:text-slate-300' value={editForm.last_name} onChange={e => handleEditFormChange(e, 'last_name')} /></div>
                    <div><label>Email</label><InputText className=' dark:bg-slate-800 dark:text-slate-300' value={editForm.email} onChange={e => handleEditFormChange(e, 'email')} /></div>
                    <div><label>Job Title</label><InputText className=' dark:bg-slate-800 dark:text-slate-300' value={editForm.job_title} onChange={e => handleEditFormChange(e, 'job_title')} /></div>
                    <div><label>Department</label><Dropdown pt={{
                                                                root: { className: 'dark:bg-slate-800 dark:border-slate-700' },
                                                                input: { className: 'dark:text-slate-300' },
                                                                trigger: { className: 'dark:bg-slate-800 dark:text-slate-400' },
                                                                panel: { className: 'dark:bg-slate-800 dark:text-slate-300' },
                                                                item: { className: 'dark:hover:bg-slate-700' },
                                                                filterInput: { className: 'dark:bg-slate-700' }
                                                            }} value={editForm.department} options={departments} optionLabel="name" placeholder="Select Department" onChange={e => handleEditFormChange(e, 'department')} filter /></div>
                    <div><label>Phone Number</label><InputText className=' dark:bg-slate-800 dark:text-slate-300' value={editForm.phone_number} onChange={e => handleEditFormChange(e, 'phone_number')} /></div>
                    <div><label>Date of Birth</label><Calendar pt={{
                                                                    // Input field
                                                                    input: {
                                                                        className: 'dark:bg-red-800 dark:text-red-300 dark:border-slate-600'
                                                                    },
                                                                    // The popup panel
                                                                    panel: {
                                                                        className: 'dark:bg-slate-700 dark:border-slate-600'
                                                                    },
                                                                    // Header of the popup (contains month, year, nav buttons)
                                                                    header: {
                                                                        className: 'dark:bg-slate-800 dark:text-slate-200'
                                                                    },
                                                                    // The title (e.g., "July 2025")
                                                                    title: {
                                                                        className: 'dark:text-slate-200'
                                                                    },
                                                                    // The day labels in the header (Sun, Mon, etc.)
                                                                    dayLabel: {
                                                                        className: 'dark:text-slate-400'
                                                                    },
                                                                    // Individual date numbers
                                                                    day: ({ context }) => ({
                                                                        className: context.selected
                                                                            ? 'dark:!bg-sky-500 dark:!text-white' // Selected date
                                                                            : context.today
                                                                            ? 'dark:!bg-slate-700 dark:!text-sky-400' // Today's date
                                                                            : 'dark:text-slate-300 dark:hover:bg-slate-700' // Other dates
                                                                    }),
                                                                    // The calendar icon button
                                                                    dropdownButton: {
                                                                        root: {
                                                                            className: 'dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                                                                        }
                                                                    }
                                                                }} value={editForm.date_of_birth} onChange={e => handleEditFormChange(e, 'date_of_birth')} dateFormat="yy-mm-dd" showIcon /></div>
                    <div className="flex items-center space-x-3 pt-2"><label>Status</label><InputSwitch checked={editForm.is_active} onChange={e => handleEditFormChange(e, 'is_active')} /><span>{editForm.is_active ? 'Active' : 'Inactive'}</span></div>
                </div>
            </Dialog>

            <DataTable value={employees} loading={loading} responsiveLayout="scroll" className="p-datatable-customers">
                <Column header="Name" body={nameBodyTemplate} />
                <Column field="email" header="Email" />
                <Column field="job_title" header="Job Title" />
                <Column header="Department" body={departmentBodyTemplate} />
                <Column header="Status" body={activeBodyTemplate} />
                <Column header="Actions" body={actionBodyTemplate} />
            </DataTable>
        </div>
    );
};

export default EmployeeTable;
