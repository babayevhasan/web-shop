import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "./config"
export const setupAdminUser = async (userId) => {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()

      await setDoc(userRef, {
        ...userData,
        isAdmin: true,
      })

      console.log("Admin ayarlandı!")
      return true
    } else {
      console.error("Kullanıcı bulunamadı!")
      return false
    }
  } catch (error) {
    console.error("Admin ayarlama hatası:", error)
    return false
  }
}

export const verifyAndSetupAdmin = async (userId, email, password) => {
  try {
    if (email === "hasanadmin2005@gmail.com" && password === "hasanadmin1884") {
      return await setupAdminUser(userId)
    }
    return false
  } catch (error) {
    console.error("Admin doğrulama hatası:", error)
    return false
  }
}

