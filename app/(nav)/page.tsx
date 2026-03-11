import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import { HomeContent } from "@/components/Home/HomeContent"
import { queryKeys } from "@/lib/queries/keys"
import { getCategories } from "@/services/Category"
import { getProducts, getProductsOnSale } from "@/services/Product"
import { createClient as createServerClient } from "@/lib/supabase/server"

export default async function Home() {
  const queryClient = new QueryClient()
  const supabase = await createServerClient()

  await queryClient.prefetchQuery({
    queryKey: queryKeys.categories,
    queryFn: () => getCategories(supabase),
  });

  await queryClient.prefetchQuery({
    queryKey: queryKeys.products,
    queryFn: () => getProducts(supabase),
  });

  await queryClient.prefetchQuery({
    queryKey: queryKeys.productsOnSale,
    queryFn: () => getProductsOnSale(supabase),
  });

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeContent initialUser={user ?? null} />
    </HydrationBoundary>
  )
}
