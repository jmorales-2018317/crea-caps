import { Poppins, DM_Sans } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/util/providers/react-query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import CartProvider from "@/util/providers/cart-provider";

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
          <CartProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </CartProvider>
          <Toaster position="top-center" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
