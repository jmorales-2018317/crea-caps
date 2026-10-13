import { Tags } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function CategoriasPage() {
  return (
    <ModulePlaceholder
      title="Categorías"
      description="Organización del catálogo por categorías."
      icon={Tags}
    />
  );
}
