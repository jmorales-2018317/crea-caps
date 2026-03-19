"use client";

import { getProfileById } from "@/services/Profile";
import { useQuery } from "@tanstack/react-query";

export function useGetProfileById(id: string) {
	return useQuery({
		queryKey: ["get-profile-by-id", id],
		queryFn: () => getProfileById(id),
		enabled: !!id,
	});
}
