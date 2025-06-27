import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

// Dummy data for now
const employees = [
    { id: 'EMP-001', name: 'Eva Elfie', title: 'Digital Marketing Lead', department: 'Marketing'},
];

<DataTable value={employees}>
    <Column field="name" header="Name"></Column>
    <Column field="title" header="Job Title"></Column>
    <Column field="department" header="Department"></Column>
</DataTable>