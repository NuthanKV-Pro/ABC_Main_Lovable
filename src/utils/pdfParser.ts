import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Set up the worker for legacy build (v3.x)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface ExtractedForm16Data {
  employerName: string;
  employerTAN: string;
  employerPAN: string;
  employeeNamePAN: string;
  officeAddress: string;
  employmentNature: string;
  grossSalary: number;
  basicSalary: number;
  hra: number;
  commission: number;
  dearnessAllowance: number;
  travelAllowance: number;
  esops: number;
  gift: number;
  bonus: number;
  freeFood: number;
  otherAllowances: number;
  perquisites: number;
  profitsInLieu: number;
  deductions80C: number;
  deductions80D: number;
  otherDeductions: number;
  taxableIncome: number;
  taxDeducted: number;
}

export interface ExtractedSalarySlipData {
  month: string;
  year: string;
  employeeName: string;
  employeeId: string;
  basicSalary: number;
  hra: number;
  dearnessAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  otherAllowances: number;
  bonus: number;
  grossEarnings: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
}

// Common regex patterns for Form 16
const PATTERNS = {
  tan: /\b([A-Z]{4}\d{5}[A-Z])\b/gi,
  pan: /\b([A-Z]{5}\d{4}[A-Z])\b/gi,
  amount: /₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/g,
  grossSalary: /gross\s*(?:total\s*)?(?:salary|income|earnings?)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  basicSalary: /basic\s*(?:salary|pay)?[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  hra: /(?:house\s*rent\s*allowance|hra|h\.r\.a)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  da: /(?:dearness\s*allowance|da|d\.a)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  conveyance: /(?:conveyance|transport|travel)\s*(?:allowance)?[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  bonus: /bonus[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  medical: /(?:medical|health)\s*(?:allowance|reimbursement)?[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  special: /special\s*(?:allowance|pay)?[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  lta: /(?:leave\s*travel|lta|l\.t\.a)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  pf: /(?:provident\s*fund|pf|p\.f|epf)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  professionalTax: /(?:professional\s*tax|pt|p\.t)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  incomeTax: /(?:income\s*tax|tds|tax\s*deducted)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  esops: /(?:esops?|stock\s*options?|rsu)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  perquisites: /perquisites?[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  section80C: /(?:80c|section\s*80c)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  section80D: /(?:80d|section\s*80d)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  netSalary: /(?:net\s*(?:salary|pay)|take\s*home)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  totalDeductions: /(?:total\s*deductions?)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  taxableIncome: /(?:total\s*taxable|taxable\s*income|income\s*chargeable)[\s:]*₹?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/i,
  employerName: /(?:name\s*(?:of\s*)?(?:the\s*)?employer|company\s*name|employer)[\s:]+([A-Za-z\s\.\,\&\(\)]+?)(?=\n|TAN|PAN|Address)/i,
  address: /(?:address|office\s*address|registered\s*office)[\s:]+([A-Za-z0-9\s\.\,\-\/\(\)]+?)(?=\n\n|TAN|PAN|$)/i,
  month: /(?:for\s*(?:the\s*)?month\s*(?:of)?|salary\s*(?:for|month)|pay\s*period)[\s:]*(\w+)\s*(\d{4})?/i,
};

// Parse amount string to number
const parseAmount = (str: string | undefined): number => {
  if (!str) return 0;
  const cleaned = str.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

// Extract text from PDF file
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

// Detect document type
export function detectDocumentType(text: string): 'form16' | 'salarySlip' | 'unknown' {
  const lowerText = text.toLowerCase();
  
  // Form 16 indicators
  const form16Indicators = [
    'form no. 16',
    'form 16',
    'form-16',
    'certificate under section 203',
    'section 192',
    'part a',
    'part b',
    'statement of income',
    'annual salary statement',
  ];
  
  // Salary slip indicators
  const salarySlipIndicators = [
    'pay slip',
    'payslip',
    'salary slip',
    'salary statement',
    'earnings and deductions',
    'net pay',
    'take home',
    'for the month',
    'monthly salary',
  ];
  
  const form16Score = form16Indicators.filter(ind => lowerText.includes(ind)).length;
  const salarySlipScore = salarySlipIndicators.filter(ind => lowerText.includes(ind)).length;
  
  if (form16Score > salarySlipScore && form16Score >= 1) {
    return 'form16';
  } else if (salarySlipScore > 0) {
    return 'salarySlip';
  }
  
  // Fallback: check for annual vs monthly amounts
  const amounts = text.match(PATTERNS.amount) || [];
  const largeAmounts = amounts.filter(a => parseAmount(a) > 100000).length;
  
  if (largeAmounts > 3) {
    return 'form16'; // Likely annual figures
  }
  
  return 'unknown';
}

// Parse Form 16 PDF
export function parseForm16(text: string): ExtractedForm16Data {
  const data: ExtractedForm16Data = {
    employerName: '',
    employerTAN: '',
    employerPAN: '',
    employeeNamePAN: '',
    officeAddress: '',
    employmentNature: 'private',
    grossSalary: 0,
    basicSalary: 0,
    hra: 0,
    commission: 0,
    dearnessAllowance: 0,
    travelAllowance: 0,
    esops: 0,
    gift: 0,
    bonus: 0,
    freeFood: 0,
    otherAllowances: 0,
    perquisites: 0,
    profitsInLieu: 0,
    deductions80C: 0,
    deductions80D: 0,
    otherDeductions: 0,
    taxableIncome: 0,
    taxDeducted: 0,
  };

  // Extract TAN (first one is usually employer's)
  const tans = text.match(PATTERNS.tan);
  if (tans && tans.length > 0) {
    data.employerTAN = tans[0].toUpperCase();
  }

  // Extract PANs (first is employer, second is employee typically)
  const pans = text.match(PATTERNS.pan);
  if (pans && pans.length > 0) {
    data.employerPAN = pans[0].toUpperCase();
    if (pans.length > 1) {
      data.employeeNamePAN = pans[1].toUpperCase();
    }
  }

  // Extract employer name
  const employerMatch = text.match(PATTERNS.employerName);
  if (employerMatch) {
    data.employerName = employerMatch[1].trim().replace(/\s+/g, ' ');
  }

  // Extract address
  const addressMatch = text.match(PATTERNS.address);
  if (addressMatch) {
    data.officeAddress = addressMatch[1].trim().replace(/\s+/g, ' ');
  }

  // Detect employment nature
  const lowerText = text.toLowerCase();
  if (lowerText.includes('central government') || lowerText.includes('state government') || lowerText.includes('government')) {
    data.employmentNature = 'government';
  } else if (lowerText.includes('pension')) {
    data.employmentNature = 'pension';
  }

  // Extract salary components
  const grossMatch = text.match(PATTERNS.grossSalary);
  if (grossMatch) data.grossSalary = parseAmount(grossMatch[1]);

  const basicMatch = text.match(PATTERNS.basicSalary);
  if (basicMatch) data.basicSalary = parseAmount(basicMatch[1]);

  const hraMatch = text.match(PATTERNS.hra);
  if (hraMatch) data.hra = parseAmount(hraMatch[1]);

  const daMatch = text.match(PATTERNS.da);
  if (daMatch) data.dearnessAllowance = parseAmount(daMatch[1]);

  const conveyanceMatch = text.match(PATTERNS.conveyance);
  if (conveyanceMatch) data.travelAllowance = parseAmount(conveyanceMatch[1]);

  const bonusMatch = text.match(PATTERNS.bonus);
  if (bonusMatch) data.bonus = parseAmount(bonusMatch[1]);

  const esopsMatch = text.match(PATTERNS.esops);
  if (esopsMatch) data.esops = parseAmount(esopsMatch[1]);

  const perquisitesMatch = text.match(PATTERNS.perquisites);
  if (perquisitesMatch) data.perquisites = parseAmount(perquisitesMatch[1]);

  // Extract deductions
  const section80CMatch = text.match(PATTERNS.section80C);
  if (section80CMatch) data.deductions80C = parseAmount(section80CMatch[1]);

  const section80DMatch = text.match(PATTERNS.section80D);
  if (section80DMatch) data.deductions80D = parseAmount(section80DMatch[1]);

  // Extract taxable income and tax deducted
  const taxableMatch = text.match(PATTERNS.taxableIncome);
  if (taxableMatch) data.taxableIncome = parseAmount(taxableMatch[1]);

  const tdsMatch = text.match(PATTERNS.incomeTax);
  if (tdsMatch) data.taxDeducted = parseAmount(tdsMatch[1]);

  // Calculate gross if not found
  if (data.grossSalary === 0) {
    data.grossSalary = data.basicSalary + data.hra + data.dearnessAllowance + 
      data.travelAllowance + data.bonus + data.esops + data.commission + 
      data.otherAllowances + data.perquisites;
  }

  // Estimate other allowances if gross is higher
  if (data.grossSalary > 0) {
    const knownComponents = data.basicSalary + data.hra + data.dearnessAllowance + 
      data.travelAllowance + data.bonus + data.esops + data.commission + data.perquisites;
    if (data.grossSalary > knownComponents) {
      data.otherAllowances = data.grossSalary - knownComponents;
    }
  }

  return data;
}

// Parse Salary Slip PDF
export function parseSalarySlip(text: string): ExtractedSalarySlipData {
  const data: ExtractedSalarySlipData = {
    month: '',
    year: '',
    employeeName: '',
    employeeId: '',
    basicSalary: 0,
    hra: 0,
    dearnessAllowance: 0,
    conveyanceAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    otherAllowances: 0,
    bonus: 0,
    grossEarnings: 0,
    providentFund: 0,
    professionalTax: 0,
    incomeTax: 0,
    otherDeductions: 0,
    totalDeductions: 0,
    netSalary: 0,
  };

  // Extract month and year
  const monthMatch = text.match(PATTERNS.month);
  if (monthMatch) {
    data.month = monthMatch[1];
    if (monthMatch[2]) {
      data.year = monthMatch[2];
    }
  }

  // Extract earnings
  const basicMatch = text.match(PATTERNS.basicSalary);
  if (basicMatch) data.basicSalary = parseAmount(basicMatch[1]);

  const hraMatch = text.match(PATTERNS.hra);
  if (hraMatch) data.hra = parseAmount(hraMatch[1]);

  const daMatch = text.match(PATTERNS.da);
  if (daMatch) data.dearnessAllowance = parseAmount(daMatch[1]);

  const conveyanceMatch = text.match(PATTERNS.conveyance);
  if (conveyanceMatch) data.conveyanceAllowance = parseAmount(conveyanceMatch[1]);

  const medicalMatch = text.match(PATTERNS.medical);
  if (medicalMatch) data.medicalAllowance = parseAmount(medicalMatch[1]);

  const specialMatch = text.match(PATTERNS.special);
  if (specialMatch) data.specialAllowance = parseAmount(specialMatch[1]);

  const bonusMatch = text.match(PATTERNS.bonus);
  if (bonusMatch) data.bonus = parseAmount(bonusMatch[1]);

  // Extract deductions
  const pfMatch = text.match(PATTERNS.pf);
  if (pfMatch) data.providentFund = parseAmount(pfMatch[1]);

  const ptMatch = text.match(PATTERNS.professionalTax);
  if (ptMatch) data.professionalTax = parseAmount(ptMatch[1]);

  const tdsMatch = text.match(PATTERNS.incomeTax);
  if (tdsMatch) data.incomeTax = parseAmount(tdsMatch[1]);

  const totalDeductionsMatch = text.match(PATTERNS.totalDeductions);
  if (totalDeductionsMatch) data.totalDeductions = parseAmount(totalDeductionsMatch[1]);

  // Extract net salary
  const netMatch = text.match(PATTERNS.netSalary);
  if (netMatch) data.netSalary = parseAmount(netMatch[1]);

  // Calculate gross earnings
  data.grossEarnings = data.basicSalary + data.hra + data.dearnessAllowance + 
    data.conveyanceAllowance + data.medicalAllowance + data.specialAllowance + 
    data.otherAllowances + data.bonus;

  // Calculate total deductions if not found
  if (data.totalDeductions === 0) {
    data.totalDeductions = data.providentFund + data.professionalTax + 
      data.incomeTax + data.otherDeductions;
  }

  // Calculate other deductions
  const knownDeductions = data.providentFund + data.professionalTax + data.incomeTax;
  if (data.totalDeductions > knownDeductions) {
    data.otherDeductions = data.totalDeductions - knownDeductions;
  }

  return data;
}

// Convert salary slip to Form 16 format (annualized)
export function salarySlipToForm16Format(slipData: ExtractedSalarySlipData, monthsCount: number = 12): ExtractedForm16Data {
  const multiplier = monthsCount;
  
  return {
    employerName: '',
    employerTAN: '',
    employerPAN: '',
    employeeNamePAN: '',
    officeAddress: '',
    employmentNature: 'private',
    grossSalary: slipData.grossEarnings * multiplier,
    basicSalary: slipData.basicSalary * multiplier,
    hra: slipData.hra * multiplier,
    commission: 0,
    dearnessAllowance: slipData.dearnessAllowance * multiplier,
    travelAllowance: slipData.conveyanceAllowance * multiplier,
    esops: 0,
    gift: 0,
    bonus: slipData.bonus * multiplier,
    freeFood: slipData.medicalAllowance * multiplier,
    otherAllowances: (slipData.specialAllowance + slipData.otherAllowances) * multiplier,
    perquisites: 0,
    profitsInLieu: 0,
    deductions80C: slipData.providentFund * multiplier, // PF is under 80C
    deductions80D: 0,
    otherDeductions: slipData.otherDeductions * multiplier,
    taxableIncome: slipData.grossEarnings * multiplier,
    taxDeducted: slipData.incomeTax * multiplier,
  };
}

// Main function to parse any document
export async function parseDocument(file: File): Promise<{
  type: 'form16' | 'salarySlip' | 'unknown';
  data: ExtractedForm16Data | ExtractedSalarySlipData | null;
  form16Data: ExtractedForm16Data | null;
  rawText: string;
}> {
  const text = await extractTextFromPDF(file);
  const type = detectDocumentType(text);
  
  let data: ExtractedForm16Data | ExtractedSalarySlipData | null = null;
  let form16Data: ExtractedForm16Data | null = null;
  
  if (type === 'form16') {
    data = parseForm16(text);
    form16Data = data as ExtractedForm16Data;
  } else if (type === 'salarySlip') {
    data = parseSalarySlip(text);
    form16Data = salarySlipToForm16Format(data as ExtractedSalarySlipData);
  }
  
  return { type, data, form16Data, rawText: text };
}

// Parse multiple salary slips and aggregate
export async function parseMultipleSalarySlips(files: File[]): Promise<{
  slips: ExtractedSalarySlipData[];
  aggregatedForm16Data: ExtractedForm16Data;
}> {
  const slips: ExtractedSalarySlipData[] = [];
  
  for (const file of files) {
    const text = await extractTextFromPDF(file);
    const slip = parseSalarySlip(text);
    slips.push(slip);
  }
  
  // Aggregate all slips
  const aggregated: ExtractedForm16Data = {
    employerName: '',
    employerTAN: '',
    employerPAN: '',
    employeeNamePAN: '',
    officeAddress: '',
    employmentNature: 'private',
    grossSalary: 0,
    basicSalary: 0,
    hra: 0,
    commission: 0,
    dearnessAllowance: 0,
    travelAllowance: 0,
    esops: 0,
    gift: 0,
    bonus: 0,
    freeFood: 0,
    otherAllowances: 0,
    perquisites: 0,
    profitsInLieu: 0,
    deductions80C: 0,
    deductions80D: 0,
    otherDeductions: 0,
    taxableIncome: 0,
    taxDeducted: 0,
  };
  
  for (const slip of slips) {
    aggregated.basicSalary += slip.basicSalary;
    aggregated.hra += slip.hra;
    aggregated.dearnessAllowance += slip.dearnessAllowance;
    aggregated.travelAllowance += slip.conveyanceAllowance;
    aggregated.bonus += slip.bonus;
    aggregated.freeFood += slip.medicalAllowance;
    aggregated.otherAllowances += slip.specialAllowance + slip.otherAllowances;
    aggregated.deductions80C += slip.providentFund;
    aggregated.otherDeductions += slip.otherDeductions;
    aggregated.taxDeducted += slip.incomeTax;
    aggregated.grossSalary += slip.grossEarnings;
  }
  
  aggregated.taxableIncome = aggregated.grossSalary;
  
  return { slips, aggregatedForm16Data: aggregated };
}
