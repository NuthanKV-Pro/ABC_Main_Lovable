import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Salary from "./pages/Salary";
import HouseProperty from "./pages/HouseProperty";
import BusinessProfession from "./pages/BusinessProfession";
import CapitalGains from "./pages/CapitalGains";
import OtherSources from "./pages/OtherSources";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/salary" element={<Salary />} />
          <Route path="/hp" element={<HouseProperty />} />
          <Route path="/pgbp" element={<BusinessProfession />} />
          <Route path="/cg" element={<CapitalGains />} />
          <Route path="/os" element={<OtherSources />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
