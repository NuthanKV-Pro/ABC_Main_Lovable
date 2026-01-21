// Centralized search data for modules and tools
// Add new routes here and they will automatically appear in the search dropdown

export interface SearchItem {
  name: string;
  route: string;
  category: string;
  keywords?: string[];
}

// Income Modules
export const incomeModules: SearchItem[] = [
  { name: "Salary Income", route: "/salary", category: "Income Modules", keywords: ["salary", "income", "wages"] },
  { name: "House Property", route: "/hp", category: "Income Modules", keywords: ["house", "property", "rental", "rent"] },
  { name: "Business & Profession", route: "/pgbp", category: "Income Modules", keywords: ["business", "profession", "pgbp", "self-employed"] },
  { name: "Capital Gains", route: "/cg", category: "Income Modules", keywords: ["capital", "gains", "shares", "stocks", "property sale"] },
  { name: "Other Sources", route: "/os", category: "Income Modules", keywords: ["other", "sources", "interest", "dividend"] },
];

// Tax Modules
export const taxModules: SearchItem[] = [
  { name: "Deductions", route: "/deductions", category: "Tax Modules", keywords: ["deductions", "80c", "80d", "section"] },
  { name: "Exempt Income", route: "/exempt-income", category: "Tax Modules", keywords: ["exempt", "income", "tax-free"] },
  { name: "Regime Comparison", route: "/regime-comparison", category: "Tax Modules", keywords: ["regime", "old", "new", "comparison"] },
  { name: "Year Comparison", route: "/year-comparison", category: "Tax Modules", keywords: ["year", "comparison", "yoy"] },
  { name: "Tax Payments", route: "/tax-payments", category: "Tax Modules", keywords: ["tax", "payments", "advance", "tds"] },
  { name: "Total Income & Tax", route: "/total-income-tax", category: "Tax Modules", keywords: ["total", "income", "tax", "liability"] },
];

// Investment Calculators
export const investmentCalculators: SearchItem[] = [
  { name: "SIP Calculator", route: "/sip-calculator", category: "Investment Calculators", keywords: ["sip", "mutual fund", "investment"] },
  { name: "Lumpsum Calculator", route: "/lumpsum-calculator", category: "Investment Calculators", keywords: ["lumpsum", "one-time", "investment"] },
  { name: "PPF Calculator", route: "/ppf-calculator", category: "Investment Calculators", keywords: ["ppf", "public provident fund"] },
  { name: "FD Calculator", route: "/fd-calculator", category: "Investment Calculators", keywords: ["fd", "fixed deposit", "bank"] },
  { name: "RD Calculator", route: "/rd-calculator", category: "Investment Calculators", keywords: ["rd", "recurring deposit"] },
  { name: "NPS Calculator", route: "/nps-calculator", category: "Investment Calculators", keywords: ["nps", "national pension", "retirement"] },
  { name: "NSC Calculator", route: "/nsc-calculator", category: "Investment Calculators", keywords: ["nsc", "national savings certificate"] },
  { name: "PF Calculator", route: "/pf-calculator", category: "Investment Calculators", keywords: ["pf", "provident fund", "epf"] },
  { name: "ELSS Calculator", route: "/elss-calculator", category: "Investment Calculators", keywords: ["elss", "tax saving", "mutual fund"] },
  { name: "SSY Calculator", route: "/ssy-calculator", category: "Investment Calculators", keywords: ["ssy", "sukanya samriddhi", "girl child"] },
  { name: "SCSS Calculator", route: "/scss-calculator", category: "Investment Calculators", keywords: ["scss", "senior citizen", "savings scheme"] },
  { name: "CAGR Calculator", route: "/cagr-calculator", category: "Investment Calculators", keywords: ["cagr", "compound annual growth rate"] },
  { name: "SWP Calculator", route: "/swp-calculator", category: "Investment Calculators", keywords: ["swp", "systematic withdrawal", "mutual fund"] },
  { name: "Tax Saving Comparison", route: "/tax-saving-comparison", category: "Investment Calculators", keywords: ["tax", "saving", "80c", "comparison"] },
];

// Loan Calculators
export const loanCalculators: SearchItem[] = [
  { name: "EMI Calculator", route: "/emi-calculator", category: "Loan Calculators", keywords: ["emi", "loan", "installment"] },
  { name: "Home Loan Eligibility", route: "/home-loan-eligibility", category: "Loan Calculators", keywords: ["home", "loan", "eligibility", "housing"] },
  { name: "Car Loan Calculator", route: "/car-loan-calculator", category: "Loan Calculators", keywords: ["car", "loan", "vehicle", "auto"] },
  { name: "Gold Loan Calculator", route: "/gold-loan-calculator", category: "Loan Calculators", keywords: ["gold", "loan", "jewellery"] },
  { name: "Education Loan Calculator", route: "/education-loan-calculator", category: "Loan Calculators", keywords: ["education", "loan", "student"] },
  { name: "Personal Loan Calculator", route: "/personal-loan-calculator", category: "Loan Calculators", keywords: ["personal", "loan", "credit score", "emi"] },
  { name: "Loan Advisor", route: "/loan-advisor", category: "Loan Calculators", keywords: ["loan", "advisor", "prepayment", "emi reduction"] },
  { name: "Loan Comparison", route: "/loan-comparison", category: "Loan Calculators", keywords: ["loan", "comparison", "offers", "banks"] },
];

// Property & Home Calculators
export const propertyCalculators: SearchItem[] = [
  { name: "Rent vs Buy Calculator", route: "/rent-vs-buy", category: "Property & Home", keywords: ["rent", "buy", "home", "decision"] },
  { name: "Home Affordability Calculator", route: "/home-affordability", category: "Property & Home", keywords: ["home", "affordability", "budget", "house"] },
  { name: "Stamp Duty Calculator", route: "/stamp-duty-calculator", category: "Property & Home", keywords: ["stamp", "duty", "registration", "property"] },
];

// Financial Planning
export const financialPlanningTools: SearchItem[] = [
  { name: "Retirement Calculator", route: "/retirement-calculator", category: "Financial Planning", keywords: ["retirement", "corpus", "pension", "savings"] },
  { name: "Gratuity Calculator", route: "/gratuity-calculator", category: "Financial Planning", keywords: ["gratuity", "retirement", "employee"] },
  { name: "Emergency Fund Calculator", route: "/emergency-fund", category: "Financial Planning", keywords: ["emergency", "fund", "savings", "safety"] },
  { name: "Financial Goal Tracker", route: "/financial-goal-tracker", category: "Financial Planning", keywords: ["goal", "tracker", "planning", "savings"] },
  { name: "Budget Planner", route: "/budget-planner", category: "Financial Planning", keywords: ["budget", "planner", "expenses", "income"] },
  { name: "Net Worth Calculator", route: "/net-worth-calculator", category: "Financial Planning", keywords: ["net worth", "assets", "liabilities", "wealth"] },
  { name: "Debt-to-Income Calculator", route: "/debt-to-income", category: "Financial Planning", keywords: ["debt", "income", "ratio", "dti"] },
  { name: "Credit Score Calculator", route: "/credit-score-calculator", category: "Financial Planning", keywords: ["credit", "score", "cibil", "rating"] },
];

// Advanced Tools
export const advancedTools: SearchItem[] = [
  { name: "Capital Budgeting", route: "/capital-budgeting", category: "Advanced Tools", keywords: ["capital", "budgeting", "npv", "irr", "mirr", "payback"] },
  { name: "Contract Drafter", route: "/contract-drafter", category: "Advanced Tools", keywords: ["contract", "drafter", "agreement", "legal", "nda", "employment"] },
  { name: "Tax Loss Harvesting", route: "/tax-loss-harvesting", category: "Advanced Tools", keywords: ["tax", "loss", "harvesting", "capital gains", "offset"] },
  { name: "Financial Ratios", route: "/financial-ratios", category: "Advanced Tools", keywords: ["financial", "ratios", "analysis", "metrics"] },
  { name: "Insurance Premium Calculator", route: "/insurance-premium-calculator", category: "Advanced Tools", keywords: ["insurance", "premium", "term life", "health", "coverage"] },
  { name: "MF Overlap Analyzer", route: "/mf-overlap-analyzer", category: "Advanced Tools", keywords: ["mutual fund", "overlap", "portfolio", "duplicate", "holdings"] },
  { name: "Cash Flow Budgeting", route: "/cash-flow-budgeting", category: "Advanced Tools", keywords: ["cash flow", "budgeting", "inflow", "outflow", "projection"] },
  { name: "Factoring Tool", route: "/factoring-tool", category: "Advanced Tools", keywords: ["factoring", "receivables", "invoice", "discount", "financing"] },
  { name: "Dividend Decision Tool", route: "/dividend-decision", category: "Advanced Tools", keywords: ["dividend", "gordon", "lintner", "payout", "retention", "policy"] },
  { name: "Stock Portfolio Tracker", route: "/stock-portfolio", category: "Advanced Tools", keywords: ["stock", "portfolio", "equity", "shares", "p&l", "allocation"] },
  { name: "Goal-Based SIP Calculator", route: "/goal-sip-calculator", category: "Advanced Tools", keywords: ["goal", "sip", "target", "financial goal", "planning"] },
  { name: "Compound Interest Calculator", route: "/compound-interest", category: "Advanced Tools", keywords: ["compound", "interest", "step-up", "sip", "growth", "yearly"] },
  { name: "Inflation Impact Calculator", route: "/inflation-calculator", category: "Advanced Tools", keywords: ["inflation", "purchasing power", "real return", "nominal", "erosion"] },
  { name: "Tax Saver 80C Optimizer", route: "/80c-optimizer", category: "Advanced Tools", keywords: ["80c", "tax saver", "elss", "ppf", "nps", "deduction", "optimizer"] },
  { name: "Legal Interpretations", route: "/legal-interpretations", category: "Advanced Tools", keywords: ["legal", "case law", "court", "judgment", "precedent", "tribunal", "tax law", "analysis"] },
  { name: "Deduction Playground", route: "/deduction-playground", category: "Advanced Tools", keywords: ["deduction", "playground", "80c", "80d", "tax saving", "regime", "comparison", "roi"] },
];

// Pages & Settings
export const pages: SearchItem[] = [
  { name: "Dashboard", route: "/dashboard", category: "Pages", keywords: ["dashboard", "home", "overview"] },
  { name: "Profile Settings", route: "/profile", category: "Pages", keywords: ["profile", "settings", "account"] },
];

// Combine all search items
export const getAllSearchItems = (): SearchItem[] => {
  return [
    ...incomeModules,
    ...taxModules,
    ...investmentCalculators,
    ...loanCalculators,
    ...propertyCalculators,
    ...financialPlanningTools,
    ...advancedTools,
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
