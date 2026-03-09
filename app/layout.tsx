"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Poppins, DM_Sans } from "next/font/google";
import { ReactNode, useState } from "react";
import "./globals.css";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({subsets:['latin'],variable:'--font-sans'});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <html lang="en" className={cn("font-sans", dmSans.variable)}>
      <head>
        <title>Crea Caps</title>
        <meta name="description" content="Gorras personalizadas" />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
