import React, { useState, useRef } from 'react';
import {
    useDepartments,
    useCreateDepartment,
    useUpdateDepartment,
    useDeleteDepartment,
} from '../services/departmentService';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

const DepartmentsPage = () => {
    const { data: departmentsData, isLoading, isError } = useDepartments();
    const createDepartmentMutation = useCreateDepartment();
    const updateDepartmentMutation = useUpdateDepartment();
    const deleteDepartmentMutation = useDeleteDepartment();
    const departments = departmentsData?.results || [];

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', code: '', description: '' });
    const [editingDepartment, setEditingDepartment] = useState(null);
    const toast = useRef(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateOrUpdate = () => {
        if (editingDepartment) {
            updateDepartmentMutation.mutate(
                { id: editingDepartment.id, ...form },
                {
                    onSuccess: () => {
                        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Department updated successfully' });
                        setShowModal(false);
                        setForm({ name: '', code: '', description: '' });
                        setEditingDepartment(null);
                    },
                    onError: (error) => {
                        toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
                    },
                }
            );
        } else {
            createDepartmentMutation.mutate(
                form,
                {
                    onSuccess: () => {
                        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Department created successfully' });
                        setShowModal(false);
                        setForm({ name: '', code: '', description: '' });
                    },
                    onError: (error) => {
                        toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
                    },
                }
            );
        }
    };

    const handleEdit = (department) => {
        setEditingDepartment(department);
        setForm(department);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        deleteDepartmentMutation.mutate(
            id,
            {
                onSuccess: () => {
                    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Department deleted successfully' });
                },
                onError: (error) => {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
                },
            }
        );
    };

    const actionBodyTemplate = (rowData) => (
        <div className="flex items-center space-x-2">
            <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" onClick={() => handleEdit(rowData)} />
            <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => handleDelete(rowData.id)} />
        </div>
    );

    return (
        <div className="p-4 sm:p-8">
            <Toast ref={toast} />
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Departments</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Manage departments in the organization.</p>
                    </div>
                    <Button
                        label="Add Department"
                        icon="pi pi-plus"
                        className="p-button-success"
                        onClick={() => {
                            setEditingDepartment(null);
                            setForm({ name: '', code: '', description: '' });
                            setShowModal(true);
                        }}
                    />
                </div>

                {/* Department Table */}
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div>Error loading departments</div>
                ) : (
                    <DataTable value={departments} responsiveLayout="scroll" className="p-datatable-customers">
                        <Column field="name" header="Name" />
                        <Column field="code" header="Code" />
                        <Column field="description" header="Description" />
                        <Column header="Actions" body={actionBodyTemplate} />
                    </DataTable>
                )}

                {/* Add/Edit Department Modal */}
                <Dialog
                    header={editingDepartment ? 'Edit Department' : 'Add Department'}
                    visible={showModal}
                    style={{ width: '32rem' }}
                    onHide={() => setShowModal(false)}
                    modal
                    className="dark-dialog"
                    footer={
                        <>
                            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setShowModal(false)} />
                            <Button label="Save" icon="pi pi-check" onClick={handleCreateOrUpdate} />
                        </>
                    }
                >
                    <div className="p-fluid">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                            <InputText
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                className="w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="code" className="block text-sm font-medium mb-2">Code</label>
                            <InputText
                                id="code"
                                name="code"
                                value={form.code}
                                onChange={handleFormChange}
                                className="w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
                            <InputText
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleFormChange}
                                className="w-full"
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default DepartmentsPage;
