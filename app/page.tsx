import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import { HomeContent } from "@/components/Home/HomeContent"
import { queryKeys } from "@/lib/queries/keys"
import { getCategories } from "@/services/Category"
import { getProducts, getProductsOnSale } from "@/services/Product"

export default async function Home() {
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories,
      queryFn: getCategories,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.products,
      queryFn: getProducts,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.productsOnSale,
      queryFn: getProductsOnSale,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeContent />
    </HydrationBoundary>
  )
}
