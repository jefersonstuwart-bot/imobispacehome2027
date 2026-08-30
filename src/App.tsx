import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import Incorporadoras from "./pages/Incorporadoras";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import PropertyDetail from "./pages/PropertyDetail";
import ProposalForm from "./pages/ProposalForm";
import ProposalSuccess from "./pages/ProposalSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import PropertiesManagement from "./pages/dashboard/PropertiesManagement";
import BrokersManagement from "./pages/dashboard/BrokersManagement";
import ProposalsManagement from "./pages/dashboard/ProposalsManagement";
import BrokerDashboard from "./pages/dashboard/BrokerDashboard";
import BulkPropertyImport from "./pages/dashboard/BulkPropertyImport";
import SiteSettings from "./pages/dashboard/SiteSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider><Toaster /><Sonner /><BrowserRouter><Routes>
        <Route path="/" element={<Index />} />
        <Route path="/sobre-nos" element={<About />} />
        <Route path="/lancamentos" element={<Index />} />
        <Route path="/incorporadoras" element={<Incorporadoras />} />
        <Route path="/blog" element={<Index />} />
        <Route path="/contato" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/empreendimento/:id" element={<PropertyDetail />} />
        <Route path="/proposta/:propertyId" element={<ProposalForm />} />
        <Route path="/proposta-enviada" element={<ProposalSuccess />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsOfUse />} />
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/dashboard/empreendimentos" element={<PropertiesManagement />} />
        <Route path="/dashboard/importar-lote" element={<BulkPropertyImport />} />
        <Route path="/dashboard/configuracoes" element={<SiteSettings />} />
        <Route path="/dashboard/corretores" element={<BrokersManagement />} />
        <Route path="/dashboard/propostas" element={<ProposalsManagement />} />
        <Route path="/dashboard/corretor" element={<BrokerDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes></BrowserRouter></TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
