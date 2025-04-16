"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import "../styles/WishlistButton.css"

export default function WishlistButton({ product }) {
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    setIsInWishlist(wishlist.some((item) => item.id === product.id))
  }, [product.id])

  const toggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")

    if (isInWishlist) {
      const newWishlist = wishlist.filter((item) => item.id !== product.id)
      localStorage.setItem("wishlist", JSON.stringify(newWishlist))
      setIsInWishlist(false)
    } else {
      const newWishlist = [...wishlist, product]
      localStorage.setItem("wishlist", JSON.stringify(newWishlist))
      setIsInWishlist(true)
    }
  }

  return (
    <button
      onClick={toggleWishlist}
      className={`wishlist-button ${isInWishlist ? "active" : ""}`}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={20} className="wishlist-icon" />
      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </button>
  )
}

