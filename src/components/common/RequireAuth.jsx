import { Navigate, useLocation } from "react-router-dom"
import useAuthStore from "../../store/authStore"
import { useEffect } from "react"
import ApiService from "../../services/apiService"

const RequireAuth = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, user, hasPermission, canAccess } = useAuthStore()
  const location = useLocation()

  // Fetch current user info from backend for debugging/logging
  useEffect(() => {
    ApiService.fetchCurrentUser()
  }, [])

  console.log("🛡️ [REQUIRE_AUTH] Checking authentication:", {
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    userName: user?.username,
    currentPath: location.pathname,
    requiredPermission,
  })

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    console.log("❌ [REQUIRE_AUTH] User not authenticated, redirecting to login")
    // Mark that we want to force logout when landing on login page
    return <Navigate to="/login" state={{ from: location, forceLogout: true }} replace />
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
  console.log("🛡️ [REQUIRE_AUTH] Checking authentication:", {
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    userName: user?.username,
    userEmail: user?.email,
    currentPath: location.pathname,
    requiredPermission,
  })


  return children
}

export default RequireAuth
