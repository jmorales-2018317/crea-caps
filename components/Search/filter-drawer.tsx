"use client"

import { useState, useCallback } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { SlidersHorizontalIcon } from "lucide-react"
import { SearchFilters, SortEnum } from "@/services/Search"
import type { Category } from "@/services/Category"

const PRICE_MIN = 0
const PRICE_MAX = 1000

const defaultFilters: SearchFilters = {
  categoryId: null,
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  sort: SortEnum.RECENT,
}

function getActiveFiltersCount(filters: Partial<SearchFilters> | null | undefined): number {
  if (!filters) return 0
  let count = 0
  if (filters.categoryId != null) count++
  if (filters.priceMin !== undefined && filters.priceMin !== PRICE_MIN) count++
  if (filters.priceMax !== undefined && filters.priceMax !== PRICE_MAX) count++
  if (filters.sort !== undefined && filters.sort !== SortEnum.RECENT) count++
  return count
}

type FilterDrawerProps = {
  initialFilters?: Partial<SearchFilters>
  handleApply: (filters: SearchFilters) => void
  categories?: Category[]
}

export function FilterDrawer({
  initialFilters,
  handleApply,
  categories,
}: FilterDrawerProps) {
  const [open, setOpen] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(
    initialFilters?.categoryId ?? defaultFilters.categoryId
  )
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters?.priceMin ?? defaultFilters.priceMin,
    initialFilters?.priceMax ?? defaultFilters.priceMax,
  ])
  const [priceMinInput, setPriceMinInput] = useState(
    String(initialFilters?.priceMin ?? PRICE_MIN)
  )
  const [priceMaxInput, setPriceMaxInput] = useState(
    String(initialFilters?.priceMax ?? PRICE_MAX)
  )
  const [sort, setSort] = useState<SortEnum>(
    initialFilters?.sort ?? defaultFilters.sort
  )

  const activeCount = getActiveFiltersCount(initialFilters ?? null)

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        const applied = initialFilters ?? defaultFilters
        const min = applied.priceMin ?? defaultFilters.priceMin
        const max = applied.priceMax ?? defaultFilters.priceMax
        setCategoryId(applied.categoryId ?? defaultFilters.categoryId)
        setPriceRange([min, max])
        setPriceMinInput(String(min))
        setPriceMaxInput(String(max))
        setSort(applied.sort ?? defaultFilters.sort)
      }
      setOpen(nextOpen)
    },
    [initialFilters]
  )

  const handleApplyFilters = useCallback(() => {
    const min = Math.max(PRICE_MIN, Math.min(PRICE_MAX, Number(priceMinInput) || PRICE_MIN))
    const max = Math.max(PRICE_MIN, Math.min(PRICE_MAX, Number(priceMaxInput) || PRICE_MAX))
    const finalMin = Math.min(min, max)
    const finalMax = Math.max(min, max)
    handleApply({
      categoryId,
      priceMin: finalMin,
      priceMax: finalMax,
      sort,
    })
    setOpen(false)
  }, [categoryId, priceMinInput, priceMaxInput, sort, handleApply])

  const handleResetFilters = () => {
    handleApply(defaultFilters)
    setCategoryId(defaultFilters.categoryId)
    setPriceRange([PRICE_MIN, PRICE_MAX])
    setPriceMinInput(String(PRICE_MIN))
    setPriceMaxInput(String(PRICE_MAX))
    setSort(defaultFilters.sort)
    setOpen(false)
  }

  const handlePriceRangeChange = (value: number[]) => {
    const [min, max] = value
    setPriceRange([min, max])
    setPriceMinInput(String(min))
    setPriceMaxInput(String(max))
  }

  const syncInputsToRange = () => {
    const min = Math.max(PRICE_MIN, Math.min(PRICE_MAX, Number(priceMinInput) || PRICE_MIN))
    const max = Math.max(PRICE_MIN, Math.min(PRICE_MAX, Number(priceMaxInput) || PRICE_MAX))
    setPriceRange([Math.min(min, max), Math.max(min, max)])
    setPriceMinInput(String(Math.min(min, max)))
    setPriceMaxInput(String(Math.max(min, max)))
  }

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const triggerButton = (
    <Button variant="outline" size="icon-lg" className="rounded-lg p-5 relative">
      <SlidersHorizontalIcon className="size-4" />
      {activeCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-black text-white rounded-full px-1.5 py-0.5 text-xs min-w-5 text-center">
          {activeCount}
        </span>
      )}
    </Button>
  )

  const filterForm = (
    <>
      <div className={cn("flex flex-col gap-6 overflow-y-auto", !isDesktop && "p-5")}>
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Categoría
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              onClick={() => setCategoryId(null)}
              className={cn(
                "rounded-full",
                categoryId === null
                  ? "border-primary bg-black text-white"
                  : "border-border bg-muted/50 text-muted-foreground"
              )}
            >
              Todas
            </Button>
            {categories?.map((cat) => (
              <Button
                key={cat.id}
                size="lg"
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  "rounded-full",
                  categoryId === cat.id
                    ? "border-primary bg-black text-white"
                    : "border-border bg-muted/50 text-muted-foreground"
                )}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Rango de precio
          </h3>
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={10}
            className="w-full"
          />
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-lg border border-input bg-input/20 px-3 py-0.5">
              <span className="text-muted-foreground">Q</span>
              <Input
                type="number"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={priceMinInput}
                onChange={(e) => setPriceMinInput(e.target.value)}
                onBlur={syncInputsToRange}
                className="h-7 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 focus-visible:border-0"
              />
            </div>
            <span className="text-muted-foreground">-</span>
            <div className="flex-1 flex items-center gap-2 rounded-lg border border-input bg-input/20 px-3 py-1">
              <span className="text-muted-foreground">Q</span>
              <Input
                type="number"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={priceMaxInput}
                onChange={(e) => setPriceMaxInput(e.target.value)}
                onBlur={syncInputsToRange}
                className="h-7 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 focus-visible:border-0"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Ordenar por
          </h3>
          <RadioGroup
            value={sort}
            onValueChange={(value) => setSort(value as SortEnum)}
            className="flex flex-col gap-2"
          >
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-3 py-2 hover:bg-muted/50 [&:has([data-state=checked])]:border-black [&:has([data-state=checked])]:bg-black/5">
              <RadioGroupItem value={SortEnum.RECENT} id="sort-reciente" />
              <span className="text-sm font-medium">Reciente</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-3 py-2 hover:bg-muted/50 [&:has([data-state=checked])]:border-black [&:has([data-state=checked])]:bg-black/5">
              <RadioGroupItem value={SortEnum.POPULAR} id="sort-popular" />
              <span className="text-sm font-medium">Popular</span>
            </label>
          </RadioGroup>
        </section>
      </div>

      <div className={cn("flex flex-row gap-2.5 border-t border-border", isDesktop ? "pt-5" : "p-5")}>
        <Button
          size="xl"
          variant="outline"
          className="flex-1 rounded-full"
          onClick={handleResetFilters}
        >
          Restablecer
        </Button>
        <Button
          size="xl"
          className="flex-1 rounded-full bg-black text-white"
          onClick={handleApplyFilters}
        >
          Aplicar
        </Button>
      </div>
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
          </DialogHeader>
          {filterForm}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-center gap-2 border-b border-border pb-2">
          <DrawerTitle className="w-full text-lg font-semibold text-foreground text-center">
            Filtros
          </DrawerTitle>
        </DrawerHeader>
        {filterForm}
      </DrawerContent>
    </Drawer>
  )
}
