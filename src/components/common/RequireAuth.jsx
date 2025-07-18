import { Navigate, useLocation } from "react-router-dom"
import useAuthStore from "../../store/authStore"

const RequireAuth = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, user, hasPermission, canAccess } = useAuthStore()
  const location = useLocation()

  console.log("🛡️ [REQUIRE_AUTH] Checking authentication:", {
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    currentPath: location.pathname,
    requiredPermission,
  })

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    console.log("❌ [REQUIRE_AUTH] User not authenticated, redirecting to login")
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log("❌ [REQUIRE_AUTH] User lacks required permission:", requiredPermission)
    return <Navigate to="/unauthorized" replace />
  }

  // Check route-based access
  if (!canAccess(location.pathname)) {
    console.log("❌ [REQUIRE_AUTH] User cannot access route:", location.pathname)
    return <Navigate to="/unauthorized" replace />
  }

  console.log("✅ [REQUIRE_AUTH] Access granted")
  return children
}

export default RequireAuth
