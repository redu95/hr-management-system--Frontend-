// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { InputSwitch } from 'primereact/inputswitch';
import { TabView, TabPanel } from 'primereact/tabview';

const SettingsPage = () => {
    // State for Profile Settings
    const [name, setName] = useState('Alex Turner');
    const [email, setEmail] = useState('admin@company.com');

    // State for Notification Settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    return (
        <div className="p-4 sm:p-8">
            {/* Page Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                <p className="text-sm text-slate-500 mt-1">Manage your profile, notifications, and company settings.</p>
            </div>

            {/* User's Leave Balance Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                 <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Leave Balance</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-sky-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-sky-700">14</p>
                        <p className="text-sm font-medium text-slate-600">Vacation Days Left</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-amber-700">8</p>
                        <p className="text-sm font-medium text-slate-600">Sick Days Left</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-700">2</p>
                        <p className="text-sm font-medium text-slate-600">Personal Days Left</p>
                    </div>
                 </div>
            </div>

            {/* Tabbed View for Settings */}
            <div className="bg-white p-2 sm:p-4 rounded-xl shadow-lg">
                <TabView>
                    {/* Profile Settings Tab */}
                    <TabPanel header="Profile">
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Your Profile</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-slate-600 block mb-1">Full Name</label>
                                    <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium text-slate-600 block mb-1">Email Address</label>
                                    <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" disabled />
                                </div>
                                <div>
                                    <label htmlFor="password" className="text-sm font-medium text-slate-600 block mb-1">New Password</label>
                                    <Password inputId="password" placeholder="Enter new password" className="w-full" inputClassName="w-full" toggleMask />
                                </div>
                            </div>
                            <Button label="Save Profile" icon="pi pi-check" className="mt-6" />
                        </div>
                    </TabPanel>

                    {/* Notification Settings Tab */}
                    <TabPanel header="Notifications">
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Notification Preferences</h3>
                            <div className="space-y-4 max-w-md">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Email Notifications</p>
                                        <p className="text-sm text-slate-500">Receive updates and alerts via email.</p>
                                    </div>
                                    <InputSwitch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.value)} />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Push Notifications</p>
                                        <p className="text-sm text-slate-500">Get notifications directly on your device.</p>
                                    </div>
                                    <InputSwitch checked={pushNotifications} onChange={(e) => setPushNotifications(e.value)} />
                                </div>
                            </div>
                             <Button label="Save Preferences" icon="pi pi-check" className="mt-6" />
                        </div>
                    </TabPanel>

                    {/* Company Settings Tab (for Admins) */}
                    <TabPanel header="Company">
                         <div className="p-4">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Company Details</h3>
                            <p className="text-slate-600">This section would be visible to Administrators only.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mt-4">
                                <div>
                                    <label htmlFor="companyName" className="text-sm font-medium text-slate-600 block mb-1">Company Name</label>
                                    <InputText id="companyName" value="HRM Inc." className="w-full" />
                                </div>
                                <div>
                                    <label htmlFor="companyWebsite" className="text-sm font-medium text-slate-600 block mb-1">Website</label>
                                    <InputText id="companyWebsite" value="www.hrm-inc.com" className="w-full" />
                                </div>
                            </div>
                            <Button label="Save Company Info" icon="pi pi-check" className="mt-6" />
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    );
};

export default SettingsPage;
