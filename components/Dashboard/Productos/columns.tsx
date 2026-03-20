"use client"

import { Product } from "@/services/Product"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Category } from "@/services/Category"
import { Discount } from "@/services/Discounts/types"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { DataTableRowActions } from "../table-row-actions"

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "images",
    header: "Imagen",
    cell: ({ row }) => {
      const images = row.getValue("images") as string[]
      return (
        <Image src={images[0]} alt={row.original.name} width={100} height={100} className="h-12 object-contain rounded-md" />
      )
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 w-full justify-start"
        >
          Precio
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "GTQ",
      }).format(price)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "categories",
    cell: ({ row }) => {
      const categories = row.getValue("categories") as Category[]
      return <div className="flex flex-wrap gap-2">
        {categories.map((category: Category) => (
          <Badge variant="outline" key={category.id}>{category.name}</Badge>
        ))}
      </div>
    },
  },
  {
    accessorKey: "discounts",
    cell: ({ row }) => {
      const discounts = row.getValue("discounts") as Discount[]
      return <div className="flex flex-wrap gap-2">
        {discounts.map((discount: Discount) => (
          <Badge variant="outline" key={discount.id} className="text-xs">{discount.name}</Badge>
        ))}
      </div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions product={row.original} />
    ),
  },
];