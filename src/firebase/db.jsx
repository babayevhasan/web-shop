import { doc, getDoc } from "firebase/firestore"
import { db } from "./config"

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
