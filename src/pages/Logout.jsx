"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useAuthStore from "../store/authStore"

const Logout = () => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  useEffect(() => {
    // Clear authentication tokens and any other user data
    logout()

    // Redirect to login page after clearing
    navigate("/login", { replace: true })
  }, [logout, navigate])

  return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Logging out...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}

export default Logout
