'use client';
import { getPublishedProducts } from '@/services/products.service';
import { useQuery } from '@tanstack/react-query';

export function useProducts() {
  return useQuery({ queryKey: ['products', 'published'], queryFn: getPublishedProducts });
}
