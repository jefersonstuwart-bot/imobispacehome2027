import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, AlertCircle, AlertTriangle, X, Building2, Bed, Ruler, MapPin, DollarSign } from "lucide-react";
import { ImportResult } from "./types";

interface ImportReportCardProps {
  result: ImportResult;
  onDismiss: () => void;
}

const ImportReportCard = ({ result, onDismiss }: ImportReportCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Relatório de Importação
          </CardTitle>
          <CardDescription>
            Lote: {result.batchId.slice(0, 8)}...
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{result.totalImported}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
            <p className="text-xs text-muted-foreground">Sucesso</p>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{result.warningCount}</p>
            <p className="text-xs text-muted-foreground">Avisos</p>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{result.errorCount}</p>
            <p className="text-xs text-muted-foreground">Erros</p>
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {result.properties.map((property) => (
              <div
                key={property.id}
                className={`p-3 rounded-lg border ${
                  property.status === "success"
                    ? "bg-green-500/5 border-green-500/20"
                    : property.status === "warning"
                    ? "bg-yellow-500/5 border-yellow-500/20"
                    : "bg-red-500/5 border-red-500/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {property.status === "success" && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    )}
                    {property.status === "warning" && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    )}
                    {property.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{property.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Pasta: {property.folderName}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      property.status === "success"
                        ? "default"
                        : property.status === "warning"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {property.status === "success"
                      ? "Importado"
                      : property.status === "warning"
                      ? "Aviso"
                      : "Erro"}
                  </Badge>
                </div>

                {property.status === "success" && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {property.propertyType && (
                      <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                        <Building2 className="h-3 w-3" />
                        {property.propertyType}
                      </span>
                    )}
                    {property.bedrooms && (
                      <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                        <Bed className="h-3 w-3" />
                        {property.bedrooms} quartos
                      </span>
                    )}
                    {property.sizeM2 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                        <Ruler className="h-3 w-3" />
                        {property.sizeM2}m²
                      </span>
                    )}
                    {property.location && (
                      <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </span>
                    )}
                    {property.rentalValue && (
                      <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                        <DollarSign className="h-3 w-3" />
                        R$ {property.rentalValue.toLocaleString("pt-BR")}
                      </span>
                    )}
                  </div>
                )}

                {property.errorMessage && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {property.errorMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ImportReportCard;
