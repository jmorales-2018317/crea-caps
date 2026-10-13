import { Suspense } from "react";
import { ProductForm } from "@/components/dashboard/product-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function NuevoProductoPage() {
  return (
    <Suspense fallback={<NuevoProductoFallback />}>
      <ProductForm />
    </Suspense>
  );
}

function NuevoProductoFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
