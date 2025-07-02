import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Employees from './pages/EmployeesPage';
import LeaveManagementPage from './pages/LeaveManagementPage';
import Reports from './pages/ReportsPage';
import Settings from './pages/Settings';
import Logout from './pages/Logout';
import AppLayout from './components/layout/AppLayout'; 
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<Employees/>} />
          <Route path="/leave" element={<LeaveManagementPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<Logout />} />
        </Route>
        
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App