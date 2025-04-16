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

const productsCol = collection(db, "products")

export const getProducts = async () => {
  try {
    const snapshot = await getDocs(productsCol)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting products: ", error)
    throw error
  }
}
export const getProductById = async (id) => {
  try {
    const docId = String(id)
    const docRef = doc(db, "products", docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting product: ", error)
    return null
  }
}
export const getProductsByCategory = async (category) => {
  if (!category) return [];

  try {
    const allProducts = await getDocs(productsCol);
    
    const filtered = allProducts.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(product => 
        product.category && 
        product.category.toLowerCase() === category.toLowerCase()
      );

    return filtered;
  } catch (error) {
    console.error("Error getting products by category:", error);
    return [];
  }
}
export const uploadProductImage = async (file, productId) => {
  try {
    if (!file) return null

    const fileExtension = file.name.split(".").pop()
    const fileName = `products/${productId || "new"}_${Date.now()}.${fileExtension}`
    const storageRef = ref(storage, fileName)

    const metadata = {
      contentType: file.type,
      customMetadata: {
        "Access-Control-Allow-Origin": "*",
      },
    }

    await uploadBytes(storageRef, file, metadata)

    const downloadURL = await getDownloadURL(storageRef)
    return { url: downloadURL, path: fileName }
  } catch (error) {
    console.error("Error uploading image: ", error)
    throw error
  }
}
export const deleteProductImage = async (imagePath) => {
  try {
    if (!imagePath) return

    const imageRef = ref(storage, imagePath)
    await deleteObject(imageRef)
    return true
  } catch (error) {
    console.error("Error deleting image: ", error)
    return false
  }
}
export const addProduct = async (product, imageFiles = []) => {
  try {
    const productWithTimestamp = {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    const docRef = await addDoc(productsCol, productWithTimestamp)

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
export const updateProduct = async (productId, productData, imageFiles = []) => {
  try {
    const productRef = doc(db, "products", productId)
    const docSnap = await getDoc(productRef)
    if (!docSnap.exists()) {
      throw new Error("Product not found")
    }

    const currentProduct = docSnap.data()

    const updatedImages = currentProduct.images || []
    const updatedImagePaths = currentProduct.imagePaths || []

    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        if (file) {
          const imageData = await uploadProductImage(file, productId)

          if (imageData) {
            if (updatedImagePaths[i]) {
              await deleteProductImage(updatedImagePaths[i])
            }
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

    const mainImage = updatedImages.length > 0 ? updatedImages[0] : null
    const mainImagePath = updatedImagePaths.length > 0 ? updatedImagePaths[0] : null

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

export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, "products", productId)
    const docSnap = await getDoc(productRef)

    if (!docSnap.exists()) {
      throw new Error("Product not found")
    }

    const product = docSnap.data()

    if (product.imagePaths && product.imagePaths.length > 0) {
      for (const path of product.imagePaths) {
        await deleteProductImage(path)
      }
    } else if (product.imagePath) {
      await deleteProductImage(product.imagePath)
    }

    await deleteDoc(productRef)
    return true
  } catch (error) {
    console.error("Error deleting product: ", error)
    throw error
  }
}
