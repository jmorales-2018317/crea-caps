import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StoreHero() {
  return (
    <section
      aria-labelledby="store-hero-heading"
      className="relative flex min-h-[min(78svh,780px)] flex-col overflow-hidden bg-background"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--hero-gradient)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-4xl bg-[radial-gradient(ellipse_at_70%_45%,rgb(184_154_85_/_0.16)_0%,rgb(184_154_85_/_0.05)_40%,transparent_68%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-14">
        <div className="w-full min-w-0 max-w-xl shrink-0 space-y-6 animate-hero-enter lg:max-w-[28rem]">
          <div className="space-y-4">
            <h1
              id="store-hero-heading"
              className="text-4xl font-semibold tracking-tight text-text-strong sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]"
            >
              Crea tu gorra completamente{" "}
              <span className="relative block w-fit">
                <span className="relative block bg-linear-to-r from-primary via-[#e8d9a8] to-primary bg-clip-text font-semibold text-transparent drop-shadow-[0_0_28px_rgba(193,161,88,0.55)]">
                  personalizada
                </span>
              </span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-text-secondary sm:text-lg">
              Convierte tu idea en una pieza única diseñada para representar tu
              estilo, identidad o marca.
            </p>
          </div>

          <div className="pt-1">
            <Button
              size="lg"
              nativeButton={false}
              className="group relative h-12 min-w-44 cursor-pointer overflow-hidden rounded-2xl border border-[#e8d9a8]/30 bg-linear-to-b from-[#e0c878] via-primary to-[#9a7f3f] px-10 text-sm font-semibold tracking-wide text-primary-foreground shadow-[0_4px_24px_rgba(193,161,88,0.28),inset_0_1px_0_rgba(255,255,255,0.35)] transition-[box-shadow,filter,border-color] duration-200 ease-out hover:border-[#f0e4b8]/45 hover:bg-primary hover:shadow-[0_8px_32px_rgba(193,161,88,0.42),inset_0_1px_0_rgba(255,255,255,0.45)] hover:brightness-105 focus-visible:ring-primary/50 active:brightness-95 motion-reduce:transition-none sm:h-12"
              render={<Link href="/catalogo" />}
            >
              <span
                className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none"
                aria-hidden="true"
              />
              <span className="relative">Diseña la tuya</span>
              <ArrowRight
                className="relative size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>

        <div className="relative flex w-full min-w-0 max-w-2xl flex-1 items-center justify-center animate-hero-enter [animation-delay:120ms] lg:max-w-none lg:basis-[58%]">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[125%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(184_154_85_/_0.22)_0%,rgb(184_154_85_/_0.08)_38%,transparent_66%)]"
            aria-hidden="true"
          />
          <Image
            src="/hero-cap.webp"
            alt="Gorra personalizada Caps Store"
            width={700}
            height={700}
            priority
            className="relative z-10 h-auto w-full max-w-full animate-hero-drift object-contain drop-shadow-[0_28px_48px_rgb(0_0_0_/_0.55)]"
          />
        </div>
      </div>
    </section>
  );
}
