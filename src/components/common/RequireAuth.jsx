import { Navigate, useLocation } from "react-router-dom"
import useAuthStore from "../../store/authStore"

const RequireAuth = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, user, hasPermission, canAccess } = useAuthStore()
  const location = useLocation()

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check route-based access
  if (!canAccess(location.pathname)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default RequireAuth
