"use client"

import * as React from "react"

export function useMediaQuery(query: string): boolean {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setValue(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => setValue(event.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [query])

  return value
}
