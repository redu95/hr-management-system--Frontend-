import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import NavigationLinks from './NavigationLinks';
import guestHomeLogo from '../../assets/guesthome.svg'; // Import the SVG


const MobileSidebar = ({ visible, onHide }) => {
    const CustomHeader = (
        <div className="p-5 text-center">
            <img src={guestHomeLogo} alt="Guest Home Logo" className="w-16 h-16 mx-auto mb-2" />
            <span className="text-base font-semibold text-slate-500 mt-2 inline-block">HRMS</span>
        </div>
    );

    return (
        <Sidebar
            visible={visible}
            onHide={onHide}
            header={CustomHeader}
            className="w-full sm:w-80" // Use full width on small screens
        >
            <div className="flex flex-col h-full">
                <NavigationLinks onLinkClick={onHide} />
            </div>
        </Sidebar>
    );
};

export default MobileSidebar;
