import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Salary from "./pages/Salary";
import FinancialRatios from "./pages/FinancialRatios";
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
import ProfileSettings from "./pages/ProfileSettings";
import EMICalculator from "./pages/EMICalculator";
import GratuityCalculator from "./pages/GratuityCalculator";
import RetirementCalculator from "./pages/RetirementCalculator";
import SIPCalculator from "./pages/SIPCalculator";
import PPFCalculator from "./pages/PPFCalculator";
import FDCalculator from "./pages/FDCalculator";
import LumpsumCalculator from "./pages/LumpsumCalculator";
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
          <Route path="/financial-ratios" element={<FinancialRatios />} />
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
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/emi-calculator" element={<EMICalculator />} />
          <Route path="/gratuity-calculator" element={<GratuityCalculator />} />
          <Route path="/retirement-calculator" element={<RetirementCalculator />} />
          <Route path="/sip-calculator" element={<SIPCalculator />} />
          <Route path="/ppf-calculator" element={<PPFCalculator />} />
          <Route path="/fd-calculator" element={<FDCalculator />} />
          <Route path="/lumpsum-calculator" element={<LumpsumCalculator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
