import { columns, ProductsTable } from "@/components/Dashboard/Productos"
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { queryKeys } from "@/lib/queries/keys";
import { getProducts } from "@/services/Product";

export default async function DemoPage() {
  const queryClient = new QueryClient()
  const supabase = await createClient()

  await queryClient.prefetchQuery({
    queryKey: queryKeys.products,
    queryFn: () => getProducts(supabase),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold">Productos</h1>
          <Button asChild>
            <Link href="/dashboard/productos/nuevo">
              <PlusIcon className="w-4 h-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
        <ProductsTable columns={columns} />
      </div>
    </HydrationBoundary>
  )
}