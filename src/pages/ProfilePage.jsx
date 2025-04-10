"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth"
import { User, Mail, Lock, Save, AlertCircle } from "lucide-react"
import "../styles/ProfilePage.css"

export default function ProfilePage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [showEmailField, setShowEmailField] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "")
      setEmail(currentUser.email || "")
    }
  }, [currentUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    if (!currentUser) return

    // Validate password if changing
    if (showPasswordFields && password !== confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match" })
    }

    try {
      setLoading(true)

      // If changing email or password, need to reauthenticate first
      if ((showEmailField && email !== currentUser.email) || (showPasswordFields && password)) {
        if (!currentPassword) {
          setMessage({ type: "error", text: "Current password is required to change email or password" })
          setLoading(false)
          return
        }

        // Reauthenticate
        try {
          const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
          await reauthenticateWithCredential(currentUser, credential)
        } catch (error) {
          setMessage({ type: "error", text: "Current password is incorrect" })
          setLoading(false)
          return
        }
      }

      // Update profile
      if (displayName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName })
      }

      // Update email
      if (showEmailField && email !== currentUser.email) {
        await updateEmail(currentUser, email)
      }

      // Update password
      if (showPasswordFields && password) {
        await updatePassword(currentUser, password)
        setPassword("")
        setConfirmPassword("")
        setCurrentPassword("")
        setShowPasswordFields(false)
      }

      setMessage({ type: "success", text: "Profile updated successfully" })
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: error.message || "Failed to update profile" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">My Profile</h1>

        {message.text && (
          <div className={`profile-message ${message.type}`}>
            <AlertCircle size={18} />
            <span>{message.text}</span>
          </div>
        )}

        <div className="profile-avatar">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL || "/placeholder.svg"} alt="Profile" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">
              <User size={40} />
            </div>
          )}
          <div className="profile-info">
            <h2 className="profile-name">{currentUser?.displayName || "User"}</h2>
            <p className="profile-email">{currentUser?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="displayName" className="form-label">
              Full Name
            </label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="profile-input"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-header">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <button type="button" className="toggle-button" onClick={() => setShowEmailField(!showEmailField)}>
                {showEmailField ? "Cancel" : "Change"}
              </button>
            </div>
            {showEmailField ? (
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="profile-input"
                  placeholder="Enter your email"
                />
              </div>
            ) : (
              <p className="static-field">{currentUser?.email}</p>
            )}
          </div>

          <div className="form-group">
            <div className="form-header">
              <label className="form-label">Password</label>
              <button
                type="button"
                className="toggle-button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
              >
                {showPasswordFields ? "Cancel" : "Change"}
              </button>
            </div>

            {showPasswordFields && (
              <>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="profile-input"
                    placeholder="Current password"
                  />
                </div>

                <div className="input-with-icon mt-3">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="profile-input"
                    placeholder="New password"
                    minLength="6"
                  />
                </div>

                <div className="input-with-icon mt-3">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="profile-input"
                    placeholder="Confirm new password"
                    minLength="6"
                  />
                </div>
              </>
            )}
          </div>

          {(showEmailField || showPasswordFields || displayName !== currentUser?.displayName) && (
            <div className="form-group">
              <button type="submit" className="save-button" disabled={loading}>
                <Save size={18} className="button-icon" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>

        <div className="profile-actions">
          <button onClick={() => navigate("/orders")} className="action-button">
            View My Orders
          </button>

          <button
            onClick={async () => {
              await logout()
              navigate("/")
            }}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

