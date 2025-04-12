"use client"

import { createContext, useState, useEffect, useContext } from "react"

export const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}


export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  // LocalStorage'dan sepet öğelerini yükle
  useEffect(() => {
    const savedCartItems = localStorage.getItem("cartItems")
    if (savedCartItems) {
      try {
        setCartItems(JSON.parse(savedCartItems))
      } catch (error) {
        console.error("Error parsing cart items from localStorage:", error)
        setCartItems([])
      }
    }
  }, [])

  // Sepet öğeleri değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems))
  }, [cartItems])

  // Sepete ürün ekle
  const addToCart = (product, quantity = 1) => {
    if (!product) return

    setCartItems((prevItems) => {
      // Aynı ürün, aynı beden ve aynı renk varsa miktarını artır
      const uniqueId = product.uniqueId || product.id
      const existingItem = prevItems.find((item) => {
        // Eğer uniqueId varsa ona göre kontrol et
        if (product.uniqueId && item.product.uniqueId) {
          return item.product.uniqueId === uniqueId
        }

        // Yoksa ürün ID, beden ve renk kombinasyonuna göre kontrol et
        if (item.product.selectedSize && item.product.selectedColor && product.selectedSize && product.selectedColor) {
          return (
            item.product.id === product.id &&
            item.product.selectedSize === product.selectedSize &&
            item.product.selectedColor.name === product.selectedColor.name
          )
        }

        // Hiçbiri yoksa sadece ürün ID'sine göre kontrol et
        return item.product.id === product.id
      })

      if (existingItem) {
        return prevItems.map((item) => {
          if (
            (product.uniqueId && item.product.uniqueId === product.uniqueId) ||
            (!product.uniqueId &&
              item.product.id === product.id &&
              item.product.selectedSize === product.selectedSize &&
              item.product.selectedColor?.name === product.selectedColor?.name)
          ) {
            return { ...item, quantity: item.quantity + quantity }
          }
          return item
        })
      } else {
        return [...prevItems, { product, quantity }]
      }
    })
  }

  // Sepetten ürün çıkar
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        // uniqueId varsa ona göre, yoksa normal id'ye göre filtrele
        if (item.product.uniqueId) {
          return item.product.uniqueId !== productId
        }
        return item.product.id !== productId
      }),
    )
  }

  // Ürün miktarını güncelle
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) => {
          // uniqueId varsa ona göre, yoksa normal id'ye göre güncelle
          if (
            (item.product.uniqueId && item.product.uniqueId === productId) ||
            (!item.product.uniqueId && item.product.id === productId)
          ) {
            return { ...item, quantity: newQuantity }
          }
          return item
        }),
      )
    }
  }

  // Sepeti temizle
  const clearCart = () => {
    setCartItems([])
  }

  // Sepetteki toplam ürün sayısını hesapla
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  // Sepet toplamını hesapla
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.price || 0
      return total + price * item.quantity
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItemsCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
