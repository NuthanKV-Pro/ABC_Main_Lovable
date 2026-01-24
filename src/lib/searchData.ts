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

// Amazing Tools (from Index.tsx - comprehensive list)
export const amazingTools: SearchItem[] = sortAlphabetically([
  { name: "Salary Optimisation Engine", route: "external:https://abcsalop1.lovable.app", category: "Amazing Tools", keywords: ["salary", "optimisation", "structure", "ctc"] },
  { name: "Tax Loss Harvesting", route: "/tax-loss-harvesting", category: "Amazing Tools", keywords: ["tax", "loss", "harvesting", "capital gains", "offset"] },
  { name: "Deduction Playground", route: "/deduction-playground", category: "Amazing Tools", keywords: ["deduction", "playground", "80c", "80d", "tax saving", "regime", "comparison", "roi"] },
  { name: "HRA Calc", route: "external:https://abcsalop1.lovable.app/hra-calc", category: "Amazing Tools", keywords: ["hra", "house rent", "allowance"] },
  { name: "Contract Drafter", route: "/contract-drafter", category: "Amazing Tools", keywords: ["contract", "drafter", "agreement", "legal", "nda", "employment"] },
  { name: "Escrow", route: "/escrow", category: "Amazing Tools", keywords: ["escrow", "secure", "transaction"] },
  { name: "EMI Calculator", route: "/emi-calculator", category: "Amazing Tools", keywords: ["emi", "loan", "installment"] },
  { name: "Gratuity Calculator", route: "/gratuity-calculator", category: "Amazing Tools", keywords: ["gratuity", "retirement", "employee"] },
  { name: "Retirement Corpus Calculator", route: "/retirement-calculator", category: "Amazing Tools", keywords: ["retirement", "corpus", "pension", "savings"] },
  { name: "SIP Calculator", route: "/sip-calculator", category: "Amazing Tools", keywords: ["sip", "mutual fund", "investment"] },
  { name: "PPF Calculator", route: "/ppf-calculator", category: "Amazing Tools", keywords: ["ppf", "public provident fund"] },
  { name: "FD Calculator", route: "/fd-calculator", category: "Amazing Tools", keywords: ["fd", "fixed deposit", "bank"] },
  { name: "Lumpsum Calculator", route: "/lumpsum-calculator", category: "Amazing Tools", keywords: ["lumpsum", "one-time", "investment"] },
  { name: "NPS Calculator", route: "/nps-calculator", category: "Amazing Tools", keywords: ["nps", "national pension", "retirement"] },
  { name: "NSC Calculator", route: "/nsc-calculator", category: "Amazing Tools", keywords: ["nsc", "national savings certificate"] },
  { name: "PF Calculator", route: "/pf-calculator", category: "Amazing Tools", keywords: ["pf", "provident fund", "epf"] },
  { name: "Tax Saving Comparison", route: "/tax-saving-comparison", category: "Amazing Tools", keywords: ["tax", "saving", "80c", "comparison"] },
  { name: "SSY Calculator", route: "/ssy-calculator", category: "Amazing Tools", keywords: ["ssy", "sukanya samriddhi", "girl child"] },
  { name: "CAGR Calculator", route: "/cagr-calculator", category: "Amazing Tools", keywords: ["cagr", "compound annual growth rate"] },
  { name: "RD Calculator", route: "/rd-calculator", category: "Amazing Tools", keywords: ["rd", "recurring deposit"] },
  { name: "SCSS Calculator", route: "/scss-calculator", category: "Amazing Tools", keywords: ["scss", "senior citizen", "savings scheme"] },
  { name: "Home Loan Eligibility", route: "/home-loan-eligibility", category: "Amazing Tools", keywords: ["home", "loan", "eligibility", "housing"] },
  { name: "ELSS Calculator", route: "/elss-calculator", category: "Amazing Tools", keywords: ["elss", "tax saving", "mutual fund"] },
  { name: "Credit Score Calculator", route: "/credit-score-calculator", category: "Amazing Tools", keywords: ["credit", "score", "cibil", "rating"] },
  { name: "Stamp Duty Calculator", route: "/stamp-duty-calculator", category: "Amazing Tools", keywords: ["stamp", "duty", "registration", "property"] },
  { name: "Car Loan EMI Calculator", route: "/car-loan-calculator", category: "Amazing Tools", keywords: ["car", "loan", "vehicle", "auto", "emi"] },
  { name: "Product Builder", route: "external:https://abcprodev1.lovable.app", category: "Amazing Tools", keywords: ["product", "builder", "idea", "blueprint"] },
  { name: "Gold Loan Calculator", route: "/gold-loan-calculator", category: "Amazing Tools", keywords: ["gold", "loan", "jewellery"] },
  { name: "Education Loan Calculator", route: "/education-loan-calculator", category: "Amazing Tools", keywords: ["education", "loan", "student"] },
  { name: "SWP Calculator", route: "/swp-calculator", category: "Amazing Tools", keywords: ["swp", "systematic withdrawal", "mutual fund"] },
  { name: "Loan Advisor", route: "/loan-advisor", category: "Amazing Tools", keywords: ["loan", "advisor", "prepayment", "emi reduction"] },
  { name: "Loan Comparison Tool", route: "/loan-comparison", category: "Amazing Tools", keywords: ["loan", "comparison", "offers", "banks"] },
  { name: "Rent vs Buy Calculator", route: "/rent-vs-buy", category: "Amazing Tools", keywords: ["rent", "buy", "home", "decision"] },
  { name: "Home Affordability Calculator", route: "/home-affordability", category: "Amazing Tools", keywords: ["home", "affordability", "budget", "house"] },
  { name: "Debt-to-Income Calculator", route: "/debt-to-income", category: "Amazing Tools", keywords: ["debt", "income", "ratio", "dti"] },
  { name: "Emergency Fund Calculator", route: "/emergency-fund", category: "Amazing Tools", keywords: ["emergency", "fund", "savings", "safety"] },
  { name: "Financial Goal Tracker", route: "/financial-goal-tracker", category: "Amazing Tools", keywords: ["goal", "tracker", "planning", "savings"] },
  { name: "Budget Planner", route: "/budget-planner", category: "Amazing Tools", keywords: ["budget", "planner", "expenses", "income"] },
  { name: "Net Worth Calculator", route: "/net-worth-calculator", category: "Amazing Tools", keywords: ["net worth", "assets", "liabilities", "wealth"] },
  { name: "Capital Budgeting", route: "/capital-budgeting", category: "Amazing Tools", keywords: ["capital", "budgeting", "npv", "irr", "mirr", "payback"] },
  { name: "Personal Loan Calculator", route: "/personal-loan-calculator", category: "Amazing Tools", keywords: ["personal", "loan", "credit score", "emi"] },
  { name: "Insurance Premium Calculator", route: "/insurance-premium-calculator", category: "Amazing Tools", keywords: ["insurance", "premium", "term life", "health", "coverage"] },
  { name: "MF Overlap Analyzer", route: "/mf-overlap-analyzer", category: "Amazing Tools", keywords: ["mutual fund", "overlap", "portfolio", "duplicate", "holdings"] },
  { name: "Cash Flow Budgeting Tool", route: "/cash-flow-budgeting", category: "Amazing Tools", keywords: ["cash flow", "budgeting", "inflow", "outflow", "projection"] },
  { name: "Factoring Tool", route: "/factoring-tool", category: "Amazing Tools", keywords: ["factoring", "receivables", "invoice", "discount", "financing"] },
  { name: "Dividend Decision Tool", route: "/dividend-decision", category: "Amazing Tools", keywords: ["dividend", "gordon", "lintner", "payout", "retention", "policy"] },
  { name: "Stock Portfolio Tracker", route: "/stock-portfolio", category: "Amazing Tools", keywords: ["stock", "portfolio", "equity", "shares", "p&l", "allocation"] },
  { name: "Goal-Based SIP Calculator", route: "/goal-sip-calculator", category: "Amazing Tools", keywords: ["goal", "sip", "target", "financial goal", "planning"] },
  { name: "Compound Interest Calculator", route: "/compound-interest", category: "Amazing Tools", keywords: ["compound", "interest", "step-up", "sip", "growth", "yearly"] },
  { name: "Inflation Impact Calculator", route: "/inflation-calculator", category: "Amazing Tools", keywords: ["inflation", "purchasing power", "real return", "nominal", "erosion"] },
  { name: "Tax Saver 80C Optimizer", route: "/80c-optimizer", category: "Amazing Tools", keywords: ["80c", "tax saver", "elss", "ppf", "nps", "deduction", "optimizer"] },
  { name: "Advance Tax Calculator", route: "external:https://abcadv1.lovable.app", category: "Amazing Tools", keywords: ["advance", "tax", "quarterly", "payment"] },
]);

// Pages & Settings
export const pages: SearchItem[] = sortAlphabetically([
  { name: "Dashboard", route: "/dashboard", category: "Pages", keywords: ["dashboard", "home", "overview"] },
  { name: "Profile Settings", route: "/profile", category: "Pages", keywords: ["profile", "settings", "account"] },
]);

// Combine all search items (already sorted within categories)
export const getAllSearchItems = (): SearchItem[] => {
  return [
    ...modulesData,
    ...incomeModules,
    ...taxModules,
    ...amazingTools,
    ...pages,
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
