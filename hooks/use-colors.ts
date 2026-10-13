"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createColor,
  deleteColor,
  listColors,
  updateColor,
} from "@/services/colors";
import type { ColorInsert, ColorUpdate } from "@/types/colors";

export const colorsQueryKey = ["colors"] as const;

export function useColors() {
  return useQuery({
    queryKey: colorsQueryKey,
    queryFn: listColors,
  });
}

function useInvalidateColors() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: colorsQueryKey });
  };
}

export function useCreateColor() {
  const invalidate = useInvalidateColors();

  return useMutation({
    mutationFn: (input: ColorInsert) => createColor(input),
    onSuccess: async () => {
      await invalidate();
    },
  });
}

export function useUpdateColor() {
  const invalidate = useInvalidateColors();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ColorUpdate }) =>
      updateColor(id, input),
    onSuccess: async () => {
      await invalidate();
    },
  });
}

export function useDeleteColor() {
  const invalidate = useInvalidateColors();

  return useMutation({
    mutationFn: (id: string) => deleteColor(id),
    onSuccess: async () => {
      await invalidate();
    },
  });
}
