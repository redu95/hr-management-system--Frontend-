import useAuthStore from "../../store/authStore"

const RoleBasedComponent = ({ allowedRoles = [], requiredPermission = null, children, fallback = null }) => {
    const { user, hasPermission } = useAuthStore()

    // Check role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return fallback
    }

    // Check permission-based access
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return fallback
    }

    return children
}

export default RoleBasedComponent
