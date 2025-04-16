import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getAnalytics } from "firebase/analytics"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyANpceX4iw58aqWEuSHlciwNUOBmBHAN7A",
  authDomain: "e-shop-app-e5e32.firebaseapp.com",
  projectId: "e-shop-app-e5e32",
  storageBucket: "e-shop-app-e5e32.appspot.com",
  messagingSenderId: "359577936140",
  appId: "1:359577936140:web:1544fe936b5cd1552ae929",
  measurementId: "G-GXVE4NFSPR",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

let analytics = null
try {
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app)
  }
} catch (error) {
  console.error("Analytics başlatılamadı:", error)
}
export { analytics }

export default app

