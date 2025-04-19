import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin, Shield, Truck, CreditCard } from "lucide-react"
import "../styles/Footer.css"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 className="footer-title">
              LaLa<span style={{ color: "var(--accent)" }}>Shop</span>
            </h3>
            <p className="footer-text">
            Welcome to our online store that offers quality and stylish clothing products. We offer the trendiest pieces at affordable prices.
            </p>
            <div className="social-links">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=+994773105127"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="WhatsApp"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>

          <div className="footer-section">
          </div>

          <div className="footer-section">
            <h3 className="footer-title">My Account</h3>
            <ul className="footer-links">
              <li>
                <Link to="/cart" className="footer-link">
                My basket
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="footer-link">
                My Wish List
                </Link>
              </li>
              <li>
                <Link to="/orders" className="footer-link">
                My Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="footer-link">
                Account
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Communication</h3>
            <ul className="contact-list">
              <li className="contact-item">
                <Phone size={16} className="contact-icon" />
                <span>+994 77 310 51 27</span>
              </li>
              <li className="contact-item">
                <Mail size={16} className="contact-icon" />
                <span>info@shophub.com</span>
              </li>
              <li className="contact-item">
                <MapPin size={16} className="contact-icon" />
                <span>Baku, Azerbaijan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="trust-section">
          <div className="trust-item">
            <Shield size={24} className="trust-icon" />
            <div className="trust-content">
              <h4>Safe Shopping</h4>
              <p>Safe payment options</p>
            </div>
          </div>
          <div className="trust-item">
            <Truck size={24} className="trust-icon" />
            <div className="trust-content">
              <h4>Fast Delivery</h4>
              <p>Will be shipped within 2-4 business days</p>
            </div>
          </div>
          <div className="trust-item">
            <CreditCard size={24} className="trust-icon" />
            <div className="trust-content">
              <h4>Easy Payment</h4>
              <p>Secure payment via WhatsApp</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} LaLaShop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}



