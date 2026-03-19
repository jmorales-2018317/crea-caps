"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "../ui/button"

export function HomeBannersSlider() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return
    queueMicrotask(() => setCurrent(api.selectedScrollSnap()))
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api, setCurrent])

  return (
    <section className="">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        className="w-full" plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent className="-ml-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="pl-4">
              <div className="relative overflow-hidden bg-accent p-4 text-primary-foreground min-h-72 sm:min-h-[500px]" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious size="icon-sm" className="left-2 sm:left-4 sm:size-8" />
        <CarouselNext size="icon-sm" className="right-2 sm:right-4 sm:size-8" />
      </Carousel>
      <div className="mt-3 flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "size-2 rounded-full transition-colors shadow-none",
              index === current
                ? "bg-secondary w-6"
                : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </section>
  )
}
