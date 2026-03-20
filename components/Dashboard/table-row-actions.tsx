"use client"

import { Product } from "@/services/Product"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { MoreHorizontal, CopyIcon, PencilIcon, TrashIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog"

export function DataTableRowActions({ product }: { product: Product }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleCopyId = (productId: string) => {
    navigator.clipboard.writeText(productId)
    toast.success("ID copiado al portapapeles")
  }

  const handleEdit = (productId: string) => {
    router.push(`/dashboard/productos/${productId}`)
  }

  const handleDelete = (productId: string) => {
    console.log(productId)
    setOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleCopyId(product.id)}>
            <CopyIcon className="w-4 h-4" />
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEdit(product.id)}>
            <PencilIcon className="w-4 h-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setOpen(true)}
          >
            <TrashIcon className="w-4 h-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar este producto?
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => handleDelete(product.id)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}