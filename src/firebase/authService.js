import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth"
import { auth } from "./config"
import { db } from "./config"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"


// Kullanıcı kaydı
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Kullanıcı profil bilgilerini güncelle
    await updateProfile(userCredential.user, { displayName })

    // Admin kontrolü için özel bir alan ekleyelim
    // Sadece belirli e-postalar için admin rolü verilecek
    const isAdmin = email === "hasanadmin2005@gmail.com"

    // Kullanıcı veritabanında admin rolünü saklayalım
    if (userCredential.user) {
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName,
        isAdmin,
        createdAt: serverTimestamp(),
      })
    }

    return userCredential.user
  } catch (error) {
    console.error("Error registering user: ", error)
    throw error
  }
}

// Kullanıcı girişi
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    // Kullanıcının admin rolünü kontrol et
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))
    const userData = userDoc.data()

    // Kullanıcı nesnesine admin bilgisini ekle
    if (userData) {
      userCredential.user.customData = {
        isAdmin: userData.isAdmin || false,
      }
    }

    return userCredential.user
  } catch (error) {
    console.error("Error logging in: ", error)
    throw error
  }
}

// Google ile giriş
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)

    // Google ile giriş yapan kullanıcı için users koleksiyonunda belge oluştur
    // Eğer belge zaten varsa, güncelleme yapmaz
    const userDoc = await getDoc(doc(db, "users", result.user.uid))

    if (!userDoc.exists()) {
      // Kullanıcı belgesi yoksa oluştur
      const isAdmin = result.user.email === "hasanadmin2005@gmail.com"

      await setDoc(doc(db, "users", result.user.uid), {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        isAdmin,
        createdAt: serverTimestamp(),
      })
    }

    return result.user
  } catch (error) {
    console.error("Error signing in with Google: ", error)
    throw error
  }
}

// Çıkış yap
export const logoutUser = async () => {
  try {
    await signOut(auth)
    return true
  } catch (error) {
    console.error("Error signing out: ", error)
    throw error
  }
}

// Kullanıcı durumunu izle
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Kullanıcının admin olup olmadığını kontrol et
export const isUserAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return userData.isAdmin === true
    }
    return false
  } catch (error) {
    console.error("Error checking admin status: ", error)
    return false
  }
}
