import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "./config"

// Koleksiyon referansı
const productsCol = collection(db, "products")

// Tüm ürünleri getir
export const getProducts = async () => {
  try {
    console.log("Ürünler getiriliyor...")
    const snapshot = await getDocs(productsCol)
    // console.log("Firestore yanıt verdi:", snapshot.size, "ürün bulundu")
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting products: ", error)
    throw error
  }
}

// ID'ye göre ürün getir
export const getProductById = async (id) => {
  try {
    // ID string olmalı, number değil
    const docId = String(id)
    const docRef = doc(db, "products", docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      }
    } else {
      // console.log("No such product!")
      return null
    }
  } catch (error) {
    console.error("Error getting product: ", error)
    return null
  }
}

// Kategoriye göre ürünleri getir
export const getProductsByCategory = async (category) => {
  if (!category) return []

  try {
    const q = query(productsCol, where("category", "==", category))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      // console.log("No products found in category:", category)
      return []
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting products by category:", error)
    return []
  }
}

// Görsel yükleme
export const uploadProductImage = async (file, productId) => {
  try {
    // Boş kontrol
    if (!file) return null

    const fileExtension = file.name.split(".").pop()
    const fileName = `products/${productId || "new"}_${Date.now()}.${fileExtension}`
    const storageRef = ref(storage, fileName)

    // CORS ayarları
    const metadata = {
      contentType: file.type,
      customMetadata: {
        "Access-Control-Allow-Origin": "*",
      },
    }

    // Dosyayı yükle
    await uploadBytes(storageRef, file, metadata)

    // Dosya URL'sini al
    const downloadURL = await getDownloadURL(storageRef)
    return { url: downloadURL, path: fileName }
  } catch (error) {
    console.error("Error uploading image: ", error)
    throw error
  }
}

// Görsel silme
export const deleteProductImage = async (imagePath) => {
  try {
    if (!imagePath) return

    const imageRef = ref(storage, imagePath)
    await deleteObject(imageRef)
    return true
  } catch (error) {
    console.error("Error deleting image: ", error)
    // Dosya zaten silinmiş olabilir, hata fırlatma
    return false
  }
}

// Ürün ekle
export const addProduct = async (product, imageFiles = []) => {
  try {
    // Tarih ekle
    const productWithTimestamp = {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Önce Firestore'a ekle
    const docRef = await addDoc(productsCol, productWithTimestamp)

    // Görselleri yükle
    const images = []
    const imagePaths = []

    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file) {
          const imageData = await uploadProductImage(file, docRef.id)
          if (imageData) {
            images.push(imageData.url)
            imagePaths.push(imageData.path)
          }
        }
      }

      // İlk görseli ana görsel olarak ayarla
      if (images.length > 0) {
        await updateDoc(docRef, {
          image: images[0],
          imagePath: imagePaths[0],
          images,
          imagePaths,
        })
      }
    }

    return {
      id: docRef.id,
      ...productWithTimestamp,
      image: images[0] || null,
      imagePath: imagePaths[0] || null,
      images,
      imagePaths,
    }
  } catch (error) {
    console.error("Error adding product: ", error)
    throw error
  }
}

// Ürün güncelle
export const updateProduct = async (productId, productData, imageFiles = []) => {
  try {
    const productRef = doc(db, "products", productId)

    // Mevcut ürünü al
    const docSnap = await getDoc(productRef)
    if (!docSnap.exists()) {
      throw new Error("Product not found")
    }

    const currentProduct = docSnap.data()

    // Mevcut görselleri koru
    const updatedImages = currentProduct.images || []
    const updatedImagePaths = currentProduct.imagePaths || []

    // Yeni görseller varsa yükle
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        if (file) {
          // Yeni görsel yükle
          const imageData = await uploadProductImage(file, productId)

          if (imageData) {
            // Eğer bu indekste zaten bir görsel varsa, eski görseli sil
            if (updatedImagePaths[i]) {
              await deleteProductImage(updatedImagePaths[i])
            }

            // Yeni görseli ekle veya güncelle
            if (i < updatedImages.length) {
              updatedImages[i] = imageData.url
              updatedImagePaths[i] = imageData.path
            } else {
              updatedImages.push(imageData.url)
              updatedImagePaths.push(imageData.path)
            }
          }
        }
      }
    }

    // Ana görseli güncelle (ilk görsel)
    const mainImage = updatedImages.length > 0 ? updatedImages[0] : null
    const mainImagePath = updatedImagePaths.length > 0 ? updatedImagePaths[0] : null

    // Tarih güncelle
    const updates = {
      ...productData,
      image: mainImage,
      imagePath: mainImagePath,
      images: updatedImages,
      imagePaths: updatedImagePaths,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(productRef, updates)

    return {
      id: productId,
      ...currentProduct,
      ...updates,
    }
  } catch (error) {
    console.error("Error updating product: ", error)
    throw error
  }
}

// Ürün sil
export const deleteProduct = async (productId) => {
  try {
    // Ürünü al
    const productRef = doc(db, "products", productId)
    const docSnap = await getDoc(productRef)

    if (!docSnap.exists()) {
      throw new Error("Product not found")
    }

    const product = docSnap.data()

    // Tüm görselleri sil
    if (product.imagePaths && product.imagePaths.length > 0) {
      for (const path of product.imagePaths) {
        await deleteProductImage(path)
      }
    } else if (product.imagePath) {
      // Eski format için geriye dönük uyumluluk
      await deleteProductImage(product.imagePath)
    }

    // Ürünü sil
    await deleteDoc(productRef)
    return true
  } catch (error) {
    console.error("Error deleting product: ", error)
    throw error
  }
}

// Örnek ürünler ekle
export const seedProducts = async () => {
  try {
    const initialProducts = [
      {
        name: "Casual Cotton T-Shirt",
        price: 149.99,
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Comfortable cotton t-shirt with a modern fit. Perfect for everyday wear.",
        category: "Kadın",
        availableSizes: ["S", "M", "L", "XL"],
        availableColors: [
          { name: "Siyah", code: "#000000" },
          { name: "Beyaz", code: "#FFFFFF" },
          { name: "Gri", code: "#808080" },
        ],
      },
      {
        name: "Wireless Bluetooth Headphones",
        price: 599.99,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "High-quality wireless headphones with noise cancellation and long battery life.",
        category: "Electronics",
      },
      {
        name: "Leather Wallet",
        price: 199.99,
        image:
          "https://images.unsplash.com/photo-1517254797898-04edd251bfb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Genuine leather wallet with multiple card slots and a coin pocket.",
        category: "Aksesuar",
        availableColors: [
          { name: "Siyah", code: "#000000" },
          { name: "Kahverengi", code: "#8B4513" },
        ],
      },
      {
        name: "Stainless Steel Water Bottle",
        price: 129.99,
        image:
          "https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Double-walled insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.",
        category: "Kitchen",
        availableColors: [
          { name: "Gümüş", code: "#C0C0C0" },
          { name: "Siyah", code: "#000000" },
          { name: "Mavi", code: "#0000FF" },
        ],
      },
      {
        name: "Running Shoes",
        price: 349.99,
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        description: "Lightweight and comfortable running shoes with excellent support and cushioning.",
        category: "Erkek",
        availableSizes: ["40", "41", "42", "43", "44", "45"],
        availableColors: [
          { name: "Siyah", code: "#000000" },
          { name: "Kırmızı", code: "#FF0000" },
          { name: "Mavi", code: "#0000FF" },
        ],
      },
    ]

    for (const product of initialProducts) {
      await addProduct(product)
    }
    // console.log("Initial products seeded successfully!")
  } catch (error) {
    console.error("Error seeding initial products: ", error)
  }
}
