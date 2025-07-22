"use client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import UnauthorizedPage from "./pages/UnauthorizedPage"
import DashboardPage from "./pages/DashboardPage"
import Employees from "./pages/EmployeesPage"
import LeaveManagementPage from "./pages/LeaveManagementPage"
import Reports from "./pages/ReportsPage"
import Settings from "./pages/Settings"
import Logout from "./pages/Logout"
import AppLayout from "./components/layout/AppLayout"
import RequireAuth from "./components/common/RequireAuth"
import DepartmentsPage from "./pages/DepartmentsPage"
import useAuthStore from "./store/authStore"
import { BeatLoader } from "react-spinners"

const queryClient = new QueryClient()

function App() {
  const { isAuthenticated, user } = useAuthStore()
  const hasHydrated = useAuthStore.persist.hasHydrated()

  console.log("🚀 [APP] App component rendered with auth state:", {
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
  })

  if (!hasHydrated) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <BeatLoader color="#36d7b7" />
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route
              path="/employees"
              element={
                <RequireAuth requiredPermission="canManageEmployees">
                  <Employees />
                </RequireAuth>
              }
            />

            <Route
              path="/departments"
              element={
                <RequireAuth requiredPermission="canManageDepartments">
                  <DepartmentsPage />
                </RequireAuth>
              }
            />

            <Route path="/leave" element={<LeaveManagementPage />} />

            <Route
              path="/reports"
              element={
                <RequireAuth requiredPermission="canViewReports">
                  <Reports />
                </RequireAuth>
              }
            />

            <Route
              path="/register"
              element={
                <RequireAuth requiredPermission="canRegisterUsers">
                  <RegisterPage />
                </RequireAuth>
              }
            />

            <Route
              path="/settings"
              element={
                <RequireAuth requiredPermission="canManageSettings">
                  <Settings />
                </RequireAuth>
              }
            />

            <Route path="/logout" element={<Logout />} />
          </Route>

          <Route path="*" element={<UnauthorizedPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
