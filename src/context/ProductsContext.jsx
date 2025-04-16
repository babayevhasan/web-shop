"use client"

import { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react"
import { getProducts, getProductById, getProductsByCategory, seedProducts } from "../firebase/productService"

export const ProductsContext = createContext()

export const useProducts = () => {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error("hata aldIm: ProductsContext.jsx:223 Uncaught Error: useProducts must be used within a ProductsProvider")
  }
  return context
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [sortOption, setSortOption] = useState("default") 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)

        let productsData = await getProducts()

        if (productsData.length === 0) {
          await seedProducts()
          productsData = await getProducts()
        }

        setProducts(productsData)
        setFilteredProducts(productsData)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch products")
        setLoading(false)
        console.error(err)
      }
    }

    fetchProducts()
  }, [])

const categories = useMemo(() => {
  const uniqueCategories = new Set();
  products.forEach(product => {
    if (product.category) {
      uniqueCategories.add(product.category);
    }
  });
  return Array.from(uniqueCategories);
}, [products]);

  const fetchProductById = useCallback(
    async (id) => {
      const localProduct = products.find((product) => product.id === id || Number(product.id) === Number(id))
      if (localProduct) return localProduct

      try {
        const product = await getProductById(id)
        return product
      } catch (error) {
        console.error("Error fetching product by ID:", error)
        return null
      }
    },
    [products],
  )

  const fetchProductsByCategory = useCallback(
    async (category) => {
      if (!category) return products

      try {
        const localProducts = products.filter((product) => product.category === category)

        if (localProducts.length > 0) return localProducts

        const firebaseProducts = await getProductsByCategory(category)
        return Array.isArray(firebaseProducts) && firebaseProducts.length > 0 ? firebaseProducts : products
      } catch (error) {
        console.error("Error fetching products by category:", error)
        return products 
      }
    },
    [products],
  )

  const searchProducts = useCallback(
    (query) => {
      const searchTerm = query.toLowerCase()
      return products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm),
      )
    },
    [products],
  )

  const sortProducts = useCallback((productsToSort, option) => {
    const sortedProducts = [...productsToSort]

    switch (option) {
      case "price-asc":
        sortedProducts.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        sortedProducts.sort((a, b) => b.price - a.price)
        break
      case "newest":
        sortedProducts.sort((a, b) => b.id - a.id)
        break
      default:
        sortedProducts.sort((a, b) => {
          if (a.category === b.category) {
            return a.name.localeCompare(b.name)
          }
          return a.category.localeCompare(b.category)
        })
    }

    return sortedProducts
  }, [])

  const filterByPriceRange = useCallback((productsToFilter, minPrice, maxPrice) => {
    if (minPrice === null && maxPrice === null) return productsToFilter

    return productsToFilter.filter((product) => {
      if (minPrice !== null && maxPrice !== null) {
        return product.price >= minPrice && product.price <= maxPrice
      } else if (minPrice !== null) {
        return product.price >= minPrice
      } else if (maxPrice !== null) {
        return product.price <= maxPrice
      }
      return true
    })
  }, [])

  
  const applyFiltersAndSort = useCallback(
    (categoryProducts, priceRange, sortOpt, category) => {
      const { minPrice, maxPrice } = priceRange || { minPrice: null, maxPrice: null };
  
      let result = filterByPriceRange(categoryProducts, minPrice, maxPrice);
  
      if (category) {
        result = result.filter((product) => product.category === category);
      }
  
      result = sortProducts(result, sortOpt);
  
      return result;
    },
    [filterByPriceRange, sortProducts],
  );

  const contextValue = useMemo(
    () => ({
      products,
      filteredProducts,
      setFilteredProducts,
      loading,
      error,
      categories,
      getProductById: fetchProductById,
      getProductsByCategory: fetchProductsByCategory,
      searchProducts,
      sortOption,
      setSortOption,
      sortProducts,
      filterByPriceRange,
      applyFiltersAndSort,
    }),
    [
      products,
      filteredProducts,
      loading,
      error,
      categories,
      fetchProductById,
      fetchProductsByCategory,
      searchProducts,
      sortOption,
      sortProducts,
      filterByPriceRange,
      applyFiltersAndSort,
    ],
  )

  return <ProductsContext.Provider value={contextValue}>{children}</ProductsContext.Provider>
}


