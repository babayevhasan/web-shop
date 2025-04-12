import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "./config"

// Bu fonksiyon, belirli bir kullanıcıyı admin yapmak için kullanılır
// Sadece güvenli bir ortamda (örneğin, ilk kurulumda) çalıştırılmalıdır
export const setupAdminUser = async (userId) => {
  try {
    // Kullanıcı belgesini al
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      // Kullanıcı verilerini al ve admin rolünü ekle
      const userData = userSnap.data()

      await setDoc(userRef, {
        ...userData,
        isAdmin: true,
      })

      console.log("Admin rolü başarıyla atandı!")
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

// Bu fonksiyon, belirli bir e-posta ve şifre kombinasyonuna sahip kullanıcıyı admin yapar
// Bu fonksiyon sadece güvenli bir ortamda çalıştırılmalıdır
export const verifyAndSetupAdmin = async (userId, email, password) => {
  try {
    // Sadece belirli bir e-posta ve şifre kombinasyonu için admin rolü ver
    if (email === "hasanadmin2005@gmail.com" && password === "hasanadmin1884") {
      return await setupAdminUser(userId)
    }
    return false
  } catch (error) {
    console.error("Admin doğrulama hatası:", error)
    return false
  }
}

