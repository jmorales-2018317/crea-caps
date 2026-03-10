"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Product } from "@/services/Product"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

export function ProductCarousel({ products }: { products: Product[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    const syncCurrent = () => setCurrent(api.selectedScrollSnap())
    queueMicrotask(syncCurrent)
    api.on("select", syncCurrent)
  }, [api])

  const scrollToIndex = (index: number) => {
    api?.scrollTo(index)
  }

  const product = products[0]

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Carousel setApi={setApi} className="w-full max-w-xs">
        <CarouselContent className="-ml-2">
          {product.images.map((image, index) => (
            <CarouselItem key={`${image}-${index}`} className="pl-4">
              <div className="relative h-60 overflow-hidden rounded-2xl p-4">
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious size="icon-lg" className="bg-background" />
        <CarouselNext size="icon-lg" className="bg-background" />
      </Carousel>

      <div className="no-scrollbar flex gap-2 w-fit justify-center bg-white p-1.5 rounded-lg">
        {product.images.map((image, index) => {
          const isActive = index === current
          return (
            <Button
              variant="outline"
              key={`${image}-${index}`}
              onClick={() => scrollToIndex(index)}
              className={cn("relative size-12 shrink-0 overflow-hidden rounded-lg", isActive && "border-black ring-2 ring-black/20")}
            >
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="48px"
                className="object-contain"
              />
            </Button>
          )
        })}
      </div>
    </div>
  )
}
