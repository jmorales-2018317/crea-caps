"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/dashboard-stats";

export const dashboardStatsQueryKey = ["dashboard", "stats"] as const;

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardStatsQueryKey,
    queryFn: getDashboardStats,
  });
}
