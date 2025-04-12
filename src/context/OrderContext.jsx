"use client"

import { createContext, useContext } from "react"
import { createOrder, getUserOrders } from "../firebase/orderService"
import { useAuth } from "./AuthContext"

export const OrderContext = createContext()

export const useOrders = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}

export function OrderProvider({ children }) {
  const { currentUser } = useAuth()

  // Sipariş oluştur
  const placeOrder = async (cartItems, totalAmount, shippingDetails) => {
    if (!currentUser) {
      throw new Error("User must be logged in to place an order")
    }

    const orderData = {
      userId: currentUser.uid,
      items: cartItems,
      totalAmount,
      shippingDetails,
      status: "pending",
    }

    try {
      const orderId = await createOrder(orderData)
      return orderId
    } catch (error) {
      throw error
    }
  }

  // Kullanıcının siparişlerini getir
  const getOrders = async () => {
    if (!currentUser) {
      return []
    }

    try {
      const orders = await getUserOrders(currentUser.uid)
      return orders
    } catch (error) {
      throw error
    }
  }

  
  return <OrderContext.Provider value={{ placeOrder, getOrders }}>{children}</OrderContext.Provider>
}

