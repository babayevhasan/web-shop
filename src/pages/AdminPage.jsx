"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getProducts, addProduct, updateProduct, deleteProduct } from "../firebase/productService"
import { Trash2, Plus, Edit, X, ImageIcon, Upload, Save, AlertCircle, Check } from "lucide-react"
import "../styles/AdminPage.css"

export default function AdminPage() {
  const { currentUser, isAdmin } = useAuth()
  const navigate = useNavigate()
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)]

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedImages, setSelectedImages] = useState([null, null, null])
  const [imagePreviews, setImagePreviews] = useState(["", "", ""])
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Beden ve renk seçenekleri
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"]
  const colorOptions = [
    { name: "Siyah", code: "#000000" },
    { name: "Beyaz", code: "#FFFFFF" },
    { name: "Lacivert", code: "#000080" },
    { name: "Gri", code: "#808080" },
    { name: "Kırmızı", code: "#FF0000" },
    { name: "Yeşil", code: "#008000" },
    { name: "Mavi", code: "#0000FF" },
    { name: "Bej", code: "#F5F5DC" },
  ]

  // Yeni ürün için form state'i
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "Kadın", // Varsayılan kategori
    availableSizes: [],
    availableColors: [],
    images: [],
    imagePaths: [],
  })

  // Kategoriler
  const categories = ["Kadın", "Erkek", "Çocuk", "Aksesuar", "Electronics", "Kitchen"]

  // Ürünleri yükle
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        console.log("Admin sayfası: Ürünler yükleniyor...")
        const productsData = await getProducts()
        console.log("Admin sayfası: Ürünler yüklendi:", productsData.length)
        setProducts(productsData)
        setError(null)
      } catch (err) {
        console.error("Admin sayfası: Ürün yükleme hatası:", err)
        setError("Ürünler yüklenirken bir hata oluştu: " + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Admin kontrolü
  useEffect(() => {
    console.log("Admin sayfası: Kullanıcı kontrolü")
    console.log("Kullanıcı:", currentUser?.email)
    console.log("Admin mi:", isAdmin)
  }, [currentUser, isAdmin])

  // Başarı mesajını 3 saniye sonra kaldır
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Görsel seçimi
  const handleImageChange = (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    // Dosya boyutu kontrolü (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Görsel boyutu 2MB'dan küçük olmalıdır")
      return
    }

    // Seçilen görseli güncelle
    const newSelectedImages = [...selectedImages]
    newSelectedImages[index] = file
    setSelectedImages(newSelectedImages)

    // Önizleme oluştur
    const reader = new FileReader()
    reader.onloadend = () => {
      const newImagePreviews = [...imagePreviews]
      newImagePreviews[index] = reader.result
      setImagePreviews(newImagePreviews)
    }
    reader.readAsDataURL(file)

    // Aktif görseli seçilen olarak ayarla
    setActiveImageIndex(index)
  }

  // Form değişikliklerini işle
  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Fiyat alanı için sayısal değer kontrolü
    if (name === "price") {
      const numericValue = value.replace(/[^0-9.]/g, "")
      setNewProduct({ ...newProduct, [name]: numericValue })
    } else {
      setNewProduct({ ...newProduct, [name]: value })
    }
  }

  // Beden seçimi
  const handleSizeToggle = (size) => {
    const currentSizes = [...newProduct.availableSizes]
    if (currentSizes.includes(size)) {
      // Bedeni kaldır
      setNewProduct({
        ...newProduct,
        availableSizes: currentSizes.filter((s) => s !== size),
      })
    } else {
      // Bedeni ekle
      setNewProduct({
        ...newProduct,
        availableSizes: [...currentSizes, size],
      })
    }
  }

  // Renk seçimi
  const handleColorToggle = (color) => {
    const currentColors = [...newProduct.availableColors]
    const colorIndex = currentColors.findIndex((c) => c.name === color.name)

    if (colorIndex !== -1) {
      // Rengi kaldır
      setNewProduct({
        ...newProduct,
        availableColors: currentColors.filter((c) => c.name !== color.name),
      })
    } else {
      // Rengi ekle
      setNewProduct({
        ...newProduct,
        availableColors: [...currentColors, color],
      })
    }
  }

  // Ürün ekle
  const handleAddProduct = async (e) => {
    e.preventDefault()

    if (!newProduct.name || !newProduct.price || !newProduct.description) {
      setError("Lütfen gerekli alanları doldurun")
      return
    }

    if (newProduct.availableSizes.length === 0) {
      setError("En az bir beden seçmelisiniz")
      return
    }

    if (newProduct.availableColors.length === 0) {
      setError("En az bir renk seçmelisiniz")
      return
    }

    if (!selectedImages[0]) {
      setError("En az bir ürün görseli eklemelisiniz")
      return
    }

    try {
      setFormSubmitting(true)
      setError(null)

      // Fiyatı sayıya çevir
      const productData = {
        ...newProduct,
        price: Number.parseFloat(newProduct.price),
      }

      // Görselleri filtrele (null olmayanlar)
      const validImages = selectedImages.filter((img) => img !== null)

      // Firebase'e ekle
      const addedProduct = await addProduct(productData, validImages)

      // Ürünleri güncelle (başa ekle)
      setProducts([addedProduct, ...products])

      // Formu temizle
      setNewProduct({
        name: "",
        price: "",
        description: "",
        category: "Kadın",
        availableSizes: [],
        availableColors: [],
        images: [],
        imagePaths: [],
      })
      setSelectedImages([null, null, null])
      setImagePreviews(["", "", ""])
      setShowAddForm(false)
      setSuccessMessage("Ürün başarıyla eklendi")

      // Dosya input alanlarını temizle
      fileInputRefs.forEach((ref) => {
        if (ref.current) {
          ref.current.value = ""
        }
      })
    } catch (err) {
      setError("Ürün eklenirken bir hata oluştu: " + err.message)
      console.error(err)
    } finally {
      setFormSubmitting(false)
    }
  }

  // Ürün sil
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      try {
        setLoading(true)
        await deleteProduct(productId)
        setProducts(products.filter((product) => product.id !== productId))
        setSuccessMessage("Ürün başarıyla silindi")
      } catch (err) {
        setError("Ürün silinirken bir hata oluştu: " + err.message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Düzenleme modunu aç
  const handleEditProduct = (product) => {
    setEditingProduct(product)

    // Mevcut ürün verilerini forma yükle
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category || "Kadın",
      availableSizes: product.availableSizes || [],
      availableColors: product.availableColors || [],
      images: product.images || [],
      imagePaths: product.imagePaths || [],
    })

    // Mevcut görselleri önizleme olarak ayarla
    const currentImages = product.images || []
    const previews = ["", "", ""]

    currentImages.forEach((img, index) => {
      if (index < 3) {
        previews[index] = img
      }
    })

    setImagePreviews(previews)
    setSelectedImages([null, null, null])
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Düzenlemeyi kaydet
  const handleUpdateProduct = async (e) => {
    e.preventDefault()

    if (!newProduct.name || !newProduct.price || !newProduct.description) {
      setError("Lütfen gerekli alanları doldurun")
      return
    }

    if (newProduct.availableSizes.length === 0) {
      setError("En az bir beden seçmelisiniz")
      return
    }

    if (newProduct.availableColors.length === 0) {
      setError("En az bir renk seçmelisiniz")
      return
    }

    // Eğer hiç görsel yoksa ve yeni görsel de eklenmemişse hata ver
    if (!imagePreviews[0] && !selectedImages[0]) {
      setError("En az bir ürün görseli eklemelisiniz")
      return
    }

    try {
      setFormSubmitting(true)
      setError(null)

      // Fiyatı sayıya çevir
      const productData = {
        ...newProduct,
        price: Number.parseFloat(newProduct.price),
      }

      // Görselleri filtrele (null olmayanlar)
      const validImages = selectedImages.filter((img) => img !== null)

      // Firebase'de güncelle
      const updatedProduct = await updateProduct(editingProduct.id, productData, validImages)

      // Ürünleri güncelle
      setProducts(products.map((product) => (product.id === editingProduct.id ? updatedProduct : product)))

      // Formu temizle
      setNewProduct({
        name: "",
        price: "",
        description: "",
        category: "Kadın",
        availableSizes: [],
        availableColors: [],
        images: [],
        imagePaths: [],
      })
      setSelectedImages([null, null, null])
      setImagePreviews(["", "", ""])
      setShowAddForm(false)
      setEditingProduct(null)
      setSuccessMessage("Ürün başarıyla güncellendi")

      // Dosya input alanlarını temizle
      fileInputRefs.forEach((ref) => {
        if (ref.current) {
          ref.current.value = ""
        }
      })
    } catch (err) {
      setError("Ürün güncellenirken bir hata oluştu: " + err.message)
      console.error(err)
    } finally {
      setFormSubmitting(false)
    }
  }

  // Admin değilse erişim engellendi
  if (!currentUser) {
    return (
      <div className="admin-access-denied">
        <h2>Erişim Engellendi</h2>
        <p>Bu sayfaya erişmek için giriş yapmalısınız.</p>
        <button onClick={() => navigate("/login")} className="back-to-home-btn">
          Giriş Yap
        </button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <h2>Erişim Engellendi</h2>
        <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        <button onClick={() => navigate("/")} className="back-to-home-btn">
          Ana Sayfaya Dön
        </button>
      </div>
    )
  }

  if (loading && products.length === 0) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1 className="admin-title">Ürün Yönetimi</h1>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Ürün Yönetimi</h1>
        <button
          className="add-product-btn"
          onClick={() => {
            setShowAddForm(!showAddForm)
            if (editingProduct) {
              setEditingProduct(null)
              setNewProduct({
                name: "",
                price: "",
                description: "",
                category: "Kadın",
                availableSizes: [],
                availableColors: [],
                images: [],
                imagePaths: [],
              })
              setSelectedImages([null, null, null])
              setImagePreviews(["", "", ""])
            }
          }}
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? "İptal" : "Yeni Ürün Ekle"}
        </button>
      </div>

      {error && (
        <div className="admin-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="admin-success">
          <Save size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {showAddForm && (
        <div className="product-form-container">
          <form className="product-form" onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
            <h2>{editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h2>

            <div className="form-group">
              <label htmlFor="name">Ürün Adı</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
                placeholder="Ürün adını girin"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Fiyat (₺)</label>
              <input
                type="text"
                id="price"
                name="price"
                value={newProduct.price}
                onChange={handleInputChange}
                required
                placeholder="Fiyatı girin (örn: 199.99)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Kategori</label>
              <select id="category" name="category" value={newProduct.category} onChange={handleInputChange} required>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Beden Seçenekleri</label>
              <div className="size-options">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`size-option ${newProduct.availableSizes.includes(size) ? "selected" : ""}`}
                    onClick={() => handleSizeToggle(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Renk Seçenekleri</label>
              <div className="color-options">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    className={`color-option ${
                      newProduct.availableColors.some((c) => c.name === color.name) ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color.code }}
                    onClick={() => handleColorToggle(color)}
                    title={color.name}
                  >
                    {newProduct.availableColors.some((c) => c.name === color.name) && (
                      <Check size={16} color={color.name === "Beyaz" ? "#000" : "#fff"} />
                    )}
                  </button>
                ))}
              </div>
              <div className="selected-colors">
                {newProduct.availableColors.map((color) => (
                  <span key={color.name} className="selected-color-tag">
                    {color.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Açıklama</label>
              <textarea
                id="description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                required
                placeholder="Ürün açıklamasını girin"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Ürün Görselleri (Maksimum 3)</label>

              <div className="image-upload-grid">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="image-upload-item">
                    <div className="image-upload-container">
                      <input
                        type="file"
                        id={`image-${index}`}
                        ref={fileInputRefs[index]}
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, index)}
                        className="image-input"
                      />
                      <label htmlFor={`image-${index}`} className="image-upload-label">
                        <Upload size={20} className="upload-icon" />
                        {selectedImages[index]
                          ? selectedImages[index].name.substring(0, 15) + "..."
                          : imagePreviews[index]
                            ? `Görsel ${index + 1} Değiştir`
                            : `Görsel ${index + 1} Ekle`}
                      </label>
                    </div>

                    {imagePreviews[index] && (
                      <div className={`image-preview ${activeImageIndex === index ? "active" : ""}`}>
                        <img
                          src={imagePreviews[index] || "/placeholder.svg"}
                          alt={`Ürün önizleme ${index + 1}`}
                          onClick={() => setActiveImageIndex(index)}
                        />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => {
                            const newPreviews = [...imagePreviews]
                            newPreviews[index] = ""
                            setImagePreviews(newPreviews)

                            const newSelectedImages = [...selectedImages]
                            newSelectedImages[index] = null
                            setSelectedImages(newSelectedImages)

                            if (fileInputRefs[index].current) {
                              fileInputRefs[index].current.value = ""
                            }

                            // Aktif görseli güncelle
                            if (activeImageIndex === index) {
                              const nextActiveIndex = imagePreviews.findIndex((preview, i) => i !== index && preview)
                              setActiveImageIndex(nextActiveIndex !== -1 ? nextActiveIndex : 0)
                            }
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="image-upload-info">
                İlk görsel ana görsel olarak kullanılacaktır. Her görsel maksimum 2MB olmalıdır.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingProduct(null)
                  setNewProduct({
                    name: "",
                    price: "",
                    description: "",
                    category: "Kadın",
                    availableSizes: [],
                    availableColors: [],
                    images: [],
                    imagePaths: [],
                  })
                  setSelectedImages([null, null, null])
                  setImagePreviews(["", "", ""])
                }}
              >
                İptal
              </button>
              <button type="submit" className="submit-btn" disabled={formSubmitting}>
                {formSubmitting ? <span className="spinner-small"></span> : editingProduct ? "Güncelle" : "Ekle"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-table-container">
        <div className="table-header">
          <h2>Mevcut Ürünler ({products.length})</h2>
        </div>

        {products.length === 0 ? (
          <div className="no-products-message">
            Henüz ürün bulunmuyor. Yeni ürün eklemek için "Yeni Ürün Ekle" butonuna tıklayın.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th className="image-column">Görsel</th>
                  <th className="name-column">Ürün Adı</th>
                  <th className="category-column">Kategori</th>
                  <th className="price-column">Fiyat</th>
                  <th className="options-column">Seçenekler</th>
                  <th className="actions-column">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="product-image-cell">
                      {product.image || (product.images && product.images[0]) ? (
                        <img
                          src={product.image || product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="product-thumbnail"
                        />
                      ) : (
                        <div className="no-image">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category || "Kategori Yok"}</td>
                    <td>
                      {product.price
                        ? product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })
                        : "₺0,00"}
                    </td>
                    <td className="options-cell">
                      <div className="product-options-summary">
                        {product.availableSizes && product.availableSizes.length > 0 ? (
                          <div className="sizes-summary">
                            <span className="option-label">Bedenler:</span>
                            <span className="option-values">{product.availableSizes.join(", ")}</span>
                          </div>
                        ) : (
                          <div className="no-options">Beden bilgisi yok</div>
                        )}

                        {product.availableColors && product.availableColors.length > 0 ? (
                          <div className="colors-summary">
                            <span className="option-label">Renkler:</span>
                            <div className="color-dots">
                              {product.availableColors.map((color) => (
                                <span
                                  key={color.name}
                                  className="color-dot"
                                  style={{ backgroundColor: color.code }}
                                  title={color.name}
                                ></span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="no-options">Renk bilgisi yok</div>
                        )}
                      </div>
                    </td>
                    <td className="actions-cell">
                      <button className="edit-btn" onClick={() => handleEditProduct(product)} title="Düzenle">
                        <Edit size={16} />
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)} title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
