"use client"

import { useEffect, useState } from "react"

/**
 * Devuelve un valor que se actualiza tras `delay` ms de dejar de cambiar el valor original.
 * Útil para búsquedas: el input se actualiza al instante, la petición usa el valor debounced.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
