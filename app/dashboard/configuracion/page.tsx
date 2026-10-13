import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function ConfiguracionPage() {
  return (
    <ModulePlaceholder
      title="Configuración"
      description="Ajustes generales de la tienda."
      icon={Settings}
    />
  );
}
