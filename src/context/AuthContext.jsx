"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { registerUser, loginUser, logoutUser, signInWithGoogle, onAuthStateChange } from "../firebase/authService"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/config"

// Context oluştur
export const AuthContext = createContext()

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


// Provider bileşeni
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Kullanıcı durumunu izle
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user)

      // Kullanıcı varsa admin durumunu kontrol et
      if (user) {
        try {
          console.log("Admin durumu kontrol ediliyor...", user.uid)
          // Doğrudan Firestore'dan kullanıcı belgesini kontrol edelim
          const userDoc = await getDoc(doc(db, "users", user.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            console.log("Kullanıcı verisi:", userData)
            setIsAdmin(userData.isAdmin === true)
            console.log("Admin durumu:", userData.isAdmin === true)
          } else {
            console.log("Kullanıcı belgesi bulunamadı")
            setIsAdmin(false)
          }
        } catch (err) {
          console.error("Admin durumu kontrol edilirken hata oluştu:", err)
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

  // Kayıt ol
  const signup = async (email, password, displayName) => {
    try {
      setError(null)
      return await registerUser(email, password, displayName)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Giriş yap
  const login = async (email, password) => {
    try {
      setError(null)
      const user = await loginUser(email, password)

      // Admin durumunu güncelle
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
          console.error("Admin durumu kontrol edilirken hata oluştu:", err)
          setIsAdmin(false)
        }
      }

      return user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Google ile giriş
  const loginWithGoogle = async () => {
    try {
      setError(null)
      const user = await signInWithGoogle()

      // Admin durumunu güncelle
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
          console.error("Admin durumu kontrol edilirken hata oluştu:", err)
          setIsAdmin(false)
        }
      }

      return user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Çıkış yap
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

  // Context değerleri
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
