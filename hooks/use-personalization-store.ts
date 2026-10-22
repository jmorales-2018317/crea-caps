"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_CAP_PART_COLORS,
  LOGO_SIZE_PX_DEFAULT,
  PERSONALIZATION_STORAGE_KEY,
  constrainPartColorsToPalette,
  sanitizeColorForPart,
  sanitizeLogoSizePx,
  sanitizePartColors,
  type CapPartId,
  type PaletteColor,
  type PersonalizationStore,
} from "@/types/personalization";

export const usePersonalizationStore = create<PersonalizationStore>()(
  persist(
    (set) => ({
      partColors: { ...DEFAULT_CAP_PART_COLORS },
      selectedPart: null,
      logoSizePx: LOGO_SIZE_PX_DEFAULT,
      hasHydrated: false,

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      setPartColor: (part, color) => {
        const nextColor = sanitizeColorForPart(part, color);
        if (!nextColor) {
          return;
        }
        set((state) => ({
          partColors: {
            ...state.partColors,
            [part]: nextColor,
          },
        }));
      },

      constrainToPalette: (palette: readonly PaletteColor[]) => {
        set((state) => {
          const next = constrainPartColorsToPalette(state.partColors, palette);
          if (next === state.partColors) {
            return state;
          }
          return { partColors: next };
        });
      },

      selectPart: (part: CapPartId | null) => {
        set({ selectedPart: part });
      },

      setLogoSizePx: (sizePx) => {
        set({ logoSizePx: sanitizeLogoSizePx(sizePx) });
      },

      resetDesign: () => {
        set({
          partColors: { ...DEFAULT_CAP_PART_COLORS },
          selectedPart: null,
          logoSizePx: LOGO_SIZE_PX_DEFAULT,
        });
      },
    }),
    {
      name: PERSONALIZATION_STORAGE_KEY,
      partialize: (state) => ({
        partColors: state.partColors,
        logoSizePx: state.logoSizePx,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | { partColors?: unknown; logoSizePx?: unknown }
          | undefined;
        return {
          ...currentState,
          partColors: sanitizePartColors(persisted?.partColors),
          logoSizePx: sanitizeLogoSizePx(persisted?.logoSizePx),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
