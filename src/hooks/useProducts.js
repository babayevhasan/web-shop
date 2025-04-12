"use client"

import { useContext } from "react"
import { ProductsContext } from "../context/ProductsContext"

export function useProducts() {
  return useContext(ProductsContext)
}



