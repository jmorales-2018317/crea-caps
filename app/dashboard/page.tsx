import { StatsOverview } from "@/components/dashboard/stats-overview";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Resumen del catálogo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Indicadores actuales obtenidos desde Supabase.
        </p>
      </div>
      <StatsOverview />
    </div>
  );
}
