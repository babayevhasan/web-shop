"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import { useProducts } from "../context/ProductsContext"
import { useAuth } from "../context/AuthContext" 
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react"
import "../styles/HomePage.css"

export default function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth() 
  const {
    products,
    loading,
    error,
    searchProducts,
    categories,
    sortProducts,
    filterByPriceRange,
    sortOption,
    setSortOption,
  } = useProducts()

  const [displayedProducts, setDisplayedProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [activeCategory, setActiveCategory] = useState("all")
  const productsRef = useRef(null)

  const urlParams = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return {
      query: params.get("search") || "",
      category: params.get("category"),
      minPrice: params.get("min"),
      maxPrice: params.get("max"),
      sort: params.get("sort"),
    }
  }, [location.search])

  useEffect(() => {
    setSearchQuery(urlParams.query)

    if (urlParams.category) {
      setActiveCategory(urlParams.category)
    }

    if (urlParams.minPrice || urlParams.maxPrice) {
      setPriceRange({
        min: urlParams.minPrice || "",
        max: urlParams.maxPrice || "",
      })
    }

    if (urlParams.sort) {
      setSortOption(urlParams.sort)
    }
  }, [urlParams])

  // Ürünleri filtrelemek için ayrı bir useEffect
  useEffect(() => {
    if (products.length === 0) return

    if (searchQuery) {
      setDisplayedProducts(searchProducts(searchQuery))
    } else {
      // Kategori filtresini uygula
      let filteredProducts = products
      if (activeCategory !== "all") {
        filteredProducts = products.filter((product) => product.category === activeCategory)
      }

      // Fiyat filtresini uygula
      if (priceRange.min || priceRange.max) {
        const min = priceRange.min ? Number.parseFloat(priceRange.min) : null
        const max = priceRange.max ? Number.parseFloat(priceRange.max) : null
        filteredProducts = filterByPriceRange(filteredProducts, min, max)
      }

      // Sıralama seçeneğini uygula
      filteredProducts = sortProducts(filteredProducts, sortOption)

      setDisplayedProducts(filteredProducts)

      // Öne çıkan ürünleri ayarla (örnek olarak ilk 4 ürün)
      setFeaturedProducts(products.slice(0, 4))
    }
  }, [products, searchQuery, activeCategory, priceRange, sortOption, searchProducts, filterByPriceRange, sortProducts])

  // Bu fonksiyon, arama sonuçlarını temizleyip ana sayfaya dönmek için
  const clearSearch = () => {
    navigate("/")
  }

  // Alışverişe başla butonuna tıklandığında ürünlere scroll yapma
  const scrollToProducts = () => {
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Fiyat filtresini uygula
  const applyPriceFilter = () => {
    // URL'i güncelle
    const params = new URLSearchParams(location.search)
    if (priceRange.min) params.set("min", priceRange.min)
    else params.delete("min")

    if (priceRange.max) params.set("max", priceRange.max)
    else params.delete("max")

    navigate(`${location.pathname}?${params.toString()}`)
  }

  // Sıralama seçeneğini değiştir
  const handleSortChange = (option) => {
    setSortOption(option)

    // URL'i güncelle
    const params = new URLSearchParams(location.search)
    params.set("sort", option)
    navigate(`${location.pathname}?${params.toString()}`)
  }

  // Kategori filtresini uygula
  const filterByCategory = (category) => {
    setActiveCategory(category)

    // URL'i güncelle
    const params = new URLSearchParams(location.search)
    if (category !== "all") params.set("category", category)
    else params.delete("category")

    navigate(`${location.pathname}?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Ürünler yükleniyor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-text">{error}</div>
      </div>
    )
  }
  return (
    <div className="home-page">
      {searchQuery ? (
        <>
          <div className="search-results-header">
            <h1 className="section-title">"{searchQuery}" için arama sonuçları</h1>
            <button onClick={clearSearch} className="clear-search-btn">
              Aramayı Temizle
            </button>
          </div>

          {displayedProducts.length === 0 ? (
            <div className="no-products">
              <p className="no-products-text">Aramanızla eşleşen ürün bulunamadı.</p>
              <button onClick={clearSearch} className="back-to-all-products">
                Tüm Ürünlere Dön
              </button>
            </div>
          ) : (
            <div className="products-grid animate-fade-in">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <section className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title animate-slide-up">Yeni Sezon Koleksiyonu</h1>
              <p className="hero-subtitle animate-slide-up-delay">
                En trend giyim ürünlerini keşfedin. Hızlı kargo ve kolay ödeme seçenekleriyle alışveriş yapın.
              </p>
              <button onClick={scrollToProducts} className="btn btn-primary hero-button animate-slide-up-delay-2">
                Alışverişe Başla
              </button>
            </div>
          </section>

          <section className="categories-section animate-fade-in">
            <h2 className="section-title">Kategoriler</h2>
            <div className="categories-grid">
              {categories.map((category) => {
                const randomProduct = products.find((product) => product.category === category)
                return (
                  <Link key={category} to={`/category/${category}`} className="category-card">
                    {randomProduct && <img src={randomProduct.image} alt={category} className="category-image" />}
                    <div className="category-overlay">
                      <span className="category-name">{category}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Filtreleme ve sıralama bölümü */}
          <div className="filter-sort-container animate-fade-in">
            <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={18} />
              Filtreler ve Sıralama
              {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showFilters && (
              <div className="filters-panel animate-slide-down">
                <div className="filter-section">
                  <h3 className="filter-title">Fiyat Aralığı</h3>
                  <div className="price-range-inputs">
                    <input
                      type="number"
                      placeholder="Min ₺"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="price-input"
                    />
                    <span className="price-separator">-</span>
                    <input
                      type="number"
                      placeholder="Max ₺"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="price-input"
                    />
                    <button className="apply-filter-btn" onClick={applyPriceFilter}>
                      Uygula
                    </button>
                  </div>
                </div>

                <div className="filter-section">
                  <h3 className="filter-title">Sıralama</h3>
                  <div className="sort-options">
                    <button
                      className={`sort-option ${sortOption === "default" ? "active" : ""}`}
                      onClick={() => handleSortChange("default")}
                    >
                      Varsayılan
                    </button>
                    <button
                      className={`sort-option ${sortOption === "price-asc" ? "active" : ""}`}
                      onClick={() => handleSortChange("price-asc")}
                    >
                      Fiyat: Düşükten Yükseğe
                    </button>
                    <button
                      className={`sort-option ${sortOption === "price-desc" ? "active" : ""}`}
                      onClick={() => handleSortChange("price-desc")}
                    >
                      Fiyat: Yüksekten Düşüğe
                    </button>
                    <button
                      className={`sort-option ${sortOption === "newest" ? "active" : ""}`}
                      onClick={() => handleSortChange("newest")}
                    >
                      En Yeniler
                    </button>
                  </div>
                </div>

                <div className="filter-section">
                  <h3 className="filter-title">Kategoriler</h3>
                  <div className="category-filters">
                    <button
                      className={`category-filter ${activeCategory === "all" ? "active" : ""}`}
                      onClick={() => filterByCategory("all")}
                    >
                      Tümü
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        className={`category-filter ${activeCategory === category ? "active" : ""}`}
                        onClick={() => filterByCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <section id="featured-products" ref={productsRef} className="featured-section animate-fade-in">
            <h2 className="section-title">
              {activeCategory !== "all" ? `${activeCategory} Ürünleri` : "Tüm Ürünler"}
            </h2>
            <div className="products-grid">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {!currentUser && (
            <section className="newsletter-section animate-fade-in">
              <div className="newsletter-content">
                <h2 className="newsletter-title">Yeni Koleksiyonlardan Haberdar Olun</h2>
                <p className="newsletter-text">En yeni ürünler ve özel indirimlerden haberdar olmak için üye olun.</p>
                <Link to="/register" className="newsletter-button">
                  Üye Ol
                </Link>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}


