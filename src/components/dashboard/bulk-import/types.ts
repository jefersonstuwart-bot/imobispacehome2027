export interface ImportedProperty {
  id: string;
  folderName: string;
  name: string;
  description: string;
  propertyType: string;
  bedrooms: number | null;
  sizeM2: number | null;
  location: string;
  rentalValue: number | null;
  images: string[];
  status: "success" | "error" | "warning";
  errorMessage?: string;
}

export interface ImportResult {
  totalImported: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  properties: ImportedProperty[];
  batchId: string;
}

export interface ProcessingStatus {
  currentFolder: string;
  processedCount: number;
  totalCount: number;
  stage: "extracting" | "analyzing" | "uploading" | "saving";
}

export interface ExtractedPropertyData {
  folderName: string;
  images: File[];
  pdfs: File[];
}
