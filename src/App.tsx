import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

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
import NPSCalculator from "./pages/NPSCalculator";
import NSCCalculator from "./pages/NSCCalculator";
import PFCalculator from "./pages/PFCalculator";
import TaxSavingComparison from "./pages/TaxSavingComparison";
import SSYCalculator from "./pages/SSYCalculator";
import CAGRCalculator from "./pages/CAGRCalculator";
import RDCalculator from "./pages/RDCalculator";
import SCSSCalculator from "./pages/SCSSCalculator";
import HomeLoanEligibility from "./pages/HomeLoanEligibility";
import ELSSCalculator from "./pages/ELSSCalculator";
import CreditScoreCalculator from "./pages/CreditScoreCalculator";
import StampDutyCalculator from "./pages/StampDutyCalculator";
import CarLoanCalculator from "./pages/CarLoanCalculator";
import GoldLoanCalculator from "./pages/GoldLoanCalculator";
import EducationLoanCalculator from "./pages/EducationLoanCalculator";
import SWPCalculator from "./pages/SWPCalculator";
import LoanAdvisor from "./pages/LoanAdvisor";
import LoanComparison from "./pages/LoanComparison";
import RentVsBuyCalculator from "./pages/RentVsBuyCalculator";
import HomeAffordabilityCalculator from "./pages/HomeAffordabilityCalculator";
import DebtToIncomeCalculator from "./pages/DebtToIncomeCalculator";
import EmergencyFundCalculator from "./pages/EmergencyFundCalculator";
import FinancialGoalTracker from "./pages/FinancialGoalTracker";
import BudgetPlanner from "./pages/BudgetPlanner";
import NetWorthCalculator from "./pages/NetWorthCalculator";
import CapitalBudgeting from "./pages/CapitalBudgeting";
import TaxLossHarvestingCalculator from "./pages/TaxLossHarvestingCalculator";
import PersonalLoanCalculator from "./pages/PersonalLoanCalculator";
import InsurancePremiumCalculator from "./pages/InsurancePremiumCalculator";
import MutualFundOverlapAnalyzer from "./pages/MutualFundOverlapAnalyzer";
import CashFlowBudgetingTool from "./pages/CashFlowBudgetingTool";
import FactoringTool from "./pages/FactoringTool";
import DividendDecisionTool from "./pages/DividendDecisionTool";
import StockPortfolioTracker from "./pages/StockPortfolioTracker";
import GoalBasedSIPCalculator from "./pages/GoalBasedSIPCalculator";
import CompoundInterestCalculator from "./pages/CompoundInterestCalculator";
import InflationImpactCalculator from "./pages/InflationImpactCalculator";
import TaxSaver80COptimizer from "./pages/TaxSaver80COptimizer";
import FinancialStatements from "./pages/FinancialStatements";
import ContractDrafter from "./pages/ContractDrafter";
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
          <Route path="/nps-calculator" element={<NPSCalculator />} />
          <Route path="/nsc-calculator" element={<NSCCalculator />} />
          <Route path="/pf-calculator" element={<PFCalculator />} />
          <Route path="/tax-saving-comparison" element={<TaxSavingComparison />} />
          <Route path="/ssy-calculator" element={<SSYCalculator />} />
          <Route path="/cagr-calculator" element={<CAGRCalculator />} />
          <Route path="/rd-calculator" element={<RDCalculator />} />
          <Route path="/scss-calculator" element={<SCSSCalculator />} />
          <Route path="/home-loan-eligibility" element={<HomeLoanEligibility />} />
          <Route path="/elss-calculator" element={<ELSSCalculator />} />
          <Route path="/credit-score-calculator" element={<CreditScoreCalculator />} />
          <Route path="/stamp-duty-calculator" element={<StampDutyCalculator />} />
          <Route path="/car-loan-calculator" element={<CarLoanCalculator />} />
          <Route path="/gold-loan-calculator" element={<GoldLoanCalculator />} />
          <Route path="/education-loan-calculator" element={<EducationLoanCalculator />} />
          <Route path="/swp-calculator" element={<SWPCalculator />} />
          <Route path="/loan-advisor" element={<LoanAdvisor />} />
          <Route path="/loan-comparison" element={<LoanComparison />} />
          <Route path="/rent-vs-buy" element={<RentVsBuyCalculator />} />
          <Route path="/home-affordability" element={<HomeAffordabilityCalculator />} />
          <Route path="/debt-to-income" element={<DebtToIncomeCalculator />} />
          <Route path="/emergency-fund" element={<EmergencyFundCalculator />} />
          <Route path="/financial-goal-tracker" element={<FinancialGoalTracker />} />
          <Route path="/budget-planner" element={<BudgetPlanner />} />
          <Route path="/net-worth-calculator" element={<NetWorthCalculator />} />
          <Route path="/capital-budgeting" element={<CapitalBudgeting />} />
          <Route path="/tax-loss-harvesting" element={<TaxLossHarvestingCalculator />} />
          <Route path="/personal-loan-calculator" element={<PersonalLoanCalculator />} />
          <Route path="/insurance-premium-calculator" element={<InsurancePremiumCalculator />} />
          <Route path="/mf-overlap-analyzer" element={<MutualFundOverlapAnalyzer />} />
          <Route path="/cash-flow-budgeting" element={<CashFlowBudgetingTool />} />
          <Route path="/factoring-tool" element={<FactoringTool />} />
          <Route path="/dividend-decision" element={<DividendDecisionTool />} />
          <Route path="/stock-portfolio" element={<StockPortfolioTracker />} />
          <Route path="/goal-sip-calculator" element={<GoalBasedSIPCalculator />} />
          <Route path="/compound-interest" element={<CompoundInterestCalculator />} />
          <Route path="/inflation-calculator" element={<InflationImpactCalculator />} />
          <Route path="/80c-optimizer" element={<TaxSaver80COptimizer />} />
          <Route path="/financial-statements" element={<FinancialStatements />} />
          <Route path="/contract-drafter" element={<ContractDrafter />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
