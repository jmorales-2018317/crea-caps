import type { Metadata } from "next";
import { StoreSettingsForm } from "@/components/dashboard/store-settings-form";

export const metadata: Metadata = {
  title: "Configuración",
};

export default function ConfiguracionPage() {
  return <StoreSettingsForm />;
}
