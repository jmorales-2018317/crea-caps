"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type Crumb = { label: string; href?: string }

const MODULES: Record<
  string,
  {
    label: string
    createLabel?: string
    editLabel?: string
    detailLabel?: string
  }
> = {
  productos: { label: "Productos", createLabel: "Crear producto", editLabel: "Editar producto" },
  descuentos: { label: "Descuentos", createLabel: "Crear descuento", editLabel: "Editar descuento" },
  categorias: { label: "Categorías", createLabel: "Crear categoría", editLabel: "Editar categoría" },
  perfiles: { label: "Perfiles", detailLabel: "Perfil" },
  ordenes: { label: "Órdenes", detailLabel: "Detalle de orden" },
}

function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean)
  const isDashboardSection = parts[0] === "dashboard"

  const dashboardCrumbs: Crumb[] = [{ label: "Dashboard", href: "/dashboard" }]
  if (!isDashboardSection) {
    const last = parts.at(-1)
    return last ? [...dashboardCrumbs, { label: last }] : dashboardCrumbs
  }

  // /dashboard
  if (parts.length === 1) {
    return [...dashboardCrumbs]
  }

  const moduleSlug = parts[1]!
  const moduleCfg = MODULES[moduleSlug]
  if (!moduleCfg) {
    const last = parts.at(-1)
    return last ? [...dashboardCrumbs, { label: last }] : dashboardCrumbs
  }

  const crumbs: Crumb[] = [
    ...dashboardCrumbs,
    { label: moduleCfg.label, href: `/dashboard/${moduleSlug}` },
  ]

  const action = parts[2]
  // /dashboard/:module/nuevo
  if (action === "nuevo") {
    if (moduleCfg.createLabel) crumbs.push({ label: moduleCfg.createLabel })
    return crumbs
  }

  // /dashboard/:module/:id
  // parts = ["dashboard", module, id]
  if (parts.length === 3) {
    if (moduleCfg.editLabel) crumbs.push({ label: moduleCfg.editLabel })
    else if (moduleCfg.detailLabel) crumbs.push({ label: moduleCfg.detailLabel })
    else crumbs.push({ label: "Detalle" })
    return crumbs
  }

  // fallback
  const last = parts.at(-1)
  if (last && last !== moduleSlug) crumbs.push({ label: last })
  return crumbs
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const crumbs = pathname ? buildCrumbs(pathname) : [{ label: "Dashboard" }]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1

          return (
            <React.Fragment key={`${crumb.label}-${idx}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : crumb.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

