"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { revalidateStoreSettingsCache } from "@/app/store/actions";
import {
  getStoreSettingsClient,
  saveStoreSettings,
  type SaveStoreSettingsInput,
} from "@/services/store-settings";

export const storeSettingsQueryKey = ["store-settings"] as const;

export function useStoreSettings() {
  return useQuery({
    queryKey: storeSettingsQueryKey,
    queryFn: getStoreSettingsClient,
  });
}

function useInvalidateStoreSettings() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: storeSettingsQueryKey }),
      revalidateStoreSettingsCache(),
    ]);
  };
}

export function useSaveStoreSettings() {
  const invalidate = useInvalidateStoreSettings();

  return useMutation({
    mutationFn: (input: SaveStoreSettingsInput) => saveStoreSettings(input),
    onSuccess: async () => {
      await invalidate();
    },
  });
}
