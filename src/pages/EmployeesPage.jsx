// src/pages/EmployeesPage.jsx
import React, { useEffect, useState, useRef} from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Calendar } from 'primereact/calendar';
import EmployeeTable from '../components/common/EmployeeTable'; // Adjust path if needed

const EmployeesPage = () => {
        const [showAddModal, setShowAddModal] = useState(false);
        const [addLoading, setAddLoading] = useState(false);
        const [addForm, setAddForm] = useState({
        });
        const [departments, setDepartments] = useState([]);
        const [loading, setLoading] = useState(true);
        const toast = useRef(null);
    // Fetch departments for dropdown
        useEffect(() => {
            const fetchDepartments = async () => {
                try {
                    const token = localStorage.getItem('accessToken');
                    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/departments`, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    });
                    if (res.ok) {
                        const data = await res.json();
                        console.log('Fetched departments:', data);
                        let results = data.results || data; // Handle both paginated and non-paginated responses
                        setDepartments(results);
                    }
                } catch (err) {
                    setDepartments([]);
                }
            };
            fetchDepartments();
        }, []);

    // Handle add employee form input change
    const handleAddFormChange = (e, field) => {
        const value = e?.target ? e.target.value : e;
        setAddForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle add employee submit
    const handleAddEmployee = async () => {
        setAddLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const payload = {
                ...addForm,
                department: addForm.department ? addForm.department.id : null,
                date_of_birth: addForm.date_of_birth
                    ? addForm.date_of_birth.toISOString().split('T')[0]
                    : null,
            };
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/employees/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setShowAddModal(false);
                setAddForm({
                    first_name: '',
                    last_name: '',
                    email: '',
                    job_title: '',
                    department: null,
                    phone_number: '',
                    date_of_birth: null,
                    is_active: true,
                });
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Employee added!' });
                // Refresh employee list
                setLoading(true);
                const empRes = await fetch(`${import.meta.env.VITE_BASE_URL}/api/employees`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                const empData = await empRes.json();
                setEmployees(Array.isArray(empData) ? empData : []);
                setLoading(false);
            } else {
                const errData = await res.json();
                console.error('Failed to add employee:', errData);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: errData?.detail || 'Failed to add employee.' });
            }
        } catch (err) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to add employee.' });
        }
        setAddLoading(false);
    };
    return (
        <div className="p-4 sm:p-8">
            <div className="bg-white pb-11 dark:bg-slate-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Employee List</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Manage all employees in the organization.</p>
                    </div>
                    <Button
                        label="Add Employee"
                        icon="pi pi-plus"
                        className="p-button-success"
                        onClick={() => setShowAddModal(true)}
                    />
                </div>
                {/* Add Employee Modal */}
                <Dialog
                    header="Add Employee"
                    visible={showAddModal}
                    style={{ width: '32rem' }}
                    onHide={() => setShowAddModal(false)}
                    modal
                    className="dark:bg-slate-800"
                    contentClassName="dark:!bg-slate-800 dark:!text-slate-100"
                    headerClassName="dark:!bg-slate-800 dark:!text-slate-100 dark:!border-slate-600"
                    footer={
                        <div className="dark:!bg-slate-800 dark:!border-slate-600 p-3">
                            <Button 
                                label="Cancel" 
                                icon="pi pi-times" 
                                className="p-button-text dark:!text-slate-300 mr-2" 
                                onClick={() => setShowAddModal(false)} 
                            />
                            <Button 
                                label="Add" 
                                icon="pi pi-check" 
                                className="p-button-success" 
                                loading={addLoading} 
                                onClick={handleAddEmployee} 
                            />
                        </div>
                    }
                >
                    <div className="p-fluid space-y-4 dark:!bg-slate-800 p-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">First Name</label>
                            <InputText 
                                className="w-full !border !border-slate-400 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-slate-100 !rounded-md p-3" 
                                value={addForm.first_name} 
                                onChange={e => handleAddFormChange(e, 'first_name')} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Last Name</label>
                            <InputText 
                                className="w-full !border !border-slate-400 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-slate-100 !rounded-md p-3" 
                                value={addForm.last_name} 
                                onChange={e => handleAddFormChange(e, 'last_name')} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Email</label>
                            <InputText 
                                className="w-full !border !border-slate-400 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-slate-100 !rounded-md p-3" 
                                value={addForm.email} 
                                onChange={e => handleAddFormChange(e, 'email')} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Job Title</label>
                            <InputText 
                                className="w-full !border !border-slate-400 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-slate-100 !rounded-md p-3" 
                                value={addForm.job_title} 
                                onChange={e => handleAddFormChange(e, 'job_title')} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Department</label>
                            <Dropdown
                                value={addForm.department}
                                options={departments}
                                optionLabel="name"
                                placeholder="Select Department"
                                onChange={e => handleAddFormChange(e, 'department')}
                                filter
                                className="w-full !border !border-slate-400 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-slate-100 !rounded-md"
                                panelClassName="dark:!bg-slate-700 dark:!border-slate-500 dark:!text-slate-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Phone Number</label>
                            <InputText 
                                className="w-full !border !border-slate-400 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-slate-100 !rounded-md p-3" 
                                value={addForm.phone_number} 
                                onChange={e => handleAddFormChange(e, 'phone_number')} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Date of Birth</label>
                            <Calendar
                                value={addForm.date_of_birth}
                                onChange={e => handleAddFormChange(e, 'date_of_birth')}
                                dateFormat="yy-mm-dd"
                                showIcon
                                className="w-full !border !border-slate-400 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-slate-100 !rounded-md"
                                panelClassName="dark:!bg-slate-700 dark:!border-slate-500 dark:!text-slate-100"
                            />
                        </div>
                        <div className="flex items-center space-x-3 pt-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
                            <InputSwitch checked={addForm.is_active} onChange={e => handleAddFormChange(e, 'is_active')} />
                            <span className="text-sm text-slate-700 dark:text-slate-200">{addForm.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                </Dialog>

                {/* Employee Table */}
                <EmployeeTable />
            </div>
        </div>
    );
};

export default EmployeesPage;
