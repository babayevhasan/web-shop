"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useProducts } from "../context/ProductsContext"
import { useAuth } from "../context/AuthContext"
import { Search, ShoppingCart, Heart, Menu, X, User, LogOut } from "lucide-react"
import "../styles/Navbar.css"

export default function Navbar() {
  const { getCartItemsCount } = useCart()
  const { categories } = useProducts()
  const { currentUser, logout, } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const categoryRef = useRef(null)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const query = params.get("search")
    if (query) {
      setSearchQuery(query)
    } else {
      setSearchQuery("")
    }
  }, [location.search])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`, { replace: true })
      setIsMenuOpen(false)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleCategories = () => {
    setIsCategoryOpen(!isCategoryOpen);
    setIsMenuOpen(true);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }
  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [categoryRef, profileRef])

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="logo">
              LaLa<span className="logo-accent">Shop</span>
            </Link>
          </div>

          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search for products..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-button">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Desktop Menu */}
          <div className="navbar-menu desktop-menu">

            <div className="dropdown" ref={categoryRef}>
              <button className="dropdown-button" onClick={toggleCategories}>
                Categories
              </button>
              <div className={`dropdown-content ${isCategoryOpen ? "show" : ""}`}>
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={`/category/${category}`}
                    className="dropdown-item"
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            <div className="nav-actions">
              <Link to="/wishlist" className="nav-icon-link">
                <Heart size={20} />
              </Link>

              <Link to="/cart" className="nav-icon-link cart-link">
                <ShoppingCart size={20} />
                {getCartItemsCount() > 0 && <span className="cart-badge">{getCartItemsCount()}</span>}
              </Link>

              {currentUser ? (
                <div className="dropdown" ref={profileRef}>
                  <button className="profile-button" onClick={toggleProfile}>
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL || "/placeholder.svg"} alt="Profile" className="profile-image" />
                    ) : (
                      <User size={20} />
                    )}
                  </button>
                  <div className={`dropdown-content profile-dropdown ${isProfileOpen ? "show" : ""}`}>
                    <div className="dropdown-user-info">
                      <span className="dropdown-username">{currentUser.displayName || currentUser.email}</span>
                      <span className="dropdown-email">{currentUser.email}</span>
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      Profile
                    </Link>

                    <Link to="/orders" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      My Orders
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      <LogOut size={16} className="dropdown-icon" />
                      Log Out
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">
                    Sign Up
                  </Link>
                  <Link to="/login" className="btn btn-outline">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="mobile-menu-controls">
            <Link to="/wishlist" className="mobile-icon-link">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="mobile-icon-link cart-link">
              <ShoppingCart size={20} />
              {getCartItemsCount() > 0 && <span className="cart-badge">{getCartItemsCount()}</span>}
            </Link>
            <button onClick={toggleMenu} className="menu-toggle">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">

            <form onSubmit={handleSearch} className="mobile-search-form">
              <input
                type="text"
                placeholder="Search for products..."
                className="mobile-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="mobile-search-button">
                <Search size={20} />
              </button>
            </form>

            <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Home Page
            </Link>

            {currentUser ? (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL || "/placeholder.svg"}
                      alt="Profile"
                      className="mobile-profile-image"
                    />
                  ) : (
                    <div className="mobile-profile-placeholder">
                      <User size={24} />
                    </div>
                  )}
                  <div className="mobile-user-details">
                    <span className="mobile-username">{currentUser.displayName || "User"}</span>
                    <span className="mobile-email">{currentUser.email}</span>
                  </div>
                </div>
                <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
                <Link to="/orders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  My Orders
                </Link>
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <LogOut size={18} className="mobile-logout-icon" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/register" className="btn btn-primary mobile-auth-btn" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
                <Link to="/login" className="btn btn-outline mobile-auth-btn" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

