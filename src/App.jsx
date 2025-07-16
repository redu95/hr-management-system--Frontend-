import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Employees from './pages/EmployeesPage';
import LeaveManagementPage from './pages/LeaveManagementPage';
import Reports from './pages/ReportsPage';
import Settings from './pages/Settings';
import Logout from './pages/Logout';
import AppLayout from './components/layout/AppLayout';
import './App.css';
import RequireAuth from './components/common/RequireAuth';
import DepartmentsPage from './pages/DepartmentsPage';

const queryClient = new QueryClient(); // Initialize QueryClient

function App() {
  const [count, setCount] = useState(0);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/leave" element={<LeaveManagementPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/departments" element={<DepartmentsPage />} />
          </Route>

          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;