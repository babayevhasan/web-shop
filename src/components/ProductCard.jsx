"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { ShoppingCart, Heart } from "lucide-react"
import "../styles/ProductCard.css"

const ProductCard = memo(({ product, isInWishlistPage = false }) => {
  const { addToCart } = useCart()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    setIsInWishlist(wishlist.some((item) => item.id === product.id))
  }, [product.id])

  const handleAddToCart = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()

      setIsAddingToCart(true)

      addToCart(product, 1)

      setTimeout(() => {
        setIsAddingToCart(false)
      }, 500)
    },
    [addToCart, product],
  )

  const toggleWishlist = useCallback(
    (e) => {
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
    },
    [isInWishlist, product],
  )

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price)

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image-container">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="product-image"
            loading="lazy" 
          />
          {!isInWishlistPage && (
            <button
              onClick={toggleWishlist}
              className={`wishlist-icon-button ${isInWishlist ? "active" : ""}`}
              aria-label={isInWishlist ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={16} fill={isInWishlist ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        <div className="product-info">
          <div className="product-category">{product.category}</div>
          <h3 className="product-title">{product.name}</h3>

          <p className="product-description">{product.description}</p>

          <div className="product-footer">
            <span className="product-price">{formattedPrice}</span>
            <button
              onClick={handleAddToCart}
              className={`add-to-cart-button ${isAddingToCart ? "adding" : ""}`}
              aria-label="Add to Basket"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
})

ProductCard.displayName = "ProductCard"

export default ProductCard
