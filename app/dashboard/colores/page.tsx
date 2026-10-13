import { Palette } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function ColoresPage() {
  return (
    <ModulePlaceholder
      title="Colores"
      description="Paleta de colores disponibles para las gorras."
      icon={Palette}
    />
  );
}
