"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle } from "lucide-react"
import "../styles/CartPage.css"

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
  const [note, setNote] = useState("")

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity)
  }

  const handleWhatsAppCheckout = () => {
    // WhatsApp mesajı oluştur
    let message = "Merhaba, aşağıdaki ürünleri satın almak istiyorum:\n\n"

    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`
      message += `   Beden: ${item.product.selectedSize || "Belirtilmemiş"}\n`
      message += `   Renk: ${item.product.selectedColor?.name || "Belirtilmemiş"}\n`
      message += `   Adet: ${item.quantity}\n`
      message += `   Fiyat: ${item.product.price ? (item.product.price * item.quantity).toLocaleString("tr-TR", { style: "currency", currency: "TRY" }) : "N/A"}\n\n`
    })

    message += `Toplam Tutar: ${getCartTotal().toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}\n\n`

    if (note.trim()) {
      message += `Not: ${note}\n\n`
    }

    message += "Ödeme ve teslimat detaylarını görüşmek istiyorum."

    // WhatsApp URL'si oluştur
    const whatsappUrl = `https://wa.me/+994773105127?text=${encodeURIComponent(message)}`

    // Yeni sekmede WhatsApp'ı aç
    window.open(whatsappUrl, "_blank")
  }

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <ShoppingBag size={64} className="empty-cart-icon" />
        <h2 className="empty-cart-title">Sepetiniz Boş</h2>
        <p className="empty-cart-message">Henüz sepetinize ürün eklemediniz.</p>
        <Link to="/" className="continue-shopping-btn">
          Alışverişe Devam Et
        </Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Alışveriş Sepetiniz</h1>

      <div className="cart-layout">
        <div className="cart-items-container">
          <div className="cart-table-container">
            <table className="cart-table">
              <thead className="cart-table-header">
                <tr>
                  <th className="cart-header-cell">Ürün</th>
                  <th className="cart-header-cell">Fiyat</th>
                  <th className="cart-header-cell">Adet</th>
                  <th className="cart-header-cell">Toplam</th>
                  <th className="cart-header-cell">İşlemler</th>
                </tr>
              </thead>
              <tbody className="cart-table-body">
                {cartItems.map((item) => (
                  <tr key={item.product.uniqueId || item.product.id} className="cart-item-row">
                    <td className="cart-cell product-cell">
                      <div className="cart-product">
                        <div className="cart-product-image-container">
                          <img
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            className="cart-product-image"
                          />
                        </div>
                        <div className="cart-product-details">
                          <Link to={`/product/${item.product.id}`} className="cart-product-name">
                            {item.product.name}
                          </Link>
                          <div className="cart-product-options">
                            {item.product.selectedSize && (
                              <span className="cart-product-size">Beden: {item.product.selectedSize}</span>
                            )}
                            {item.product.selectedColor && (
                              <div className="cart-product-color">
                                <span>Renk: {item.product.selectedColor.name}</span>
                                <span
                                  className="color-dot"
                                  style={{ backgroundColor: item.product.selectedColor.code }}
                                ></span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="cart-cell price-cell" data-label="Fiyat">
                      {item.product.price
                        ? item.product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })
                        : "N/A"}
                    </td>
                    <td className="cart-cell quantity-cell" data-label="Adet">
                      <div className="cart-quantity-controls">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product.uniqueId || item.product.id, item.quantity - 1)
                          }
                          className="quantity-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product.uniqueId || item.product.id, item.quantity + 1)
                          }
                          className="quantity-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="cart-cell total-cell" data-label="Toplam">
                      {item.product.price
                        ? (item.product.price * item.quantity).toLocaleString("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          })
                        : "N/A"}
                    </td>
                    <td className="cart-cell actions-cell" data-label="İşlemler">
                      <button
                        onClick={() => removeFromCart(item.product.uniqueId || item.product.id)}
                        className="remove-item-btn"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="clear-cart-container">
            <button onClick={clearCart} className="clear-cart-btn">
              <Trash2 size={16} />
              Sepeti Temizle
            </button>
          </div>
        </div>

        <div className="order-summary-container">
          <div className="order-summary">
            <h2 className="summary-title">Sipariş Özeti</h2>

            <div className="summary-row">
              <span className="summary-row-label">Ara Toplam</span>
              <span className="summary-row-value">
                {getCartTotal().toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </span>
            </div>

            <div className="summary-row">
              <span className="summary-row-label">Kargo</span>
              <span className="summary-row-value">Ücretsiz</span>
            </div>

            <div className="summary-total">
              <span className="summary-total-label">Toplam</span>
              <span className="summary-total-value">
                {getCartTotal().toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
              </span>
            </div>

            <div className="checkout-section">
              <div className="form-group">
                <label htmlFor="note" className="form-label">
                  Sipariş Notu (İsteğe Bağlı)
                </label>
                <textarea
                  id="note"
                  placeholder="Siparişinizle ilgili eklemek istediğiniz notlar..."
                  className="form-textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <button onClick={handleWhatsAppCheckout} className="whatsapp-checkout-btn">
                <MessageCircle size={20} />
                WhatsApp ile Sipariş Ver
              </button>

              <p className="checkout-note">
                Siparişinizi WhatsApp üzerinden tamamlamak için yukarıdaki butona tıklayın. Ödeme ve teslimat detayları
                WhatsApp üzerinden görüşülecektir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

