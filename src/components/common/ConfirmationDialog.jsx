import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const ConfirmationDialog = ({ visible, onHide, onConfirm, message }) => {
    const footerContent = (
        <div>
            <Button label="No" icon="pi pi-times" onClick={onHide} className="p-button-text" />
            <Button label="Yes" icon="pi pi-check" onClick={onConfirm} autoFocus />
        </div>
    );

    return (
        <Dialog 
            header="Confirmation" 
            visible={visible} 
            style={{ width: '50vw' }} 
            onHide={onHide} 
            footer={footerContent}
            maximizable
        >
            <p>{message}</p>
        </Dialog>
    );
};

export default ConfirmationDialog;
