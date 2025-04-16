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


export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    await updateProfile(userCredential.user, { displayName })

    const isAdmin = email === "hasanadmin2005@gmail.com"

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

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))
    const userData = userDoc.data()

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

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)

    const userDoc = await getDoc(doc(db, "users", result.user.uid))

    if (!userDoc.exists()) {
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

// log out
export const logoutUser = async () => {
  try {
    await signOut(auth)
    return true
  } catch (error) {
    console.error("Error signing out: ", error)
    throw error
  }
}

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

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
