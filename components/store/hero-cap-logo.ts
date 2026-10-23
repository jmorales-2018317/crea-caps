import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  SRGBColorSpace,
  type Texture,
} from "three";
import { FALLBACK_LOGO } from "@/lib/constants/store";
import { validateImageFile } from "@/lib/catalog-images";
import {
  LOGO_SIZE_PX_MAX,
  LOGO_SIZE_PX_MIN,
  sanitizeLogoSizePx,
  type LogoPlacement,
} from "@/types/personalization";

export const CROWN_FRONT_NAME = "crown_front_outside";
export const VISOR_UP_NAME = "visor_up";
export const DEFAULT_HERO_LOGO_PATH = FALLBACK_LOGO;
export const DEFAULT_HERO_LOGO_PLACEMENT: LogoPlacement = "front_center";
export const LOGO_TEXTURE_MAX_SIZE = 1024;
export const LOGO_PANEL_COVERAGE = 0.36;
export const LOGO_FRONT_PAIR_COVERAGE = 0.52;
export const LOGO_VISOR_PAIR_COVERAGE = 0.46;
export const LOGO_SIZE_MIN = 0.55;
export const LOGO_SIZE_MAX = 1.7;
export const LOGO_SIZE_DEFAULT = 1;

export const LOGO_ANCHOR_NAMES: Record<LogoPlacement, string> = {
  front_left: "logo_anchor_left",
  front_center: "logo_anchor_center",
  front_right: "logo_anchor_right",
  visor_left: "logo_anchor_visor_left",
  visor_right: "logo_anchor_visor_right",
};

export const LOGO_TARGET_MESH_NAMES: Record<LogoPlacement, string> = {
  front_left: CROWN_FRONT_NAME,
  front_center: CROWN_FRONT_NAME,
  front_right: CROWN_FRONT_NAME,
  visor_left: VISOR_UP_NAME,
  visor_right: VISOR_UP_NAME,
};

export function logoSizePxToScale(
  px: number,
  placement?: LogoPlacement,
): number {
  const clamped = sanitizeLogoSizePx(px, placement);
  const t =
    (clamped - LOGO_SIZE_PX_MIN) / (LOGO_SIZE_PX_MAX - LOGO_SIZE_PX_MIN);
  return LOGO_SIZE_MIN + t * (LOGO_SIZE_MAX - LOGO_SIZE_MIN);
}

export function validateHeroLogoFile(file: File): string | null {
  return validateImageFile(file);
}

export async function createHeroLogoTextureFromUrl(url: string): Promise<Texture> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("No se pudo cargar el logo.");
  }
  return createHeroLogoTexture(await response.blob());
}

export async function createHeroLogoTexture(file: Blob): Promise<Texture> {
  const source = await loadLogoImageSource(file);
  try {
    const scale = Math.min(
      1,
      LOGO_TEXTURE_MAX_SIZE / Math.max(source.width, source.height),
    );
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No se pudo procesar la imagen.");
    }
    source.draw(context, width, height);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.needsUpdate = true;
    return texture;
  } finally {
    source.close();
  }
}

export function getLogoAspect(texture: Texture): number {
  const image = texture.image as { width?: number; height?: number } | undefined;
  const width = image?.width ?? 1;
  const height = image?.height ?? 1;
  if (width <= 0 || height <= 0) {
    return 1;
  }
  return width / height;
}

type LogoImageSource = {
  width: number;
  height: number;
  draw: (context: CanvasRenderingContext2D, width: number, height: number) => void;
  close: () => void;
};

async function loadLogoImageSource(file: Blob): Promise<LogoImageSource> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (context, width, height) => {
          context.drawImage(bitmap, 0, 0, width, height);
        },
        close: () => bitmap.close(),
      };
    } catch {}
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await loadHtmlImage(url);
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      draw: (context, width, height) => {
        context.drawImage(image, 0, 0, width, height);
      },
      close: () => undefined,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadHtmlImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo leer la imagen."));
    image.src = url;
  });
}
