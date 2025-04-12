"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useOrders } from "../context/OrderContext"
import { ShoppingBag, Package, Clock, CheckCircle, AlertCircle } from "lucide-react"
import "../styles/OrdersPage.css"

export default function OrdersPage() {
  const { currentUser } = useAuth()
  const { getOrders } = useOrders()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const userOrders = await getOrders()

        // Sort orders by date (newest first)
        userOrders.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0
          return b.createdAt?.toDate() - a.createdAt?.toDate()
        })

        setOrders(userOrders)
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load orders. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchOrders()
    }
  }, [currentUser, getOrders])

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"

    try {
      const date = timestamp.toDate()
      return new Intl.DateTimeFormat("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "N/A"
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={18} className="status-icon pending" />
      case "processing":
        return <Package size={18} className="status-icon processing" />
      case "completed":
        return <CheckCircle size={18} className="status-icon completed" />
      default:
        return <AlertCircle size={18} className="status-icon" />
    }
  }

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders-error">
        <AlertCircle size={24} />
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="empty-orders">
        <ShoppingBag size={64} className="empty-orders-icon" />
        <h2 className="empty-orders-title">No Orders Yet</h2>
        <p className="empty-orders-message">You haven't placed any orders yet.</p>
        <Link to="/" className="shop-now-button">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <h1 className="orders-title">My Orders</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <span className="order-number">Order #{order.id.slice(-6)}</span>
                <span className="order-date">{formatDate(order.createdAt)}</span>
              </div>
              <div className="order-status">
                {getStatusIcon(order.status)}
                <span className={`status-text ${order.status}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image-container">
                    <img
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      className="item-image"
                    />
                  </div>
                  <div className="item-details">
                    <Link to={`/product/${item.product.id}`} className="item-name">
                      {item.product.name}
                    </Link>
                    <span className="item-quantity">Quantity: {item.quantity}</span>
                    <span className="item-price">
                      {item.product.price
                        ? item.product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })
                        : "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="shipping-info">
                <h3 className="shipping-title">Shipping Details</h3>
                <p className="shipping-address">{order.shippingDetails?.address || "N/A"}</p>
                <p className="shipping-city">{order.shippingDetails?.city || "N/A"}</p>
                <p className="shipping-phone">Phone: {order.shippingDetails?.phone || "N/A"}</p>
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span className="summary-label">Total</span>
                  <span className="summary-value">
                    {order.totalAmount
                      ? order.totalAmount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


