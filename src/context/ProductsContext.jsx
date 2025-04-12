// // ProductsContext.jsx'de performans iyileştirmeleri yapıyorum
// "use client"

// import { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react"
// import { getProducts, getProductById, getProductsByCategory, seedProducts } from "../firebase/productService"

// export const ProductsContext = createContext()

// export const useProducts = () => {
//   const context = useContext(ProductsContext)
//   if (!context) {
//     throw new Error("useProducts must be used within a ProductsProvider")
//   }
//   return context
// }

// export function ProductsProvider({ children }) {
//   const [products, setProducts] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [filteredProducts, setFilteredProducts] = useState([])
//   const [sortOption, setSortOption] = useState("default") // default, price-asc, price-desc, newest

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true)

//         // Ürünleri getir
//         let productsData = await getProducts()

//         // Eğer ürün yoksa, örnek ürünleri ekle
//         if (productsData.length === 0) {
//           await seedProducts()
//           productsData = await getProducts()
//         }

//         setProducts(productsData)
//         setFilteredProducts(productsData)
//         setLoading(false)
//       } catch (err) {
//         setError("Failed to fetch products")
//         setLoading(false)
//         console.error(err)
//       }
//     }

//     fetchProducts()
//   }, [])

//   // Tüm kategorileri al - useMemo ile optimize ediyorum
//   const categories = useMemo(() => {
//     // Giyim kategorileri
//     return ["Kadın", "Erkek", "Çocuk", "Aksesuar"]
//   }, [])

//   // ID'ye göre ürün bul - useCallback ile optimize ediyorum
//   const fetchProductById = useCallback(
//     async (id) => {
//       // Önce yerel state'te ara
//       const localProduct = products.find((product) => product.id === id || Number(product.id) === Number(id))
//       if (localProduct) return localProduct

//       // Yoksa Firebase'den getir
//       try {
//         const product = await getProductById(id)
//         return product
//       } catch (error) {
//         console.error("Error fetching product by ID:", error)
//         return null
//       }
//     },
//     [products],
//   )

//   // Kategoriye göre ürünleri filtrele - useCallback ile optimize ediyorum
//   const fetchProductsByCategory = useCallback(
//     async (category) => {
//       if (!category) return products

//       try {
//         // Önce yerel state'te ara
//         const localProducts = products.filter((product) => product.category === category)

//         if (localProducts.length > 0) return localProducts

//         // Yoksa Firebase'den getir
//         const firebaseProducts = await getProductsByCategory(category)
//         return Array.isArray(firebaseProducts) && firebaseProducts.length > 0 ? firebaseProducts : products // Eğer kategori boşsa tüm ürünleri göster
//       } catch (error) {
//         console.error("Error fetching products by category:", error)
//         return products // Hata durumunda tüm ürünleri göster
//       }
//     },
//     [products],
//   )

//   // Ürünleri ara - useCallback ile optimize ediyorum
//   const searchProducts = useCallback(
//     (query) => {
//       const searchTerm = query.toLowerCase()
//       return products.filter(
//         (product) =>
//           product.name.toLowerCase().includes(searchTerm) ||
//           product.description.toLowerCase().includes(searchTerm) ||
//           product.category.toLowerCase().includes(searchTerm),
//       )
//     },
//     [products],
//   )

//   // Ürünleri fiyata göre sırala - useCallback ile optimize ediyorum
//   const sortProducts = useCallback((productsToSort, option) => {
//     const sortedProducts = [...productsToSort]

//     switch (option) {
//       case "price-asc":
//         sortedProducts.sort((a, b) => a.price - b.price)
//         break
//       case "price-desc":
//         sortedProducts.sort((a, b) => b.price - a.price)
//         break
//       case "newest":
//         // Burada normalde tarih bilgisi olurdu, şimdilik ID'ye göre sıralıyoruz
//         sortedProducts.sort((a, b) => b.id - a.id)
//         break
//       default:
//         // Varsayılan sıralama (kategori ve isim)
//         sortedProducts.sort((a, b) => {
//           if (a.category === b.category) {
//             return a.name.localeCompare(b.name)
//           }
//           return a.category.localeCompare(b.category)
//         })
//     }

//     return sortedProducts
//   }, [])

//   // Fiyat aralığına göre filtrele - useCallback ile optimize ediyorum
//   const filterByPriceRange = useCallback((productsToFilter, minPrice, maxPrice) => {
//     if (minPrice === null && maxPrice === null) return productsToFilter

//     return productsToFilter.filter((product) => {
//       if (minPrice !== null && maxPrice !== null) {
//         return product.price >= minPrice && product.price <= maxPrice
//       } else if (minPrice !== null) {
//         return product.price >= minPrice
//       } else if (maxPrice !== null) {
//         return product.price <= maxPrice
//       }
//       return true
//     })
//   }, [])

//   // Filtreleme ve sıralama işlemlerini uygula - useCallback ile optimize ediyorum
//   const applyFiltersAndSort = useCallback(
//     (categoryProducts, priceRange, sortOpt) => {
//       const { minPrice, maxPrice } = priceRange || { minPrice: null, maxPrice: null }

//       // Önce fiyat filtresini uygula
//       let result = filterByPriceRange(categoryProducts, minPrice, maxPrice)

//       // Sonra sıralama seçeneğini uygula
//       result = sortProducts(result, sortOpt)

//       return result
//     },
//     [filterByPriceRange, sortProducts],
//   )

//   // Context değerini memoize ediyorum
//   const contextValue = useMemo(
//     () => ({
//       products,
//       filteredProducts,
//       setFilteredProducts,
//       loading,
//       error,
//       categories,
//       getProductById: fetchProductById,
//       getProductsByCategory: fetchProductsByCategory,
//       searchProducts,
//       sortOption,
//       setSortOption,
//       sortProducts,
//       filterByPriceRange,
//       applyFiltersAndSort,
//     }),
//     [
//       products,
//       filteredProducts,
//       loading,
//       error,
//       categories,
//       fetchProductById,
//       fetchProductsByCategory,
//       searchProducts,
//       sortOption,
//       sortProducts,
//       filterByPriceRange,
//       applyFiltersAndSort,
//     ],
//   )

//   return <ProductsContext.Provider value={contextValue}>{children}</ProductsContext.Provider>
// }




// ProductsContext.jsx'de performans iyileştirmeleri yapıyorum
"use client"

import { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react"
import { getProducts, getProductById, getProductsByCategory, seedProducts } from "../firebase/productService"

export const ProductsContext = createContext()

export const useProducts = () => {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [sortOption, setSortOption] = useState("default") // default, price-asc, price-desc, newest

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)

        // Ürünleri getir
        let productsData = await getProducts()

        // Eğer ürün yoksa, örnek ürünleri ekle
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

  // Tüm kategorileri al - useMemo ile optimize ediyorum
// Kategorileri dinamik olarak al
const categories = useMemo(() => {
  const uniqueCategories = new Set();
  products.forEach(product => {
    if (product.category) {
      uniqueCategories.add(product.category);
    }
  });
  return Array.from(uniqueCategories);
}, [products]);



  // ID'ye göre ürün bul - useCallback ile optimize ediyorum
  const fetchProductById = useCallback(
    async (id) => {
      // Önce yerel state'te ara
      const localProduct = products.find((product) => product.id === id || Number(product.id) === Number(id))
      if (localProduct) return localProduct

      // Yoksa Firebase'den getir
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

  // Kategoriye göre ürünleri filtrele - useCallback ile optimize ediyorum
  const fetchProductsByCategory = useCallback(
    async (category) => {
      if (!category) return products

      try {
        // Önce yerel state'te ara
        const localProducts = products.filter((product) => product.category === category)

        if (localProducts.length > 0) return localProducts

        // Yoksa Firebase'den getir
        const firebaseProducts = await getProductsByCategory(category)
        return Array.isArray(firebaseProducts) && firebaseProducts.length > 0 ? firebaseProducts : products // Eğer kategori boşsa tüm ürünleri göster
      } catch (error) {
        console.error("Error fetching products by category:", error)
        return products // Hata durumunda tüm ürünleri göster
      }
    },
    [products],
  )

  // Ürünleri ara - useCallback ile optimize ediyorum
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

  // Ürünleri fiyata göre sırala - useCallback ile optimize ediyorum
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
        // Burada normalde tarih bilgisi olurdu, şimdilik ID'ye göre sıralıyoruz
        sortedProducts.sort((a, b) => b.id - a.id)
        break
      default:
        // Varsayılan sıralama (kategori ve isim)
        sortedProducts.sort((a, b) => {
          if (a.category === b.category) {
            return a.name.localeCompare(b.name)
          }
          return a.category.localeCompare(b.category)
        })
    }

    return sortedProducts
  }, [])

  // Fiyat aralığına göre filtrele - useCallback ile optimize ediyorum
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
  
      // Önce fiyat filtresini uygula
      let result = filterByPriceRange(categoryProducts, minPrice, maxPrice);
  
      // Kategori filtresini uygula
      if (category) {
        result = result.filter((product) => product.category === category);
      }
  
      // Sonra sıralama seçeneğini uygula
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


