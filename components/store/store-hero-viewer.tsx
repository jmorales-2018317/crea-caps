"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { HeroCapLoader } from "@/components/store/hero-cap-loader";
import { HeroCapLogoControls } from "@/components/store/hero-cap-logo-controls";
import { validateImageFile } from "@/lib/catalog-images";
import { FALLBACK_LOGO } from "@/lib/constants/store";

const HeroCapCanvas = dynamic(
  () =>
    import("@/components/store/hero-cap-viewer").then((mod) => mod.HeroCapViewer),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0" aria-hidden="true" />,
  },
);

function revokeIfBlob(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function StoreHeroViewer() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(FALLBACK_LOGO);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const previewUrlRef = useRef<string | null>(FALLBACK_LOGO);

  const replacePreview = (nextUrl: string | null) => {
    revokeIfBlob(previewUrlRef.current);
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  };

  useEffect(() => {
    return () => {
      revokeIfBlob(previewUrlRef.current);
    };
  }, []);

  const handleModelReady = useCallback(() => {
    setIsModelReady(true);
  }, []);

  const handleLogoReady = useCallback(() => {
    setIsProcessing(false);
  }, []);

  const handleLogoError = useCallback((message: string) => {
    setIsProcessing(false);
    const currentUrl = previewUrlRef.current;
    if (currentUrl && currentUrl !== FALLBACK_LOGO) {
      setError(message);
    }
  }, []);

  const clearLogo = () => {
    replacePreview(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleFileSelected = (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError(null);
    replacePreview(URL.createObjectURL(file));
  };

  return (
    <div
      className="relative z-10 aspect-square w-full max-w-full"
      aria-busy={!isModelReady}
    >
      <HeroCapCanvas
        logoUrl={previewUrl}
        onLogoReady={handleLogoReady}
        onLogoError={handleLogoError}
        onModelReady={handleModelReady}
      />
      {isModelReady ? null : <HeroCapLoader />}
      <HeroCapLogoControls
        previewUrl={previewUrl}
        isProcessing={isProcessing}
        error={error}
        onFileSelected={handleFileSelected}
        onClear={clearLogo}
      />
    </div>
  );
}
