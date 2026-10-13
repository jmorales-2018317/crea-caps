import { ProductForm } from "@/components/dashboard/product-form";

type EditProductoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductoPage({
  params,
}: EditProductoPageProps) {
  const { id } = await params;
  return <ProductForm productId={id} />;
}
