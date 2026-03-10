import { Poppins, DM_Sans } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/util/providers/react-query-provider";

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });

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
  return (
    <html lang="en" className={cn("font-sans", dmSans.variable)}>
      <head>
        <title>Crea Caps</title>
        <meta name="description" content="Gorras personalizadas" />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        <ReactQueryProvider>
          {children}
          <BottomNav />
          <Toaster position="top-center" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
