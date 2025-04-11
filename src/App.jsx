import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ProductsProvider } from "./context/ProductsContext"
import { CartProvider } from "./context/CartContext"
import { OrderProvider } from "./context/OrderContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import HomePage from "./pages/HomePage"
import ProductDetailPage from "./pages/ProductDetailPage"
import CartPage from "./pages/CartPage"
import CategoryPage from "./pages/CategoryPage"
import WishlistPage from "./pages/WishlistPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ProfilePage from "./pages/ProfilePage"
import OrdersPage from "./pages/OrdersPage"
import AdminPage from "./pages/AdminPage" // Admin sayfasını ekledik
import ProtectedRoute from "./components/ProtectedRoute"
import "./styles/App.css"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <OrderProvider>
              <div className="app">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/category/:category" element={<CategoryPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Admin rotasını düzeltelim */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <AdminPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            </OrderProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
export default App




// category
// "Kitchen"
// (string)


// description
// "Programmable coffee maker with built-in grinder and thermal carafe."
// (string)


// image
// "https://images.unsplash.com/photo-1570087935869-a8041cc3f9ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
// (string)


// name
// "Coffee Maker"
// (string)


// price
// 599.99
// (number)


// rating
// 4.7
// (number)


// reviews
// 183
