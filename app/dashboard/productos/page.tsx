import type { Metadata } from "next";
import { ProductsAdmin } from "@/components/dashboard/products-admin";

export const metadata: Metadata = {
  title: "Productos",
};

export default function ProductosPage() {
  return <ProductsAdmin />;
}
