"use client";

import { FilePenLine, Package, PackageCheck, Tags } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import {
  QueryEmptyState,
  QueryErrorState,
} from "@/components/dashboard/query-state";
import {
  StatCard,
  StatCardSkeleton,
} from "@/components/dashboard/stat-card";

export function StatsOverview() {
  const { data, isPending, isError, refetch, isFetching } = useDashboardStats();

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        title="No se pudieron cargar los indicadores"
        message="Hubo un problema al consultar el catálogo en Supabase."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const isCatalogEmpty =
    data.totalProducts === 0 && data.totalCategories === 0;

  return (
    <div className="space-y-4">
      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-busy={isFetching}
      >
        <StatCard
          title="Total de productos"
          value={data.totalProducts}
          description="Productos registrados en el catálogo"
          icon={Package}
        />
        <StatCard
          title="Publicados"
          value={data.publishedProducts}
          description="Visibles en la tienda pública"
          icon={PackageCheck}
        />
        <StatCard
          title="En borrador"
          value={data.draftProducts}
          description="Aún no publicados"
          icon={FilePenLine}
        />
        <StatCard
          title="Categorías"
          value={data.totalCategories}
          description="Categorías disponibles en el catálogo"
          icon={Tags}
        />
      </div>

      {isCatalogEmpty ? (
        <QueryEmptyState
          title="Catálogo vacío"
          description="Cuando agregues productos y categorías, sus totales aparecerán aquí."
        />
      ) : null}
    </div>
  );
}
