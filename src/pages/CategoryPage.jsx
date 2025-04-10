"use client"

// CategoryPage.jsx içinde performans iyileştirmeleri ve hata düzeltmeleri yapıyorum
import { useState, useEffect, useMemo } from "react"
import { useParams, Link, useLocation, useNavigate } from "react-router-dom"
import { useProducts } from "../context/ProductsContext"
import ProductCard from "../components/ProductCard"
import { ArrowLeft, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react"
import "../styles/CategoryPage.css"

export default function CategoryPage() {
  const { category } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    getProductsByCategory,
    loading: contextLoading,
    sortProducts,
    filterByPriceRange,
    sortOption,
    setSortOption,
  } = useProducts()

  const [products, setProducts] = useState([])
  const [displayedProducts, setDisplayedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })

  // URL'den parametreleri al
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return {
      minPrice: params.get("min") ? Number.parseFloat(params.get("min")) : null,
      maxPrice: params.get("max") ? Number.parseFloat(params.get("max")) : null,
      sort: params.get("sort") || "default",
    }
  }, [location.search])

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true)
        const categoryProducts = await getProductsByCategory(category)

        if (Array.isArray(categoryProducts)) {
          setProducts(categoryProducts)

          // Fiyat aralığını state'e ayarla
          setPriceRange({
            min: queryParams.minPrice !== null ? queryParams.minPrice.toString() : "",
            max: queryParams.maxPrice !== null ? queryParams.maxPrice.toString() : "",
          })

          // Sıralama seçeneğini ayarla
          setSortOption(queryParams.sort)

          // Filtreleri uygula
          let filteredProducts = categoryProducts

          // Fiyat filtresi
          if (queryParams.minPrice !== null || queryParams.maxPrice !== null) {
            filteredProducts = filterByPriceRange(filteredProducts, queryParams.minPrice, queryParams.maxPrice)
          }

          // Sıralama
          filteredProducts = sortProducts(filteredProducts, queryParams.sort)

          setDisplayedProducts(filteredProducts)
        } else {
          setProducts([])
          setDisplayedProducts([])
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching category products:", err)
        setError("Failed to load products for this category")
        setProducts([])
        setDisplayedProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchCategoryProducts()
    }
  }, [category, getProductsByCategory, queryParams, filterByPriceRange, sortProducts, setSortOption])

  // Fiyat filtresini uygula
  const applyPriceFilter = () => {
    // URL'i güncelle
    const params = new URLSearchParams(location.search)
    if (priceRange.min) params.set("min", priceRange.min)
    else params.delete("min")

    if (priceRange.max) params.set("max", priceRange.max)
    else params.delete("max")

    navigate(`${location.pathname}?${params.toString()}`)

    // Filtreleri uygula
    const min = priceRange.min ? Number.parseFloat(priceRange.min) : null
    const max = priceRange.max ? Number.parseFloat(priceRange.max) : null

    let filteredProducts = products

    // Fiyat filtresi
    if (min !== null || max !== null) {
      filteredProducts = filterByPriceRange(filteredProducts, min, max)
    }

    // Sıralama
    filteredProducts = sortProducts(filteredProducts, sortOption)

    setDisplayedProducts(filteredProducts)
  }

  // Sıralama seçeneğini değiştir
  const handleSortChange = (option) => {
    setSortOption(option)

    // URL'i güncelle
    const params = new URLSearchParams(location.search)
    params.set("sort", option)
    navigate(`${location.pathname}?${params.toString()}`)

    // Sıralamayı uygula
    setDisplayedProducts(sortProducts(displayedProducts, option))
  }

  if (loading || contextLoading) {
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
    <div className="category-page">
      <Link to="/" className="back-link animate-fade-in">
        <ArrowLeft size={20} className="back-icon" />
        Tüm Ürünlere Dön
      </Link>

      <h1 className="category-title animate-slide-up">
        {category} ({displayedProducts.length} {displayedProducts.length === 1 ? "ürün" : "ürün"})
      </h1>

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
          </div>
        )}
      </div>

      {displayedProducts.length === 0 ? (
        <div className="no-products animate-fade-in">
          <p className="no-products-text">Bu kategoride ürün bulunamadı.</p>
        </div>
      ) : (
        <div className="products-grid animate-fade-in">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
