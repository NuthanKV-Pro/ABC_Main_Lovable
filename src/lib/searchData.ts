// Centralized search data for modules and tools
// All items are sorted alphabetically within each category

export interface SearchItem {
  name: string;
  route: string;
  category: string;
  keywords?: string[];
}

// Helper function to sort items alphabetically by name
const sortAlphabetically = (items: SearchItem[]): SearchItem[] => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
};

// Modules (from Index.tsx)
export const modulesData: SearchItem[] = sortAlphabetically([
  { name: "Income Tax", route: "/dashboard", category: "Modules", keywords: ["income", "tax", "planning", "filing", "dashboard"] },
  { name: "GST", route: "external:https://abcgst1.lovable.app", category: "Modules", keywords: ["gst", "goods", "services", "tax"] },
  { name: "Financial Ratios", route: "/financial-ratios", category: "Modules", keywords: ["financial", "ratios", "metrics", "performance"] },
  { name: "MCA", route: "external:https://abcmca1.lovable.app", category: "Modules", keywords: ["mca", "ministry", "corporate", "affairs"] },
  { name: "MIS Reports", route: "external:https://abcmis1.lovable.app", category: "Modules", keywords: ["mis", "management", "information", "reports"] },
  { name: "Financial Statements", route: "/financial-statements", category: "Modules", keywords: ["financial", "statements", "balance sheet", "p&l", "cash flow"] },
  { name: "Legal Interpretations", route: "/legal-interpretations", category: "Modules", keywords: ["legal", "case law", "court", "judgment", "precedent", "tribunal"] },
]);

// Income Modules
export const incomeModules: SearchItem[] = sortAlphabetically([
  { name: "Salary Income", route: "/salary", category: "Income Modules", keywords: ["salary", "income", "wages"] },
  { name: "House Property", route: "/hp", category: "Income Modules", keywords: ["house", "property", "rental", "rent"] },
  { name: "Business & Profession", route: "/pgbp", category: "Income Modules", keywords: ["business", "profession", "pgbp", "self-employed"] },
  { name: "Capital Gains", route: "/cg", category: "Income Modules", keywords: ["capital", "gains", "shares", "stocks", "property sale"] },
  { name: "Other Sources", route: "/os", category: "Income Modules", keywords: ["other", "sources", "interest", "dividend"] },
]);

// Tax Modules
export const taxModules: SearchItem[] = sortAlphabetically([
  { name: "Deductions", route: "/deductions", category: "Tax Modules", keywords: ["deductions", "80c", "80d", "section"] },
  { name: "Exempt Income", route: "/exempt-income", category: "Tax Modules", keywords: ["exempt", "income", "tax-free"] },
  { name: "Regime Comparison", route: "/regime-comparison", category: "Tax Modules", keywords: ["regime", "old", "new", "comparison"] },
  { name: "Year Comparison", route: "/year-comparison", category: "Tax Modules", keywords: ["year", "comparison", "yoy"] },
  { name: "Tax Payments", route: "/tax-payments", category: "Tax Modules", keywords: ["tax", "payments", "advance", "tds"] },
  { name: "Total Income & Tax", route: "/total-income-tax", category: "Tax Modules", keywords: ["total", "income", "tax", "liability"] },
]);

// ⭐ Featured Tools
export const featuredTools: SearchItem[] = sortAlphabetically([
  { name: "Tax Loss Harvesting", route: "/tax-loss-harvesting", category: "⭐ Featured Tools", keywords: ["tax", "loss", "harvesting", "capital gains", "offset"] },
  { name: "Deduction Playground", route: "/deduction-playground", category: "⭐ Featured Tools", keywords: ["deduction", "playground", "80c", "80d", "tax saving", "regime", "comparison", "roi"] },
  { name: "Contract Drafter", route: "/contract-drafter", category: "⭐ Featured Tools", keywords: ["contract", "drafter", "agreement", "legal", "nda", "employment"] },
  { name: "Escrow", route: "/escrow", category: "⭐ Featured Tools", keywords: ["escrow", "secure", "transaction"] },
  { name: "Focus", route: "external:https://abcfocus.lovable.app", category: "⭐ Featured Tools", keywords: ["focus", "disconnect", "productivity", "concentration", "mindfulness"] },
  { name: "Insurance Real Return Calc", route: "external:https://abcinsurance1.lovable.app", category: "⭐ Featured Tools", keywords: ["insurance", "real return", "policy", "ulip", "endowment"] },
]);

// Tax Planning & Optimization
export const taxPlanningTools: SearchItem[] = sortAlphabetically([
  { name: "Tax Saver 80C Optimizer", route: "/80c-optimizer", category: "Tax Planning", keywords: ["80c", "tax saver", "elss", "ppf", "nps", "deduction", "optimizer"] },
  { name: "Tax Saving Comparison", route: "/tax-saving-comparison", category: "Tax Planning", keywords: ["tax", "saving", "80c", "comparison"] },
  { name: "Advance Tax Calculator", route: "external:https://abcadv1.lovable.app", category: "Tax Planning", keywords: ["advance", "tax", "quarterly", "payment"] },
  { name: "Salary Optimisation Engine", route: "external:https://abcsalop.lovable.app", category: "Tax Planning", keywords: ["salary", "optimisation", "structure", "ctc"] },
  { name: "HRA Calc", route: "external:https://abcsalop.lovable.app/hra-calc", category: "Tax Planning", keywords: ["hra", "house rent", "allowance"] },
]);

// Loan & EMI Calculators
export const loanTools: SearchItem[] = sortAlphabetically([
  { name: "EMI Calculator", route: "/emi-calculator", category: "Loan & EMI", keywords: ["emi", "loan", "installment"] },
  { name: "Home Loan Eligibility", route: "/home-loan-eligibility", category: "Loan & EMI", keywords: ["home", "loan", "eligibility", "housing"] },
  { name: "Car Loan EMI Calculator", route: "/car-loan-calculator", category: "Loan & EMI", keywords: ["car", "loan", "vehicle", "auto", "emi"] },
  { name: "Personal Loan Calculator", route: "/personal-loan-calculator", category: "Loan & EMI", keywords: ["personal", "loan", "credit score", "emi"] },
  { name: "Gold Loan Calculator", route: "/gold-loan-calculator", category: "Loan & EMI", keywords: ["gold", "loan", "jewellery"] },
  { name: "Education Loan Calculator", route: "/education-loan-calculator", category: "Loan & EMI", keywords: ["education", "loan", "student"] },
  { name: "Loan Advisor", route: "/loan-advisor", category: "Loan & EMI", keywords: ["loan", "advisor", "prepayment", "emi reduction"] },
  { name: "Loan Comparison Tool", route: "/loan-comparison", category: "Loan & EMI", keywords: ["loan", "comparison", "offers", "banks"] },
]);

// Investment Calculators
export const investmentTools: SearchItem[] = sortAlphabetically([
  { name: "SIP Calculator", route: "/sip-calculator", category: "Investments", keywords: ["sip", "mutual fund", "investment"] },
  { name: "Goal-Based SIP Calculator", route: "/goal-sip-calculator", category: "Investments", keywords: ["goal", "sip", "target", "financial goal", "planning"] },
  { name: "Lumpsum Calculator", route: "/lumpsum-calculator", category: "Investments", keywords: ["lumpsum", "one-time", "investment"] },
  { name: "SWP Calculator", route: "/swp-calculator", category: "Investments", keywords: ["swp", "systematic withdrawal", "mutual fund"] },
  { name: "ELSS Calculator", route: "/elss-calculator", category: "Investments", keywords: ["elss", "tax saving", "mutual fund"] },
  { name: "Compound Interest Calculator", route: "/compound-interest", category: "Investments", keywords: ["compound", "interest", "step-up", "sip", "growth", "yearly"] },
  { name: "CAGR Calculator", route: "/cagr-calculator", category: "Investments", keywords: ["cagr", "compound annual growth rate"] },
  { name: "MF Overlap Analyzer", route: "/mf-overlap-analyzer", category: "Investments", keywords: ["mutual fund", "overlap", "portfolio", "duplicate", "holdings"] },
  { name: "Stock Portfolio Tracker", route: "/stock-portfolio", category: "Investments", keywords: ["stock", "portfolio", "equity", "shares", "p&l", "allocation"] },
]);

// Savings & Deposits
export const savingsTools: SearchItem[] = sortAlphabetically([
  { name: "PPF Calculator", route: "/ppf-calculator", category: "Savings & Deposits", keywords: ["ppf", "public provident fund"] },
  { name: "FD Calculator", route: "/fd-calculator", category: "Savings & Deposits", keywords: ["fd", "fixed deposit", "bank"] },
  { name: "RD Calculator", route: "/rd-calculator", category: "Savings & Deposits", keywords: ["rd", "recurring deposit"] },
  { name: "NSC Calculator", route: "/nsc-calculator", category: "Savings & Deposits", keywords: ["nsc", "national savings certificate"] },
  { name: "NPS Calculator", route: "/nps-calculator", category: "Savings & Deposits", keywords: ["nps", "national pension", "retirement"] },
  { name: "PF Calculator", route: "/pf-calculator", category: "Savings & Deposits", keywords: ["pf", "provident fund", "epf"] },
  { name: "SCSS Calculator", route: "/scss-calculator", category: "Savings & Deposits", keywords: ["scss", "senior citizen", "savings scheme"] },
  { name: "SSY Calculator", route: "/ssy-calculator", category: "Savings & Deposits", keywords: ["ssy", "sukanya samriddhi", "girl child"] },
]);

// Retirement & Benefits
export const retirementTools: SearchItem[] = sortAlphabetically([
  { name: "Retirement Corpus Calculator", route: "/retirement-calculator", category: "Retirement & Benefits", keywords: ["retirement", "corpus", "pension", "savings"] },
  { name: "Gratuity Calculator", route: "/gratuity-calculator", category: "Retirement & Benefits", keywords: ["gratuity", "retirement", "employee"] },
  { name: "Emergency Fund Calculator", route: "/emergency-fund", category: "Retirement & Benefits", keywords: ["emergency", "fund", "savings", "safety"] },
  { name: "Insurance Premium Calculator", route: "/insurance-premium-calculator", category: "Retirement & Benefits", keywords: ["insurance", "premium", "term life", "health", "coverage"] },
]);

// Real Estate & Property
export const realEstateTools: SearchItem[] = sortAlphabetically([
  { name: "Rent vs Buy Calculator", route: "/rent-vs-buy", category: "Real Estate", keywords: ["rent", "buy", "home", "decision"] },
  { name: "Home Affordability Calculator", route: "/home-affordability", category: "Real Estate", keywords: ["home", "affordability", "budget", "house"] },
  { name: "Stamp Duty Calculator", route: "/stamp-duty-calculator", category: "Real Estate", keywords: ["stamp", "duty", "registration", "property"] },
]);

// Personal Finance & Planning
export const personalFinanceTools: SearchItem[] = sortAlphabetically([
  { name: "Budget Planner", route: "/budget-planner", category: "Personal Finance", keywords: ["budget", "planner", "expenses", "income"] },
  { name: "Net Worth Calculator", route: "/net-worth-calculator", category: "Personal Finance", keywords: ["net worth", "assets", "liabilities", "wealth"] },
  { name: "Financial Goal Tracker", route: "/financial-goal-tracker", category: "Personal Finance", keywords: ["goal", "tracker", "planning", "savings"] },
  { name: "Debt-to-Income Calculator", route: "/debt-to-income", category: "Personal Finance", keywords: ["debt", "income", "ratio", "dti"] },
  { name: "Credit Score Calculator", route: "/credit-score-calculator", category: "Personal Finance", keywords: ["credit", "score", "cibil", "rating"] },
  { name: "Inflation Impact Calculator", route: "/inflation-calculator", category: "Personal Finance", keywords: ["inflation", "purchasing power", "real return", "nominal", "erosion"] },
]);

// Business & Corporate Finance
export const businessTools: SearchItem[] = sortAlphabetically([
  { name: "Capital Budgeting", route: "/capital-budgeting", category: "Business Finance", keywords: ["capital", "budgeting", "npv", "irr", "mirr", "payback"] },
  { name: "Cash Flow Budgeting Tool", route: "/cash-flow-budgeting", category: "Business Finance", keywords: ["cash flow", "budgeting", "inflow", "outflow", "projection"] },
  { name: "Factoring Tool", route: "/factoring-tool", category: "Business Finance", keywords: ["factoring", "receivables", "invoice", "discount", "financing"] },
  { name: "Dividend Decision Tool", route: "/dividend-decision", category: "Business Finance", keywords: ["dividend", "gordon", "lintner", "payout", "retention", "policy"] },
  { name: "Product Builder", route: "external:https://abcprodev1.lovable.app", category: "Business Finance", keywords: ["product", "builder", "idea", "blueprint"] },
]);

// Pages & Settings
export const pages: SearchItem[] = sortAlphabetically([
  { name: "Dashboard", route: "/dashboard", category: "Pages", keywords: ["dashboard", "home", "overview"] },
  { name: "Profile Settings", route: "/profile", category: "Pages", keywords: ["profile", "settings", "account"] },
]);

// Coming Soon
export const comingSoonTools: SearchItem[] = sortAlphabetically([
  { name: "When to Sell?", route: null as unknown as string, category: "Coming Soon", keywords: ["when", "sell", "exit", "timing", "investment"] },
  { name: "Learning Games", route: null as unknown as string, category: "Coming Soon", keywords: ["learning", "games", "play", "education", "fun"] },
]);

// Combine all search items (already sorted within categories)
export const getAllSearchItems = (): SearchItem[] => {
  return [
    ...modulesData,
    ...incomeModules,
    ...taxModules,
    ...featuredTools,
    ...taxPlanningTools,
    ...loanTools,
    ...investmentTools,
    ...savingsTools,
    ...retirementTools,
    ...realEstateTools,
    ...personalFinanceTools,
    ...businessTools,
    ...pages,
    ...comingSoonTools,
  ];
};

// Get grouped search items
export const getGroupedSearchItems = (): Record<string, SearchItem[]> => {
  const allItems = getAllSearchItems();
  return allItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);
};
