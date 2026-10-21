"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CAP_PART_HEX_PATTERN,
  DEFAULT_CAP_PART_COLORS,
  LOGO_SIZE_PX_DEFAULT,
  PERSONALIZATION_STORAGE_KEY,
  sanitizeLogoSizePx,
  sanitizePartColors,
  type CapPartId,
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
        const nextColor = CAP_PART_HEX_PATTERN.test(color)
          ? color.toUpperCase()
          : color;
        set((state) => ({
          partColors: {
            ...state.partColors,
            [part]: nextColor,
          },
        }));
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
