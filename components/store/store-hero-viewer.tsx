"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { HeroCapLoader } from "@/components/store/hero-cap-loader";
import { FALLBACK_LOGO } from "@/lib/constants/store";

const HeroCapCanvas = dynamic(
  () =>
    import("@/components/store/hero-cap-viewer").then((mod) => mod.HeroCapViewer),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0" aria-hidden="true" />,
  },
);

export function StoreHeroViewer() {
  const [isModelReady, setIsModelReady] = useState(false);

  const handleModelReady = useCallback(() => {
    setIsModelReady(true);
  }, []);

  return (
    <div
      className="relative z-10 aspect-square w-full max-w-full"
      aria-busy={!isModelReady}
    >
      <HeroCapCanvas logoUrl={FALLBACK_LOGO} onModelReady={handleModelReady} />
      {isModelReady ? null : <HeroCapLoader />}
    </div>
  );
}
