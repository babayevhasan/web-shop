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

  useEffect(() => {
    if (products.length === 0) return

    if (searchQuery) {
      setDisplayedProducts(searchProducts(searchQuery))
    } else {
      let filteredProducts = products
      if (activeCategory !== "all") {
        filteredProducts = products.filter((product) => product.category === activeCategory)
      }

      if (priceRange.min || priceRange.max) {
        const min = priceRange.min ? Number.parseFloat(priceRange.min) : null
        const max = priceRange.max ? Number.parseFloat(priceRange.max) : null
        filteredProducts = filterByPriceRange(filteredProducts, min, max)
      }

      filteredProducts = sortProducts(filteredProducts, sortOption)

      setDisplayedProducts(filteredProducts)

      setFeaturedProducts(products.slice(0, 4))
    }
  }, [products, searchQuery, activeCategory, priceRange, sortOption, searchProducts, filterByPriceRange, sortProducts])

  const clearSearch = () => {
    navigate("/")
  }

  const scrollToProducts = () => {
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }
  const applyPriceFilter = () => {
    const params = new URLSearchParams(location.search)
    if (priceRange.min) params.set("min", priceRange.min)
    else params.delete("min")

    if (priceRange.max) params.set("max", priceRange.max)
    else params.delete("max")

    navigate(`${location.pathname}?${params.toString()}`)
  }

  const handleSortChange = (option) => {
    setSortOption(option)

    const params = new URLSearchParams(location.search)
    params.set("sort", option)
    navigate(`${location.pathname}?${params.toString()}`)
  }
  const filterByCategory = (category) => {
    setActiveCategory(category)

    const params = new URLSearchParams(location.search)
    if (category !== "all") params.set("category", category)
    else params.delete("category")

    navigate(`${location.pathname}?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading products...</div>
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
            <h1 className="section-title">"{searchQuery}" search results</h1>
            <button onClick={clearSearch} className="clear-search-btn">
            Clear Search
            </button>
          </div>

          {displayedProducts.length === 0 ? (
            <div className="no-products">
              <p className="no-products-text">No products were found matching your search.</p>
              <button onClick={clearSearch} className="back-to-all-products">
              Back to All Products
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
              <h1 className="hero-title animate-slide-up">Explore the Latest Trends</h1>
              <p className="hero-subtitle animate-slide-up-delay">
              Uncover the most stylish clothing items. Enjoy fast delivery and convenient payment methods.
              </p>
              <button onClick={scrollToProducts} className="btn btn-primary hero-button animate-slide-up-delay-2">
              Shop Now
              </button>
            </div>
          </section>

          <section className="categories-section animate-fade-in">
            <h2 className="section-title">Categories</h2>
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

          <div className="filter-sort-container animate-fade-in">
            <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={18} />
              Filters and Sorting
              {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showFilters && (
              <div className="filters-panel animate-slide-down">
                <div className="filter-section">
                  <h3 className="filter-title">Price Range</h3>
                  <div className="price-range-inputs">
                    <input
                      type="number"
                      placeholder="Min $"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="price-input"
                    />
                    <span className="price-separator">-</span>
                    <input
                      type="number"
                      placeholder="Max $"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="price-input"
                    />
                    <button className="apply-filter-btn" onClick={() => { applyPriceFilter(); setShowFilters(false) }}>
                    Apply
                    </button>
                  </div>
                </div>

                <div className="filter-section">
                  <h3 className="filter-title">Arrangement</h3>
                  <div className="sort-options">
                    <button
                      className={`sort-option ${sortOption === "default" ? "active" : ""}`}
                      onClick={() => { handleSortChange("default"); setShowFilters(false) }}
                    >
                      Default
                    </button>
                    <button
                      className={`sort-option ${sortOption === "price-asc" ? "active" : ""}`}
                      onClick={() => { handleSortChange("price-asc"); setShowFilters(false) }}
                    >
                      Price: Low to High
                    </button>
                    <button
                      className={`sort-option ${sortOption === "price-desc" ? "active" : ""}`}
                      onClick={() => { handleSortChange("price-desc"); setShowFilters(false) }}
                    >
                     Price: High to Low
                    </button>
                  </div>
                </div>

                <div className="filter-section">
                  <h3 className="filter-title">Categories</h3>
                  <div className="category-filters">
                    <button
                      className={`category-filter ${activeCategory === "all" ? "active" : ""}`}
                      onClick={() => { filterByCategory("all"); setShowFilters(false) }}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        className={`category-filter ${activeCategory === category ? "active" : ""}`}
                        onClick={() => { filterByCategory(category); setShowFilters(false) }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showFilters === false && (
              <div className="filter-summary animate-fade-in">
                <div>
                  {activeCategory !== "all" ? `Category: ${activeCategory}` : ""}
                </div>
                <div>{`Showing products with price range ${priceRange.min ? `${priceRange.min}$` : ""} ${priceRange.max ? `- ${priceRange.max}$` : ""}`}</div>
                <div>{`and sorted by ${sortOption === "price-asc" ? "Price: Low to High" : sortOption === "price-desc" ? "Price: High to Low" : "Default"}`}</div>
              </div>
            )}
          </div>

          <section id="featured-products" ref={productsRef} className="featured-section animate-fade-in">
            <h2 className="section-title">
              {activeCategory !== "all" ? `${activeCategory} ` : "All Products"}
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
                <h2 className="newsletter-title">Be Informed About New Collections</h2>
                <p className="newsletter-text">Sign up to be informed about the latest products and special discounts.</p>
                <Link to="/register" className="newsletter-button">
                Become a Member
                </Link>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}


