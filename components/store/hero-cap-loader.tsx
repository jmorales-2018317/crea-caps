export function HeroCapLoader() {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Cargando gorra"
    >
      <div className="flex items-end gap-1" aria-hidden="true">
        <span
          className="size-1 rounded-full bg-primary animate-hero-dot"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="size-1 rounded-full bg-primary animate-hero-dot"
          style={{ animationDelay: "160ms" }}
        />
        <span
          className="size-1 rounded-full bg-primary animate-hero-dot"
          style={{ animationDelay: "320ms" }}
        />
      </div>
    </div>
  );
}
