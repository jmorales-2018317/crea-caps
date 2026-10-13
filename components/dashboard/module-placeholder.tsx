import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
}: ModulePlaceholderProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-5" aria-hidden />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground">
            Este módulo estará disponible en una próxima iteración. Por ahora
            puedes navegar el panel y consultar el resumen del catálogo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
