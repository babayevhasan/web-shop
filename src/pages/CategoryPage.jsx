"use client"

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
  const [isMobile, setIsMobile] = useState(false)

  // Mobil cihaz kontrolü
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
        // Kategoriyi normalize et
        const normalizedCategory = category.toLowerCase().trim()
        const categoryProducts = await getProductsByCategory(normalizedCategory)
        
        if (Array.isArray(categoryProducts)) {
          setProducts(categoryProducts)

          let filteredProducts = [...categoryProducts]

          // Fiyat filtresi
          if (queryParams.minPrice !== null || queryParams.maxPrice !== null) {
            filteredProducts = filterByPriceRange(
              filteredProducts,
              queryParams.minPrice,
              queryParams.maxPrice
            )
          }

          // Sıralama
          filteredProducts = sortProducts(filteredProducts, queryParams.sort)

          setDisplayedProducts(filteredProducts)
        } else {
          setProducts([])  // Ürün bulunmazsa
          setDisplayedProducts([])  // Yine boş bir dizi
        }

        setError(null)
      } catch (err) {
        console.error("Ürün getirme hatası:", err)
        setError("Ürünler yüklenirken bir hata oluştu")
        setProducts([])  // Hata durumunda boş liste
        setDisplayedProducts([])  // Hata durumunda boş liste
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchCategoryProducts()
    }
  }, [category, queryParams])

  // Mobil için touch event desteği
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const applyPriceFilter = () => {
    // URL'i güncelle
    const params = new URLSearchParams(location.search);
    if (priceRange.min) params.set("min", priceRange.min);
    else params.delete("min");
  
    if (priceRange.max) params.set("max", priceRange.max);
    else params.delete("max");
  
    navigate(`${location.pathname}?${params.toString()}`);



    const min = priceRange.min ? Number.parseFloat(priceRange.min) : null;
    const max = priceRange.max ? Number.parseFloat(priceRange.max) : null;
  
    let filteredProducts = products;
  
    // Fiyat filtresi
    if (min !== null || max !== null) {
      filteredProducts = filterByPriceRange(filteredProducts, min, max);
    }
  
    // Kategori filtresi
    filteredProducts = sortProducts(filteredProducts, sortOption);
  
    setDisplayedProducts(filteredProducts);
  };

  // Sıralama seçeneğini değiştir (mobil optimizasyonlu)
  const handleSortChange = (option) => {
    setSortOption(option)
    const params = new URLSearchParams(location.search)
    params.set("sort", option)

    // Mobilde replace kullanarak daha hızlı geçiş
    navigate(`${location.pathname}?${params.toString()}`, { replace: true })

    const sorted = sortProducts(displayedProducts, option)
    setDisplayedProducts(sorted)
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
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  return (
    <div className={`category-page ${isMobile ? 'mobile-view' : ''}`}>
      <Link to="/" className="back-link animate-fade-in">
        <ArrowLeft size={20} className="back-icon" />
        Tüm Ürünlere Dön
      </Link>

      <h1 className="category-title animate-slide-up">
        {category} ({displayedProducts.length} ürün)
      </h1>

      {/* Mobil için optimize edilmiş filtre butonu */}
      <div className="filter-sort-container animate-fade-in">
        <button 
          className="filter-toggle-btn"
          onClick={toggleFilters}
          onTouchEnd={toggleFilters} // Mobil dokunmatik destek
        >
          <SlidersHorizontal size={18} />
          Filtreler ve Sıralama
          {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showFilters && (
          <div className={`filters-panel animate-slide-down ${isMobile ? 'mobile-filters' : ''}`}>
            <div className="filter-section">
              <h3 className="filter-title">Fiyat Aralığı</h3>
              <div className="price-range-inputs">
                <input
                  type="number"
                  placeholder="Min ₺"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="price-input"
                  inputMode="numeric" // Mobil klavye optimizasyonu
                />
                <span className="price-separator">-</span>
                <input
                  type="number"
                  placeholder="Max ₺"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="price-input"
                  inputMode="numeric"
                />
                <button 
                  className="apply-filter-btn"
                  onClick={applyPriceFilter}
                  onTouchEnd={applyPriceFilter} // Mobil dokunmatik destek
                >
                  Uygula
                </button>
              </div>
            </div>

            <div className="filter-section">
              <h3 className="filter-title">Sıralama</h3>
              <div className="sort-options">
                {["default", "price-asc", "price-desc", "newest"].map((option) => (
                  <button
                    key={option}
                    className={`sort-option ${sortOption === option ? "active" : ""}`}
                    onClick={() => handleSortChange(option)}
                    onTouchEnd={() => handleSortChange(option)} // Mobil dokunmatik destek
                  >
                    {option === "default" && "Varsayılan"}
                    {option === "price-asc" && "Fiyat: Düşükten Yükseğe"}
                    {option === "price-desc" && "Fiyat: Yüksekten Düşüğe"}
                    {option === "newest" && "En Yeniler"}
                  </button>
                ))}
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
        <div className={`products-grid animate-fade-in ${isMobile ? 'mobile-grid' : ''}`}>
          {displayedProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isMobile={isMobile}
            />
          ))}
        </div>
      )}
    </div>
  )
}

