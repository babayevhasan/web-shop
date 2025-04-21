"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useProducts } from "../context/ProductsContext"
import { useCart } from "../context/CartContext"
import { ShoppingCart, ArrowLeft, Plus, Minus, ZoomIn, Check, MessageCircle, Heart } from "lucide-react"
import "../styles/ProductDetailPage.css"

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProductById } = useProducts()
  const { addToCart } = useCart()
  const imageRef = useRef(null)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  // Sizes
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"]

  // Colors
  const availableColors = [
    { name: "Black", code: "#000000" },
    { name: "white", code: "#FFFFFF" },
    { name: "Navy blue", code: "#000080" },
    { name: "Gray", code: "#808080" },
    { name: "Red", code: "#FF0000" },
    { name: "Green", code: "#008000" },
    { name: "Blue", code: "#0000FF" },
    { name: "Beige", code: "#F5F5DC" },
  ]

  // Product images
  const productImages = product
    ? [
      product.image,
      // ...product.images
    ]
    : []


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const productData = await getProductById(id)

        if (productData) {
          setProduct(productData)

          // Check if product is in wishlist
          const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
          setIsInWishlist(wishlist.some((item) => item.id === productData.id))

          // Set default size and color
          setSelectedSize(availableSizes[2]) // M beden varsayılan
          setSelectedColor(availableColors[0]) // İlk renk varsayılan
        } else {
          setError("Product not found")
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, getProductById])

  // Zoom
  const handleMouseMove = (e) => {
    if (!isZoomed || !imageRef.current) return

    const { left, top, width, height } = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomPosition({ x, y })
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-not-found">
        <h2 className="not-found-title">Product Not Found</h2>
        <p className="not-found-message">The requested product could not be found.</p>
        <Link to="/" className="back-button">
         Back to Home
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert("Lütfen beden ve renk seçiniz")
      return
    }

    const productWithOptions = {
      ...product,
      selectedSize,
      selectedColor,
      uniqueId: `${product.id}-${selectedSize}-${selectedColor.name}`, 
    }

    addToCart(productWithOptions, quantity)

    navigate("/cart")
  }

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      alert("Please choose size and color")
      return
    }

    const productWithOptions = {
      ...product,
      selectedSize,
      selectedColor,
      uniqueId: `${product.id}-${selectedSize}-${selectedColor.name}`, 
    }

    addToCart(productWithOptions, quantity)

    // Send WhatsApp message
    const message = `Hello, I would like to buy the following product:
    
Product: ${product.name}
Size: ${selectedSize}
Color: ${selectedColor.name}
Quantity: ${quantity}
Price: ${product.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
Total: ${(product.price * quantity).toLocaleString("en-US", { style: "currency", currency: "USD" })}

Please confirm the order. Thank you.`

    const whatsappUrl = `https://wa.me/+994773105127?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value)
    if (value > 0) {
      setQuantity(value)
    }
  }

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")

    if (isInWishlist) {
      //Remove from wishlist
      const newWishlist = wishlist.filter((item) => item.id !== product.id)
      localStorage.setItem("wishlist", JSON.stringify(newWishlist))
      setIsInWishlist(false)
    } else {
      // Add to wishlist
      const newWishlist = [...wishlist, product]
      localStorage.setItem("wishlist", JSON.stringify(newWishlist))
      setIsInWishlist(true)
    }
  }

  return (
    <div className="product-detail">
      <button onClick={handleGoBack} className="back-link">
        <ArrowLeft size={20} className="back-icon" />
        Back
      </button>

      <div className="product-layout">
        <div className="product-image-section">
          <div
            className={`product-image-container ${isZoomed ? "zoomed" : ""}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsZoomed(false)}
            ref={imageRef}
          >
            <img
              src={productImages[activeImage] || "/placeholder.svg"}
              alt={product.name}
              className="product-detail-image"
              style={
                isZoomed
                  ? {
                    transform: "scale(2)",
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                  : {}
              }
            />
            <button className="zoom-button" onClick={toggleZoom}>
              <ZoomIn size={20} />
            </button>
          </div>

          {/* Ürün küçük görselleri */}
          <div className="product-thumbnails">
            {productImages.map((image, index) => (
              <div
                key={index}
                className={`thumbnail ${activeImage === index ? "active" : ""}`}
                onClick={() => setActiveImage(index)}
              >
                <img src={image || "/placeholder.svg"} alt={`${product.name} - görsel ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="product-info-container">
          <h1 className="product-detail-title">{product.name}</h1>
          <span className="product-category">{product.category}</span>

          <div className="product-detail-price">
            {product.price ? `${product.price.toLocaleString("en-US")}$` : "N/A"}
          </div>

          <div className="product-options">
            <div className="size-options">
              <h3 className="options-title">Size</h3>
              <div className="size-buttons">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`size-button ${selectedSize === size ? "selected" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="color-options">
              <h3 className="options-title">Color</h3>
              <div className="color-buttons">
                {availableColors.map((color) => (
                  <button
                    key={color.name}
                    className={`color-button ${selectedColor?.name === color.name ? "selected" : ""}`}
                    style={{ backgroundColor: color.code }}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                  >
                    {selectedColor?.name === color.name && (
                      <Check size={16} color={color.name === "Beyaz" ? "#000" : "#fff"} />
                    )}
                  </button>
                ))}
              </div>
              {selectedColor && <span className="selected-color-name">{selectedColor.name}</span>}
            </div>
          </div>

          <p className="product-detail-description">{product.description}</p>

          <div className="quantity-selector">
            <label htmlFor="quantity" className="quantity-label">
              Quantity:
            </label>
            <div className="quantity-controls">
              <button onClick={decreaseQuantity} className="quantity-btn" aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span className="quantity-value">{quantity}</span>
              <button onClick={increaseQuantity} className="quantity-btn" aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="product-actions">
            <button onClick={handleAddToCart} className="add-to-cart-btn">
              <ShoppingCart size={20} className="btn-icon" />
              Add to Cart
            </button>

            <button onClick={handleBuyNow} className="buy-now-btn">
              <MessageCircle size={20} className="btn-icon" />
              Buy Now
            </button>
          </div>

          <button onClick={toggleWishlist} className={`wishlist-button ${isInWishlist ? "active" : ""}`}>
            <Heart size={20} className="wishlist-icon" />
            {isInWishlist ? "remove from wishlist" : "add to wishlist"}
          </button>
        </div>
      </div>
    </div>
  )
}
