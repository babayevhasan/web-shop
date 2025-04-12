"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Heart, Trash2 } from "lucide-react"
import ProductCard from "../components/ProductCard"
import "../styles/WishlistPage.css"

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([])

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    setWishlistItems(wishlist)
  }, [])

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter((item) => item.id !== productId)
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
    setWishlistItems(updatedWishlist)
  }

  const clearWishlist = () => {
    localStorage.setItem("wishlist", JSON.stringify([]))
    setWishlistItems([])
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="empty-wishlist">
        <Heart size={64} className="empty-wishlist-icon" />
        <h2 className="empty-wishlist-title">Favorileriniz Boş</h2>
        <p className="empty-wishlist-message">
          Beğendiğiniz ürünleri favorilerinize ekleyerek daha sonra inceleyebilirsiniz.
        </p>
        <Link to="/" className="continue-shopping-btn">
          Alışverişe Devam Et
        </Link>
      </div>
    )
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1 className="wishlist-title">Favorilerim</h1>
        <button onClick={clearWishlist} className="clear-wishlist-btn">
          <Trash2 size={16} className="clear-icon" />
          Favorileri Temizle
        </button>
      </div>

      <div className="wishlist-grid">
        {wishlistItems.map((product) => (
          <div key={product.id} className="wishlist-item">
            <div className="wishlist-heart-button-container">
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="wishlist-heart-button"
                aria-label="Favorilerden kaldır"
              >
                <Heart size={20} fill="currentColor" />
              </button>
            </div>
            <ProductCard product={product} isInWishlistPage={true} />
          </div>
        ))}
      </div>
    </div>
  )
}

