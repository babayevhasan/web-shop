"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children }) {
  const { currentUser, loading, isAdmin } = useAuth()
  const location = useLocation()

  // Admin sayfası için özel kontrol ekleyelim
  const isAdminRoute = location.pathname === "/admin"

  if (loading) {
    return (
      <div className="loading-container" style={{ padding: "2rem", textAlign: "center" }}>
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    )
  }

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Admin sayfası için admin kontrolü
  if (isAdminRoute && !isAdmin) {
    return (
      <div className="admin-access-denied">
        <h2>Erişim Engellendi</h2>
        <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        <button onClick={() => window.history.back()} className="back-to-home-btn">
          Geri Dön
        </button>
      </div>
    )
  }

  return children
}
