import {
  PublishedProductsCatalog,
  StoreHeader,
} from "@/components/store/published-products-catalog";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <StoreHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Catálogo</h1>
          <p className="text-sm text-muted-foreground">
            Gorras publicadas disponibles para consulta.
          </p>
        </div>
        <PublishedProductsCatalog />
      </main>
    </div>
  );
}
