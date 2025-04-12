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
              Shop<span style={{ color: "var(--accent)" }}>Hub</span>
            </h3>
            <p className="footer-text">
              Kaliteli ve şık giyim ürünleri sunan online mağazamıza hoş geldiniz. En trend parçaları uygun fiyatlarla
              sizlere sunuyoruz.
            </p>
            <div className="social-links">
              <a
              
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
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
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Youtube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Kategoriler</h3>
            <ul className="footer-links">
              <li>
                <Link to="/category/Kadın" className="footer-link">
                  Kadın Giyim
                </Link>
              </li>
              <li>
                <Link to="/category/Erkek" className="footer-link">
                  Erkek Giyim
                </Link>
              </li>
              <li>
                <Link to="/category/Çocuk" className="footer-link">
                  Çocuk Giyim
                </Link>
              </li>
              <li>
                <Link to="/category/Aksesuar" className="footer-link">
                  Aksesuarlar
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Hesabım</h3>
            <ul className="footer-links">
              <li>
                <Link to="/cart" className="footer-link">
                  Sepetim
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="footer-link">
                  İstek Listem
                </Link>
              </li>
              <li>
                <Link to="/profile" className="footer-link">
                  Hesabım
                </Link>
              </li>
              <li>
                <Link to="/orders" className="footer-link">
                  Siparişlerim
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">İletişim</h3>
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
                <span>Bakü, Azerbaycan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="trust-section">
          <div className="trust-item">
            <Shield size={24} className="trust-icon" />
            <div className="trust-content">
              <h4>Güvenli Alışveriş</h4>
              <p>Güvenli ödeme seçenekleri</p>
            </div>
          </div>
          <div className="trust-item">
            <Truck size={24} className="trust-icon" />
            <div className="trust-content">
              <h4>Hızlı Teslimat</h4>
              <p>2-4 iş günü içinde kargoya verilir</p>
            </div>
          </div>
          <div className="trust-item">
            <CreditCard size={24} className="trust-icon" />
            <div className="trust-content">
              <h4>Kolay Ödeme</h4>
              <p>WhatsApp üzerinden güvenli ödeme</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} ShopHub. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}

