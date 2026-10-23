"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_CAP_PART_COLORS,
  PERSONALIZATION_STORAGE_KEY,
  constrainPartColorsToPalette,
  sanitizeColorForPart,
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

      resetDesign: () => {
        set({
          partColors: { ...DEFAULT_CAP_PART_COLORS },
          selectedPart: null,
        });
      },
    }),
    {
      name: PERSONALIZATION_STORAGE_KEY,
      partialize: (state) => ({
        partColors: state.partColors,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | { partColors?: unknown }
          | undefined;
        return {
          ...currentState,
          partColors: sanitizePartColors(persisted?.partColors),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
