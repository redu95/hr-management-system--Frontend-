// src/pages/LeaveManagementPage.jsx
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Toast } from 'primereact/toast';

// Service functions (replace with your actual implementation)
const fetchLeaveRequests = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/leaves/leave-requests/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        throw new Error('Failed to fetch leave requests');
    }
    const data = await res.json();
    return data.results; // Extract the results array from the response
};

const createLeaveRequest = async (data) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/leaves/leave-requests/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        throw new Error('Failed to create leave request');
    }
    return res.json();
};

const updateLeaveRequest = async ({ id, data }) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/leaves/leave-requests/${id}/`, {
        method: 'PATCH', // Or PUT
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        throw new Error('Failed to update leave request');
    }
    return res.json();
};

const LeaveManagementPage = () => {
    const queryClient = useQueryClient();
    const toast = useRef(null);

    // Fetch leave requests
    const { isLoading, isError, data: leaveRequests, error } = useQuery({
        queryKey: ['leaveRequests'],
        queryFn: fetchLeaveRequests,
    });

    // Mutation for creating leave requests
    const createLeaveRequestMutation = useMutation({
        mutationFn: createLeaveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries(['leaveRequests']);
            setShowRequestModal(false);
            setLeaveRequestForm({
                start_date: null,
                end_date: null,
                leave_type: null,
                reason: ''
            });
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Leave request submitted successfully' });
        },
        onError: (error) => {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
        }
    });

    // Mutation for updating leave requests (approve/deny)
    const updateLeaveRequestMutation = useMutation({
        mutationFn: updateLeaveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries(['leaveRequests']);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Leave request updated successfully' });
        },
        onError: (error) => {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
        }
    });

    // State for the request leave modal
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [leaveRequestForm, setLeaveRequestForm] = useState({
        start_date: null,
        end_date: null,
        leave_type: null,
        reason: ''
    });

    // State for available leave types (replace with API call if needed)
    const [leaveTypes, setLeaveTypes] = useState([
        { label: 'Vacation', value: 'Vacation' },
        { label: 'Sick Leave', value: 'Sick Leave' },
        { label: 'Personal', value: 'Personal' }
    ]);

    // Handle form input changes
    const handleFormChange = (e, field) => {
        setLeaveRequestForm(prev => ({
            ...prev,
            [field]: e?.target ? e.target.value : e
        }));
    };

    // Handle submitting the leave request
    const handleRequestLeave = () => {
        createLeaveRequestMutation.mutate(leaveRequestForm);
    };

    // Handle approving a leave request
    const handleApprove = (leaveRequest) => {
        updateLeaveRequestMutation.mutate({
            id: leaveRequest.id,
            data: { status: 'Approved' } // Backend needs to accept a status field
        });
    };

    // Handle denying a leave request
    const handleDeny = (leaveRequest) => {
        updateLeaveRequestMutation.mutate({
            id: leaveRequest.id,
            data: { status: 'Denied' } // Backend needs to accept a status field
        });
    };

    // Template for the Employee column
    const employeeBodyTemplate = (rowData) => {
        const employee = rowData.employee_details;
        return (
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold ">
                    {employee.first_name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {`${employee.first_name} ${employee.last_name}`}
                </span>
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
        return <Tag value={rowData.leave_type} severity={severityMap[rowData.leave_type]} />;
    };

    // Template for the Actions column
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex items-center space-x-2">
                <Button
                    label="Approve"
                    className="p-button-sm p-button-success p-button-text dark:text-slate-100"
                    onClick={() => handleApprove(rowData)}
                />
                <Button
                    label="Deny"
                    className="p-button-sm p-button-danger p-button-text "
                    onClick={() => handleDeny(rowData)}
                />
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-8">
            <Toast ref={toast} />
            {/* Top section with title and action button */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Leave Management</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Review pending requests and manage leave balances.</p>
                </div>
                <Button
                    label="Request Leave"
                    icon="pi pi-plus"
                    className="p-button-primary"
                    onClick={() => setShowRequestModal(true)}
                />
            </div>

            {/* Pending Requests Table */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg mb-8 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Pending Requests</h3>
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div>Error: {error.message}</div>
                ) : (
                    <DataTable
                        value={Array.isArray(leaveRequests) ? leaveRequests : []} // Ensure value is always an array
                        responsiveLayout="scroll"
                        className="p-datatable-customers dark:bg-slate-800 dark:text-slate-100"
                    >
                        <Column header="Employee" body={employeeBodyTemplate} />
                        <Column header="Leave Type" body={leaveTypeBodyTemplate} />
                        <Column field="start_date" header="Start Date" />
                        <Column field="end_date" header="End Date" />
                        {/*<Column field="days" header="Days" /> Backend needs to return the number of days*/}
                        <Column header="Actions" body={actionBodyTemplate} />
                    </DataTable>
                )}
            </div>

            {/* Request Leave Modal */}
            <Dialog
                header="Request Leave"
                visible={showRequestModal}
                style={{ width: '32rem' }}
                onHide={() => setShowRequestModal(false)}
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
                            onClick={() => setShowRequestModal(false)}
                        />
                        <Button
                            label="Request"
                            icon="pi pi-check"
                            className="p-button-success"
                            loading={createLeaveRequestMutation.isLoading}
                            onClick={handleRequestLeave}
                        />
                    </div>
                }
            >
                <div className="p-fluid space-y-4 dark:!bg-slate-800 p-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Start Date</label>
                        <Calendar
                            value={leaveRequestForm.start_date}
                            onChange={e => handleFormChange(e, 'start_date')}
                            dateFormat="yy-mm-dd"
                            showIcon
                            className="w-full !border !border-slate-400 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-slate-100 !rounded-md"
                            panelClassName="dark:!bg-slate-700 dark:!border-slate-500 dark:!text-slate-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">End Date</label>
                        <Calendar
                            value={leaveRequestForm.end_date}
                            onChange={e => handleFormChange(e, 'end_date')}
                            dateFormat="yy-mm-dd"
                            showIcon
                            className="w-full !border !border-slate-400 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-slate-100 !rounded-md"
                            panelClassName="dark:!bg-slate-700 dark:!border-slate-500 dark:!text-slate-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Leave Type</label>
                        <Dropdown
                            value={leaveRequestForm.leave_type}
                            options={leaveTypes}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Leave Type"
                            onChange={e => handleFormChange(e, 'leave_type')}
                            className="w-full !border !border-slate-400 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-slate-100 !rounded-md"
                            panelClassName="dark:!bg-slate-700 dark:!border-slate-500 dark:!text-slate-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">Reason</label>
                        <InputText
                            className="w-full !border !border-slate-400 dark:!border-slate-500 dark:!bg-slate-700 dark:!text-slate-100 !rounded-md p-3"
                            value={leaveRequestForm.reason}
                            onChange={e => handleFormChange(e, 'reason')}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default LeaveManagementPage;
