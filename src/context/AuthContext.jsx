"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { registerUser, loginUser, logoutUser, signInWithGoogle, onAuthStateChange } from "../firebase/authService"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/config"

export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user)

      if (user) {
        try {
   
          const userDoc = await getDoc(doc(db, "users", user.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            setIsAdmin(userData.isAdmin === true)
          } else {
            setIsAdmin(false)
          }
        } catch (err) {
          console.error("An error occurred while checking admin status.:", err)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }

      setLoading(false)
    })

    // Cleanup
    return () => unsubscribe()
  }, [])

  const signup = async (email, password, displayName) => {
    try {
      setError(null)
      return await registerUser(email, password, displayName)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const user = await loginUser(email, password)

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setIsAdmin(userData.isAdmin === true)
          } else {
            setIsAdmin(false)
          }
        } catch (err) {
          console.error("An error occurred while checking admin status.:", err)
          setIsAdmin(false)
        }
      }

      return user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const loginWithGoogle = async () => {
    try {
      setError(null)
      const user = await signInWithGoogle()

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setIsAdmin(userData.isAdmin === true)
          } else {
            setIsAdmin(false)
          }
        } catch (err) {
          console.error("An error occurred while checking admin status.:", err)
          setIsAdmin(false)
        }
      }

      return user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }
  const logout = async () => {
    try {
      setError(null)
      await logoutUser()
      setIsAdmin(false)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }
  
  const value = {
    currentUser,
    loading,
    error,
    isAdmin,
    signup,
    login,
    loginWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
