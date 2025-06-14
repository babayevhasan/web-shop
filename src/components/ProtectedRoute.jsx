"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children }) {
  const { currentUser, loading, isAdmin } = useAuth()
  const location = useLocation()

  const isAdminRoute = location.pathname === "/admin"

  if (loading) {
    return (
      <div className="loading-container" style={{ padding: "2rem", textAlign: "center" }}>
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }
  
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isAdminRoute && !isAdmin) {
    return (
      <div className="admin-access-denied">
        <h2>Access denied</h2>
        <p>You do not have authorization to access this page.</p>
        <button onClick={() => window.history.back()} className="back-to-home-btn">
        Go Back
        </button>
      </div>
    )
  }

  return children
}
