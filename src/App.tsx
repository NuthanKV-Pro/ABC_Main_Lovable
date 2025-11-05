import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Salary from "./pages/Salary";
import HouseProperty from "./pages/HouseProperty";
import BusinessProfession from "./pages/BusinessProfession";
import CapitalGains from "./pages/CapitalGains";
import OtherSources from "./pages/OtherSources";
import Deductions from "./pages/Deductions";
import ExemptIncome from "./pages/ExemptIncome";
import RegimeComparison from "./pages/RegimeComparison";
import YearComparison from "./pages/YearComparison";
import TaxPayments from "./pages/TaxPayments";
import TotalIncomeTax from "./pages/TotalIncomeTax";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/salary" element={<Salary />} />
          <Route path="/hp" element={<HouseProperty />} />
          <Route path="/pgbp" element={<BusinessProfession />} />
          <Route path="/cg" element={<CapitalGains />} />
          <Route path="/os" element={<OtherSources />} />
          <Route path="/deductions" element={<Deductions />} />
          <Route path="/exempt-income" element={<ExemptIncome />} />
          <Route path="/regime-comparison" element={<RegimeComparison />} />
          <Route path="/year-comparison" element={<YearComparison />} />
          <Route path="/tax-payments" element={<TaxPayments />} />
          <Route path="/total-income-tax" element={<TotalIncomeTax />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
