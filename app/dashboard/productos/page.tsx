import { Package } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function ProductosPage() {
  return (
    <ModulePlaceholder
      title="Productos"
      description="Gestión del catálogo de gorras."
      icon={Package}
    />
  );
}
