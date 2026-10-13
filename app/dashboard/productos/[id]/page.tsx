import { Suspense } from "react";
import { ProductForm } from "@/components/dashboard/product-form";
import { Skeleton } from "@/components/ui/skeleton";

type EditProductoPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditProductoPage({ params }: EditProductoPageProps) {
  return (
    <Suspense fallback={<EditProductoFallback />}>
      <EditProductoForm params={params} />
    </Suspense>
  );
}

function EditProductoFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

async function EditProductoForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductForm productId={id} />;
}
