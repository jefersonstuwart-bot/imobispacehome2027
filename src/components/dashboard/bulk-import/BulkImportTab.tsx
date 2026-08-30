import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileArchive, Image, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import BulkImportModal from "./BulkImportModal";
import ImportReportCard from "./ImportReportCard";
import { ImportResult } from "./types";

interface BulkImportTabProps {
  category: "sale" | "rent";
}

const BulkImportTab = ({ category }: BulkImportTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const categoryLabel = category === "sale" ? "Venda" : "Aluguel";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5 text-primary" />
            Importação de Imóveis para {categoryLabel}
          </CardTitle>
          <CardDescription>
            Faça upload de arquivos ZIP contendo pastas com imagens e PDFs de cada imóvel.
            A IA irá analisar e gerar descrições automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <FileArchive className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h4 className="font-medium">Arquivos ZIP</h4>
                <p className="text-sm text-muted-foreground">
                  Cada pasta dentro do ZIP representa um imóvel
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Image className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h4 className="font-medium">Imagens</h4>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG - Fotos do imóvel para galeria
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h4 className="font-medium">PDFs</h4>
                <p className="text-sm text-muted-foreground">
                  Memorial, anúncio ou material do imóvel
                </p>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Pronto para importar imóveis?
            </h3>
            <p className="text-muted-foreground mb-4">
              Clique no botão abaixo para iniciar a importação em lote
            </p>
            <Button size="lg" onClick={() => setIsModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              IMPORTAR IMÓVEIS EM LOTE
            </Button>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">Como organizar seus arquivos:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Crie uma pasta para cada imóvel com um nome identificador</li>
              <li>Adicione as fotos do imóvel (JPG/PNG) dentro da pasta</li>
              <li>Opcionalmente, adicione PDFs com informações do imóvel</li>
              <li>Compacte todas as pastas em um arquivo ZIP</li>
              <li>Faça upload do arquivo ZIP no sistema</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {importResult && (
        <ImportReportCard result={importResult} onDismiss={() => setImportResult(null)} />
      )}

      <BulkImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={category}
        onImportComplete={(result) => {
          setImportResult(result);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default BulkImportTab;
