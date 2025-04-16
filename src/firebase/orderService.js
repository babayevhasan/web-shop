import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore"
import { db } from "./config"

const ordersCol = collection(db, "orders")

export const createOrder = async (orderData) => {
  try {
    const orderWithTimestamp = {
      ...orderData,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(ordersCol, orderWithTimestamp)
    return docRef.id
  } catch (error) {
    console.error("Error creating order: ", error)
    throw error
  }
}
export const getUserOrders = async (userId) => {
  try {
    const q = query(ordersCol, where("userId", "==", userId))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting user orders: ", error)
    return []
  }
}

