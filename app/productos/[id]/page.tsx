import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { ProductDetailContent } from "@/components/Product/ProductDetailContent"
import { queryKeys } from "@/lib/queries/keys"
import { getProductById, getProducts } from "@/services/Product"
import { createClient as createServerClient } from "@/lib/supabase/server"

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params
  const queryClient = new QueryClient()
  const supabase = await createServerClient()

  await queryClient.prefetchQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => getProductById(id, supabase),
  })

  await queryClient.prefetchQuery({
    queryKey: queryKeys.products,
    queryFn: () => getProducts(supabase),
  })

  const product = queryClient.getQueryData(queryKeys.product(id))
  if (!product) {
    return notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailContent productId={id} />
    </HydrationBoundary>
  )
}
