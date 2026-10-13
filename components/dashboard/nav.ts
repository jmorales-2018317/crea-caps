import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  Tags,
} from "lucide-react";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    title: "Resumen",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Productos",
    href: "/dashboard/productos",
    icon: Package,
  },
  {
    title: "Categorías",
    href: "/dashboard/categorias",
    icon: Tags,
  },
  {
    title: "Colores",
    href: "/dashboard/colores",
    icon: Palette,
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
  },
];

export function getDashboardModuleTitle(pathname: string): string {
  const match = dashboardNavItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  );

  return match?.title ?? "Dashboard";
}

export function isDashboardNavActive(
  pathname: string,
  item: DashboardNavItem,
): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
