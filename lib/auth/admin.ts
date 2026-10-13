type ClaimBag = {
  app_metadata?: unknown;
};

export function getAdminRole(claims: ClaimBag | null | undefined): string | undefined {
  const meta = claims?.app_metadata;
  if (!meta || typeof meta !== "object") return undefined;
  if (!("role" in meta)) return undefined;
  return typeof meta.role === "string" ? meta.role : undefined;
}

export function isAdminClaims(claims: ClaimBag | null | undefined): boolean {
  return getAdminRole(claims) === "admin";
}
