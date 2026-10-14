import type { Metadata } from "next";
import { CategoriesAdmin } from "@/components/dashboard/categories-admin";

export const metadata: Metadata = {
  title: "Categorías",
};

export default function CategoriasPage() {
  return <CategoriesAdmin />;
}
