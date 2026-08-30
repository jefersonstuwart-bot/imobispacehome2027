import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Home, FileText } from "lucide-react";
import BulkImportTab from "@/components/dashboard/bulk-import/BulkImportTab";
import OfflinePdfImporter from "@/components/dashboard/bulk-import/OfflinePdfImporter";

const BulkPropertyImport = () => {
  const [activeTab, setActiveTab] = useState<"sale" | "rent">("sale");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Gestão de catálogo</p>
          <h1 className="text-3xl font-bold text-foreground">Cadastrar empreendimentos</h1>
          <p className="mt-2 text-muted-foreground">Cadastre manualmente ou transforme um PDF em um cadastro editável sem depender de IA ou tokens.</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "sale" | "rent")}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="sale" className="flex items-center gap-2"><Building2 className="h-4 w-4" />Venda</TabsTrigger>
            <TabsTrigger value="rent" className="flex items-center gap-2"><Home className="h-4 w-4" />Aluguel</TabsTrigger>
          </TabsList>
          <TabsContent value="sale" className="mt-6 space-y-6">
            <OfflinePdfImporter category="sale" />
            <BulkImportTab category="sale" />
          </TabsContent>
          <TabsContent value="rent" className="mt-6 space-y-6">
            <OfflinePdfImporter category="rent" />
            <BulkImportTab category="rent" />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BulkPropertyImport;
