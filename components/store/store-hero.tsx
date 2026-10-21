import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StoreHeroViewer } from "@/components/store/store-hero-viewer";
import { Button } from "@/components/ui/button";

export function StoreHero() {
  return (
    <section
      aria-labelledby="store-hero-heading"
      className="relative flex min-h-[min(76svh,640px)] flex-col overflow-hidden bg-background lg:min-h-[min(68svh,680px)]"
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

      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center justify-items-center gap-5 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:items-center lg:justify-items-stretch lg:gap-x-8 lg:gap-y-6 lg:py-10">
        <div className="w-full max-w-md space-y-3 text-center sm:max-w-xl sm:space-y-4 lg:col-start-1 lg:row-start-1 lg:max-w-none lg:justify-self-start lg:text-left">
          <h1
            id="store-hero-heading"
            className="text-balance text-[2rem] font-semibold leading-[1.12] tracking-tight text-text-strong sm:text-5xl sm:leading-tight lg:text-[3.5rem] lg:leading-[1.08]"
          >
            Crea tu gorra completamente{" "}
            <span className="relative mt-1 inline-block w-fit sm:mt-0 sm:block">
              <span className="relative block bg-linear-to-r from-primary via-[#e8d9a8] to-primary bg-clip-text font-semibold text-transparent drop-shadow-[0_0_28px_rgba(193,161,88,0.55)]">
                personalizada
              </span>
            </span>
          </h1>
          <p className="mx-auto max-w-[34ch] text-pretty text-[0.9375rem] leading-relaxed text-text-secondary sm:mx-0 sm:max-w-md sm:text-lg lg:max-w-md">
            Convierte tu idea en una pieza única diseñada para representar tu
            estilo, identidad o marca.
          </p>
        </div>

        <div className="relative flex w-full min-w-0 max-w-[20rem] flex-col items-center justify-center sm:max-w-[27rem] md:max-w-lg lg:col-start-2 lg:row-span-2 lg:max-w-[40rem] lg:justify-self-center">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(184_154_85_/_0.26)_0%,rgb(184_154_85_/_0.1)_38%,transparent_66%)] animate-hero-enter-up sm:size-[125%]"
            aria-hidden="true"
          />
          <StoreHeroViewer />
          <p className="relative z-10 mt-2 hidden text-center text-xs text-text-secondary/80 lg:block">
            Arrastra para rotar
          </p>
        </div>

        <div className="w-full max-w-md sm:max-w-none lg:col-start-1 lg:row-start-2 lg:w-auto lg:justify-self-start">
          <Button
            size="lg"
            nativeButton={false}
            className="group relative h-12 min-h-11 w-full cursor-pointer overflow-hidden rounded-2xl border border-[#e8d9a8]/30 bg-linear-to-b from-[#e0c878] via-primary to-[#9a7f3f] px-8 text-sm font-semibold tracking-wide text-primary-foreground shadow-[0_4px_24px_rgba(193,161,88,0.28),inset_0_1px_0_rgba(255,255,255,0.35)] transition-[box-shadow,filter,border-color] duration-200 ease-out hover:border-[#f0e4b8]/45 hover:bg-primary hover:shadow-[0_8px_32px_rgba(193,161,88,0.42),inset_0_1px_0_rgba(255,255,255,0.45)] hover:brightness-105 focus-visible:ring-primary/50 active:brightness-95 motion-reduce:transition-none sm:h-12 sm:w-auto sm:min-w-44 sm:px-10 lg:w-auto"
            render={<Link href="/personalizacion" />}
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
    </section>
  );
}
