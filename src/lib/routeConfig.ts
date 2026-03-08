export interface RouteInfo {
  label: string;
  parent?: string; // parent route path
}

export const routeMap: Record<string, RouteInfo> = {
  "/": { label: "Home" },
  "/prototypes": { label: "Prototypes", parent: "/" },
  "/dashboard": { label: "Tax Dashboard", parent: "/prototypes" },

  // Dashboard sub-pages
  "/salary": { label: "Salary", parent: "/dashboard" },
  "/hp": { label: "House Property", parent: "/dashboard" },
  "/pgbp": { label: "Business & Profession", parent: "/dashboard" },
  "/cg": { label: "Capital Gains", parent: "/dashboard" },
  "/os": { label: "Other Sources", parent: "/dashboard" },
  "/deductions": { label: "Deductions", parent: "/dashboard" },
  "/exempt-income": { label: "Exempt Income", parent: "/dashboard" },
  "/regime-comparison": { label: "Regime Comparison", parent: "/dashboard" },
  "/year-comparison": { label: "Year Comparison", parent: "/dashboard" },
  "/tax-payments": { label: "Tax Payments", parent: "/dashboard" },
  "/total-income-tax": { label: "Total Income Tax", parent: "/dashboard" },
  "/profile": { label: "Profile Settings", parent: "/dashboard" },

  // Financial Calculators
  "/emi-calculator": { label: "EMI Calculator", parent: "/prototypes" },
  "/sip-calculator": { label: "SIP Calculator", parent: "/prototypes" },
  "/ppf-calculator": { label: "PPF Calculator", parent: "/prototypes" },
  "/fd-calculator": { label: "FD Calculator", parent: "/prototypes" },
  "/lumpsum-calculator": { label: "Lumpsum Calculator", parent: "/prototypes" },
  "/nps-calculator": { label: "NPS Calculator", parent: "/prototypes" },
  "/nsc-calculator": { label: "NSC Calculator", parent: "/prototypes" },
  "/pf-calculator": { label: "PF Calculator", parent: "/prototypes" },
  "/ssy-calculator": { label: "SSY Calculator", parent: "/prototypes" },
  "/cagr-calculator": { label: "CAGR Calculator", parent: "/prototypes" },
  "/rd-calculator": { label: "RD Calculator", parent: "/prototypes" },
  "/scss-calculator": { label: "SCSS Calculator", parent: "/prototypes" },
  "/elss-calculator": { label: "ELSS Calculator", parent: "/prototypes" },
  "/swp-calculator": { label: "SWP Calculator", parent: "/prototypes" },
  "/compound-interest": { label: "Compound Interest", parent: "/prototypes" },
  "/goal-sip-calculator": { label: "Goal-Based SIP", parent: "/prototypes" },
  "/gratuity-calculator": { label: "Gratuity Calculator", parent: "/prototypes" },
  "/retirement-calculator": { label: "Retirement Calculator", parent: "/prototypes" },

  // Loan & Property
  "/home-loan-eligibility": { label: "Home Loan Eligibility", parent: "/prototypes" },
  "/car-loan-calculator": { label: "Car Loan Calculator", parent: "/prototypes" },
  "/gold-loan-calculator": { label: "Gold Loan Calculator", parent: "/prototypes" },
  "/education-loan-calculator": { label: "Education Loan", parent: "/prototypes" },
  "/personal-loan-calculator": { label: "Personal Loan", parent: "/prototypes" },
  "/loan-advisor": { label: "Loan Advisor", parent: "/prototypes" },
  "/loan-comparison": { label: "Loan Comparison", parent: "/prototypes" },
  "/rent-vs-buy": { label: "Rent vs Buy", parent: "/prototypes" },
  "/home-affordability": { label: "Home Affordability", parent: "/prototypes" },
  "/stamp-duty-calculator": { label: "Stamp Duty Calculator", parent: "/prototypes" },

  // Financial Planning
  "/credit-score-calculator": { label: "Credit Score", parent: "/prototypes" },
  "/debt-to-income": { label: "Debt-to-Income", parent: "/prototypes" },
  "/emergency-fund": { label: "Emergency Fund", parent: "/prototypes" },
  "/financial-goal-tracker": { label: "Financial Goal Tracker", parent: "/prototypes" },
  "/budget-planner": { label: "Budget Planner", parent: "/prototypes" },
  "/net-worth-calculator": { label: "Net Worth Calculator", parent: "/prototypes" },
  "/insurance-premium-calculator": { label: "Insurance Premium", parent: "/prototypes" },
  "/inflation-calculator": { label: "Inflation Impact", parent: "/prototypes" },
  "/cash-flow-budgeting": { label: "Cash Flow Budgeting", parent: "/prototypes" },

  // Tax Tools
  "/tax-saving-comparison": { label: "Tax Saving Comparison", parent: "/prototypes" },
  "/tax-loss-harvesting": { label: "Tax Loss Harvesting", parent: "/prototypes" },
  "/80c-optimizer": { label: "80C Optimizer", parent: "/prototypes" },
  "/deduction-playground": { label: "Deduction Playground", parent: "/prototypes" },

  // Investment & Business
  "/financial-ratios": { label: "Financial Ratios", parent: "/prototypes" },
  "/capital-budgeting": { label: "Capital Budgeting", parent: "/prototypes" },
  "/mf-overlap-analyzer": { label: "MF Overlap Analyzer", parent: "/prototypes" },
  "/factoring-tool": { label: "Factoring Tool", parent: "/prototypes" },
  "/dividend-decision": { label: "Dividend Decision", parent: "/prototypes" },
  "/stock-portfolio": { label: "Stock Portfolio", parent: "/prototypes" },
  "/financial-statements": { label: "Financial Statements", parent: "/prototypes" },
  "/business-valuation": { label: "Business Valuation", parent: "/prototypes" },

  // Legal & Contract
  "/contract-drafter": { label: "Contract Drafter", parent: "/prototypes" },
  "/legal-interpretations": { label: "Legal Interpretations", parent: "/prototypes" },
  "/clause-finder": { label: "Clause Finder", parent: "/prototypes" },
  "/escrow": { label: "Escrow Simulator", parent: "/prototypes" },
  "/tds-calculator": { label: "TDS Calculator", parent: "/prototypes" },
  "/itr-filing-assistant": { label: "ITR Filing Assistant", parent: "/prototypes" },
  "/gst-invoice-generator": { label: "GST Invoice Generator", parent: "/prototypes" },
  "/section-54-planner": { label: "Section 54 Planner", parent: "/prototypes" },
  "/salary-restructuring": { label: "Salary Restructuring", parent: "/prototypes" },
  "/tax-audit-checker": { label: "Tax Audit Checker", parent: "/prototypes" },
  "/will-estate-planner": { label: "Will & Estate Planner", parent: "/prototypes" },
  "/foreign-income-dtaa": { label: "Foreign Income & DTAA", parent: "/prototypes" },
  "/compliance-calendar": { label: "Compliance Calendar", parent: "/prototypes" },
  "/tax-notice-assistant": { label: "Tax Notice Assistant", parent: "/prototypes" },
  "/huf-tax-planner": { label: "HUF Tax Planner", parent: "/prototypes" },
  "/regime-optimizer": { label: "Regime Optimizer", parent: "/prototypes" },
  "/fire-calculator": { label: "FIRE Calculator", parent: "/prototypes" },
  "/real-estate-roi": { label: "Real Estate ROI", parent: "/prototypes" },
  "/wedding-budget-planner": { label: "Wedding Budget Planner", parent: "/prototypes" },
  "/education-cost-planner": { label: "Education Cost Planner", parent: "/prototypes" },
  "/startup-funding-guide": { label: "Startup Funding Guide", parent: "/prototypes" },
  "/investment-mode-comparison": { label: "SIP vs Lumpsum vs RD", parent: "/prototypes" },
  "/insurance-comparison": { label: "Term vs Endowment vs ULIP", parent: "/prototypes" },
};

export function getBreadcrumbs(pathname: string): { label: string; path: string }[] {
  const crumbs: { label: string; path: string }[] = [];
  let current = pathname;

  while (current && routeMap[current]) {
    crumbs.unshift({ label: routeMap[current].label, path: current });
    current = routeMap[current].parent || "";
  }

  return crumbs;
}
