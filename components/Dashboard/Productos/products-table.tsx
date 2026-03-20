"use client"

import {
  ColumnDef,
} from "@tanstack/react-table"
import { DataTable } from "../data-table"
import { useProducts } from "@/hooks/api/useProducts"
import { Product } from "@/services/Product"

interface ProductsTableProps {
  columns: ColumnDef<Product>[]
}

export function ProductsTable({
  columns,
}: ProductsTableProps) {
  const { data: products = [] } = useProducts()

  return (
    <DataTable
      columns={columns}
      data={products}
    />
  )
}