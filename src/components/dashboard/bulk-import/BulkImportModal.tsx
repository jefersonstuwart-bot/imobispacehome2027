import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileArchive, X, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImportResult, ProcessingStatus, ExtractedPropertyData } from "./types";
import JSZip from "jszip";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: "sale" | "rent";
  onImportComplete: (result: ImportResult) => void;
}

const BulkImportModal = ({ isOpen, onClose, category, onImportComplete }: BulkImportModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categoryLabel = category === "sale" ? "Venda" : "Aluguel";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) =>
        file.type === "application/zip" ||
        file.type === "application/x-zip-compressed" ||
        file.name.endsWith(".zip")
    );

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Arquivos inválidos",
        description: "Apenas arquivos ZIP são aceitos",
        variant: "destructive",
      });
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const extractZipContents = async (zipFile: File): Promise<ExtractedPropertyData[]> => {
    const zip = new JSZip();
    const contents = await zip.loadAsync(zipFile);
    const properties: Map<string, ExtractedPropertyData> = new Map();

    for (const [path, zipEntry] of Object.entries(contents.files)) {
      if (zipEntry.dir) continue;

      const parts = path.split("/").filter(Boolean);
      if (parts.length < 2) continue;

      const folderName = parts[0];
      const fileName = parts[parts.length - 1];
      const ext = fileName.split(".").pop()?.toLowerCase();

      if (!properties.has(folderName)) {
        properties.set(folderName, {
          folderName,
          images: [],
          pdfs: [],
        });
      }

      const property = properties.get(folderName)!;
      const blob = await zipEntry.async("blob");

      if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") {
        const file = new File([blob], fileName, { type: `image/${ext === "jpg" ? "jpeg" : ext}` });
        property.images.push(file);
      } else if (ext === "pdf") {
        const file = new File([blob], fileName, { type: "application/pdf" });
        property.pdfs.push(file);
      }
    }

    return Array.from(properties.values());
  };

  const uploadImages = async (images: File[], propertyId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileName = `${propertyId}/${Date.now()}-${image.name}`;
      const { data, error } = await supabase.storage
        .from("property-images")
        .upload(fileName, image);

      if (error) {
        console.error("Error uploading image:", error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("property-images")
        .getPublicUrl(data.path);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const processImport = async () => {
    if (files.length === 0) {
      setError("Selecione pelo menos um arquivo ZIP");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const batchId = crypto.randomUUID();
    const result: ImportResult = {
      totalImported: 0,
      successCount: 0,
      errorCount: 0,
      warningCount: 0,
      properties: [],
      batchId,
    };

    try {
      // Extract all ZIP files
      setProcessingStatus({
        currentFolder: "Extraindo arquivos...",
        processedCount: 0,
        totalCount: 0,
        stage: "extracting",
      });

      let allProperties: ExtractedPropertyData[] = [];
      for (const file of files) {
        const extracted = await extractZipContents(file);
        allProperties = [...allProperties, ...extracted];
      }

      result.totalImported = allProperties.length;

      // Process each property
      for (let i = 0; i < allProperties.length; i++) {
        const property = allProperties[i];

        setProcessingStatus({
          currentFolder: property.folderName,
          processedCount: i,
          totalCount: allProperties.length,
          stage: "analyzing",
        });

        try {
          // Check if property has images
          if (property.images.length === 0) {
            result.warningCount++;
            result.properties.push({
              id: crypto.randomUUID(),
              folderName: property.folderName,
              name: property.folderName,
              description: "",
              propertyType: "",
              bedrooms: null,
              sizeM2: null,
              location: "",
              rentalValue: null,
              images: [],
              status: "warning",
              errorMessage: "Pasta sem imagens",
            });
            continue;
          }

          // Upload images first
          setProcessingStatus({
            currentFolder: property.folderName,
            processedCount: i,
            totalCount: allProperties.length,
            stage: "uploading",
          });

          const propertyId = crypto.randomUUID();
          const uploadedImages = await uploadImages(property.images, propertyId);

          // Analyze with AI
          setProcessingStatus({
            currentFolder: property.folderName,
            processedCount: i,
            totalCount: allProperties.length,
            stage: "analyzing",
          });

          const { data: aiData, error: aiError } = await supabase.functions.invoke(
            "analyze-property-batch",
            {
              body: {
                folderName: property.folderName,
                imageUrls: uploadedImages,
                hasPdf: property.pdfs.length > 0,
                category,
              },
            }
          );

          if (aiError) {
            throw new Error(aiError.message);
          }

          // Save to database
          setProcessingStatus({
            currentFolder: property.folderName,
            processedCount: i,
            totalCount: allProperties.length,
            stage: "saving",
          });

          const { error: insertError } = await supabase.from("properties").insert({
            id: propertyId,
            name: aiData.name || property.folderName,
            location: aiData.location || "Localização não identificada",
            description: aiData.description || "",
            ai_description: aiData.description || "",
            images: uploadedImages,
            category,
            property_type: aiData.propertyType || null,
            bedrooms: aiData.bedrooms || null,
            size_m2: aiData.sizeM2 || null,
            rental_value: category === "rent" ? aiData.rentalValue || null : null,
            import_batch_id: batchId,
            import_folder_name: property.folderName,
            is_active: true,
          });

          if (insertError) {
            throw new Error(insertError.message);
          }

          result.successCount++;
          result.properties.push({
            id: propertyId,
            folderName: property.folderName,
            name: aiData.name || property.folderName,
            description: aiData.description || "",
            propertyType: aiData.propertyType || "",
            bedrooms: aiData.bedrooms || null,
            sizeM2: aiData.sizeM2 || null,
            location: aiData.location || "",
            rentalValue: aiData.rentalValue || null,
            images: uploadedImages,
            status: "success",
          });
        } catch (err) {
          console.error("Error processing property:", err);
          result.errorCount++;
          result.properties.push({
            id: crypto.randomUUID(),
            folderName: property.folderName,
            name: property.folderName,
            description: "",
            propertyType: "",
            bedrooms: null,
            sizeM2: null,
            location: "",
            rentalValue: null,
            images: [],
            status: "error",
            errorMessage: err instanceof Error ? err.message : "Erro desconhecido",
          });
        }
      }

      onImportComplete(result);
      toast({
        title: "Importação concluída!",
        description: `${result.successCount} imóveis importados com sucesso`,
      });
    } catch (err) {
      console.error("Import error:", err);
      setError(err instanceof Error ? err.message : "Erro ao processar importação");
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
      setFiles([]);
    }
  };

  const progressPercent = processingStatus
    ? ((processingStatus.processedCount + 1) / processingStatus.totalCount) * 100
    : 0;

  const stageLabels = {
    extracting: "Extraindo arquivos...",
    analyzing: "Analisando com IA...",
    uploading: "Enviando imagens...",
    saving: "Salvando no banco...",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Imóveis em Lote - {categoryLabel}</DialogTitle>
          <DialogDescription>
            Faça upload de arquivos ZIP contendo pastas com imagens e PDFs de cada imóvel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isProcessing && (
            <>
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileArchive className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar arquivos ZIP
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Arquivos selecionados:</h4>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileArchive className="h-4 w-4 text-primary" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </>
          )}

          {isProcessing && processingStatus && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">
                  {stageLabels[processingStatus.stage]}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="text-sm text-muted-foreground">
                <p>Pasta atual: {processingStatus.currentFolder}</p>
                <p>
                  Processado: {processingStatus.processedCount} de{" "}
                  {processingStatus.totalCount} imóveis
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button onClick={processImport} disabled={isProcessing || files.length === 0}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                PROCESSAR IMPORTAÇÃO
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
