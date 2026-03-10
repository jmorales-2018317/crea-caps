"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import Autoplay from "embla-carousel-autoplay"

export function HomeBannersSlider() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return
    queueMicrotask(() => setCurrent(api.selectedScrollSnap()))
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api, setCurrent])

  return (
    <section className="px-4">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true }}
        className="w-full" plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent className="-ml-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="basis-[90%] pl-2">
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-accent p-4 text-primary-foreground",
                  "min-h-[180px]"
                )}
              >
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="mt-3 flex justify-center gap-1.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Ir a slide ${index + 1}`}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "size-2 rounded-full transition-colors",
              index === current
                ? "bg-primary w-5"
                : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </section>
  )
}
