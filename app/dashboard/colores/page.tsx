import type { Metadata } from "next";
import { ColorsAdmin } from "@/components/dashboard/colors-admin";

export const metadata: Metadata = {
  title: "Colores",
};

export default function ColoresPage() {
  return <ColorsAdmin />;
}
