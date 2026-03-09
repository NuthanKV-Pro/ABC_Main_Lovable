import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import Index from "./pages/Index";
import Landing from "./pages/Landing";

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
import LegalInterpretations from "./pages/LegalInterpretations";
import DeductionPlayground from "./pages/DeductionPlayground";
import Escrow from "./pages/Escrow";
import ClauseFinder from "./pages/ClauseFinder";
import BusinessValuation from "./pages/BusinessValuation";
import TDSCalculator from "./pages/TDSCalculator";
import ITRFilingAssistant from "./pages/ITRFilingAssistant";
import GSTInvoiceGenerator from "./pages/GSTInvoiceGenerator";
import Section54Planner from "./pages/Section54Planner";
import SalaryRestructuring from "./pages/SalaryRestructuring";
import TaxAuditChecker from "./pages/TaxAuditChecker";
import WillEstatePlanner from "./pages/WillEstatePlanner";
import ForeignIncomeDTAA from "./pages/ForeignIncomeDTAA";
import ComplianceCalendar from "./pages/ComplianceCalendar";
import TaxNoticeAssistant from "./pages/TaxNoticeAssistant";
import HUFTaxPlanner from "./pages/HUFTaxPlanner";
import RegimeOptimizer from "./pages/RegimeOptimizer";
import FIRECalculator from "./pages/FIRECalculator";
import RealEstateROICalculator from "./pages/RealEstateROICalculator";
import WeddingBudgetPlanner from "./pages/WeddingBudgetPlanner";
import EducationCostPlanner from "./pages/EducationCostPlanner";
import StartupFundingGuide from "./pages/StartupFundingGuide";
import InvestmentModeComparison from "./pages/InvestmentModeComparison";
import InsuranceComparison from "./pages/InsuranceComparison";
import CompareAndDecide from "./pages/CompareAndDecide";
import LifeEventWizards from "./pages/LifeEventWizards";
import FinancialHealthScore from "./pages/FinancialHealthScore";
import SmartActionPlan from "./pages/SmartActionPlan";
import MyFinancialProfile from "./pages/MyFinancialProfile";
import QuickSummary from "./pages/QuickSummary";
import AISTISReconciliation from "./pages/AISTISReconciliation";
import PresumptiveTaxCalculator from "./pages/PresumptiveTaxCalculator";
import CryptoTaxCalculator from "./pages/CryptoTaxCalculator";
import NRITaxCalculator from "./pages/NRITaxCalculator";
import AssetAllocationOptimizer from "./pages/AssetAllocationOptimizer";
import IPOAnalysisTool from "./pages/IPOAnalysisTool";
import BondLadderCalculator from "./pages/BondLadderCalculator";
import HumanLifeValueCalculator from "./pages/HumanLifeValueCalculator";
import MultipleGoalsDashboard from "./pages/MultipleGoalsDashboard";
import InflationAdjustedCorpus from "./pages/InflationAdjustedCorpus";
import BreakevenAnalysis from "./pages/BreakevenAnalysis";
import WorkingCapitalCalculator from "./pages/WorkingCapitalCalculator";
import InvoiceAgingDashboard from "./pages/InvoiceAgingDashboard";
import SubscriptionAuditTool from "./pages/SubscriptionAuditTool";
import SideHustleTracker from "./pages/SideHustleTracker";
import ExpenseSplitCalculator from "./pages/ExpenseSplitCalculator";
import RentReceiptGenerator from "./pages/RentReceiptGenerator";
import EMIPrepaymentOptimizer from "./pages/EMIPrepaymentOptimizer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const BreadcrumbLayout = () => (
  <>
    <BreadcrumbNav />
    
    <Outlet />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          <Route element={<BreadcrumbLayout />}>
            <Route path="/prototypes" element={<Index />} />
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
            <Route path="/legal-interpretations" element={<LegalInterpretations />} />
            <Route path="/deduction-playground" element={<DeductionPlayground />} />
            <Route path="/escrow" element={<Escrow />} />
            <Route path="/clause-finder" element={<ClauseFinder />} />
            <Route path="/business-valuation" element={<BusinessValuation />} />
            <Route path="/tds-calculator" element={<TDSCalculator />} />
            <Route path="/itr-filing-assistant" element={<ITRFilingAssistant />} />
            <Route path="/gst-invoice-generator" element={<GSTInvoiceGenerator />} />
            <Route path="/section-54-planner" element={<Section54Planner />} />
            <Route path="/salary-restructuring" element={<SalaryRestructuring />} />
            <Route path="/tax-audit-checker" element={<TaxAuditChecker />} />
            <Route path="/will-estate-planner" element={<WillEstatePlanner />} />
            <Route path="/foreign-income-dtaa" element={<ForeignIncomeDTAA />} />
            <Route path="/compliance-calendar" element={<ComplianceCalendar />} />
            <Route path="/tax-notice-assistant" element={<TaxNoticeAssistant />} />
            <Route path="/huf-tax-planner" element={<HUFTaxPlanner />} />
            <Route path="/regime-optimizer" element={<RegimeOptimizer />} />
            <Route path="/fire-calculator" element={<FIRECalculator />} />
            <Route path="/real-estate-roi" element={<RealEstateROICalculator />} />
            <Route path="/wedding-budget-planner" element={<WeddingBudgetPlanner />} />
            <Route path="/education-cost-planner" element={<EducationCostPlanner />} />
            <Route path="/startup-funding-guide" element={<StartupFundingGuide />} />
            <Route path="/investment-mode-comparison" element={<InvestmentModeComparison />} />
            <Route path="/insurance-comparison" element={<InsuranceComparison />} />
            <Route path="/compare-and-decide" element={<CompareAndDecide />} />
            <Route path="/life-event-wizards" element={<LifeEventWizards />} />
            <Route path="/financial-health-score" element={<FinancialHealthScore />} />
            <Route path="/smart-action-plan" element={<SmartActionPlan />} />
            <Route path="/my-financial-profile" element={<MyFinancialProfile />} />
            <Route path="/quick-summary" element={<QuickSummary />} />
            <Route path="/ais-tis-reconciliation" element={<AISTISReconciliation />} />
            <Route path="/presumptive-tax" element={<PresumptiveTaxCalculator />} />
            <Route path="/crypto-tax" element={<CryptoTaxCalculator />} />
            <Route path="/nri-tax" element={<NRITaxCalculator />} />
            <Route path="/asset-allocation" element={<AssetAllocationOptimizer />} />
            <Route path="/ipo-analysis" element={<IPOAnalysisTool />} />
            <Route path="/bond-ladder" element={<BondLadderCalculator />} />
            <Route path="/human-life-value" element={<HumanLifeValueCalculator />} />
            <Route path="/multiple-goals" element={<MultipleGoalsDashboard />} />
            <Route path="/inflation-corpus" element={<InflationAdjustedCorpus />} />
            <Route path="/breakeven-analysis" element={<BreakevenAnalysis />} />
            <Route path="/working-capital" element={<WorkingCapitalCalculator />} />
            <Route path="/invoice-aging" element={<InvoiceAgingDashboard />} />
            <Route path="/subscription-audit" element={<SubscriptionAuditTool />} />
            <Route path="/side-hustle" element={<SideHustleTracker />} />
            <Route path="/expense-split" element={<ExpenseSplitCalculator />} />
            <Route path="/rent-receipt" element={<RentReceiptGenerator />} />
            <Route path="/emi-prepayment" element={<EMIPrepaymentOptimizer />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
