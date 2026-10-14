import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              {title}
            </CardDescription>
            <p className="mt-2 font-heading text-4xl font-semibold leading-none tracking-tight tabular-nums sm:text-5xl">
              {value.toLocaleString("es-MX")}
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-12 w-20 sm:h-14" />
          </div>
          <Skeleton className="size-10 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-40" />
      </CardContent>
    </Card>
  );
}
