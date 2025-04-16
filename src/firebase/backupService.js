import { collection, getDocs } from "firebase/firestore"
import { db } from "./config"

export const backupFirestoreData = async () => {
  try {
    const collectionsToBackup = ["products", "orders"]
    const backupData = {}

    for (const collectionName of collectionsToBackup) {
      const querySnapshot = await getDocs(collection(db, collectionName))

      backupData[collectionName] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    }

    const jsonData = JSON.stringify(backupData, null, 2)

    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `e-shop-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()

    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)

    return true
  } catch (error) {
    console.error("Yedekleme hatası:", error)
    throw error
  }
}
