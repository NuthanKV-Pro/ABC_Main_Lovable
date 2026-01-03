import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface IncomeValues {
  salary: number;
  hp: number;
  pgbp: number;
  cg: number;
  os: number;
}

interface TaxEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  category: "itr" | "advance-tax" | "tds" | "tcs" | "other";
  applicableTo: string[];
  percentage?: string;
}

interface UserProfile {
  name: string;
  pan: string;
  assessmentYear?: string;
}

// Tax calendar events data
const taxCalendarEvents: TaxEvent[] = [
  { id: "itr-individual", title: "ITR Filing - Individuals (Non-Audit)", date: "July 31", description: "Due date for filing ITR for individuals, HUF, AOP, BOI (not requiring audit)", category: "itr", applicableTo: ["Individual", "HUF"] },
  { id: "itr-audit", title: "ITR Filing - Audit Cases", date: "October 31", description: "Due date for taxpayers requiring tax audit under section 44AB", category: "itr", applicableTo: ["Business", "Audit Required"] },
  { id: "itr-tp", title: "ITR Filing - Transfer Pricing", date: "November 30", description: "Due date for taxpayers with international/specified domestic transactions", category: "itr", applicableTo: ["Transfer Pricing"] },
  { id: "itr-revised", title: "Revised/Belated ITR", date: "December 31", description: "Last date to file revised or belated return for previous AY", category: "itr", applicableTo: ["All Assessees"] },
  { id: "adv-tax-q1", title: "Advance Tax - 1st Installment (15%)", date: "June 15", description: "15% of total advance tax liability", category: "advance-tax", applicableTo: ["All Assessees"], percentage: "15%" },
  { id: "adv-tax-q2", title: "Advance Tax - 2nd Installment (45%)", date: "September 15", description: "45% of total advance tax liability (cumulative)", category: "advance-tax", applicableTo: ["All Assessees"], percentage: "45%" },
  { id: "adv-tax-q3", title: "Advance Tax - 3rd Installment (75%)", date: "December 15", description: "75% of total advance tax liability (cumulative)", category: "advance-tax", applicableTo: ["All Assessees"], percentage: "75%" },
  { id: "adv-tax-q4", title: "Advance Tax - 4th Installment (100%)", date: "March 15", description: "100% of total advance tax liability", category: "advance-tax", applicableTo: ["All Assessees"], percentage: "100%" },
  { id: "tds-others", title: "TDS Payment", date: "7th of next month", description: "TDS deducted in a month to be deposited by 7th of following month", category: "tds", applicableTo: ["All Deductors"] },
  { id: "tds-q1-return", title: "TDS Return - Q1", date: "July 31", description: "Quarterly TDS return for April to June", category: "tds", applicableTo: ["All Deductors"] },
  { id: "tds-q2-return", title: "TDS Return - Q2", date: "October 31", description: "Quarterly TDS return for July to September", category: "tds", applicableTo: ["All Deductors"] },
  { id: "tds-q3-return", title: "TDS Return - Q3", date: "January 31", description: "Quarterly TDS return for October to December", category: "tds", applicableTo: ["All Deductors"] },
  { id: "tds-q4-return", title: "TDS Return - Q4", date: "May 31", description: "Quarterly TDS return for January to March", category: "tds", applicableTo: ["All Deductors"] },
  { id: "form-16", title: "Form 16 Issue", date: "June 15", description: "Employers must issue Form 16 to employees", category: "other", applicableTo: ["Employers"] },
  { id: "tax-audit", title: "Tax Audit Report", date: "September 30", description: "Due date for filing tax audit report under section 44AB", category: "other", applicableTo: ["Audit Required"] }
];

const investmentOptions = [
  { section: "80C", option: "ELSS Mutual Funds", lockIn: "3 years", returns: "10-15%", risk: "High", limit: "₹1.5L" },
  { section: "80C", option: "PPF", lockIn: "15 years", returns: "7.1%", risk: "Low", limit: "₹1.5L" },
  { section: "80C", option: "NSC", lockIn: "5 years", returns: "7.7%", risk: "Low", limit: "₹1.5L" },
  { section: "80C", option: "Tax Saver FD", lockIn: "5 years", returns: "6-7%", risk: "Low", limit: "₹1.5L" },
  { section: "80C", option: "SSY (Sukanya Samriddhi)", lockIn: "21 years", returns: "8.2%", risk: "Low", limit: "₹1.5L" },
  { section: "80D", option: "Health Insurance (Self)", lockIn: "1 year", returns: "N/A", risk: "Low", limit: "₹25K" },
  { section: "80D", option: "Health Insurance (Parents)", lockIn: "1 year", returns: "N/A", risk: "Low", limit: "₹50K" },
  { section: "80CCD(1B)", option: "NPS - Aggressive", lockIn: "Till 60", returns: "10-12%", risk: "High", limit: "₹50K" },
  { section: "80CCD(1B)", option: "NPS - Moderate", lockIn: "Till 60", returns: "8-10%", risk: "Medium", limit: "₹50K" },
  { section: "24(b)", option: "Home Loan Interest", lockIn: "N/A", returns: "N/A", risk: "N/A", limit: "₹2L" },
  { section: "80E", option: "Education Loan Interest", lockIn: "N/A", returns: "N/A", risk: "N/A", limit: "No Limit" },
  { section: "80G", option: "Donations to Approved Funds", lockIn: "N/A", returns: "N/A", risk: "N/A", limit: "Variable" },
];

export const exportTaxRecommendationsPDF = (
  incomeValues: IncomeValues,
  userProfile: UserProfile
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const grossIncome = Object.values(incomeValues).reduce((sum, val) => sum + val, 0);

  // Header
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX SAVINGS RECOMMENDATIONS', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Assessment Year: ${userProfile.assessmentYear || '2025-26'} | PAN: ${userProfile.pan}`, pageWidth / 2, 23, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 30, { align: 'center' });

  doc.setTextColor(0, 0, 0);

  // Income Summary
  let currentY = 45;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INCOME SUMMARY', 14, currentY);

  autoTable(doc, {
    startY: currentY + 5,
    body: [
      ['Name', userProfile.name],
      ['Gross Total Income', `₹${grossIncome.toLocaleString('en-IN')}`],
      ['Income Bracket', grossIncome <= 500000 ? '≤5L (Low)' : grossIncome <= 1000000 ? '5L-10L (Medium)' : grossIncome <= 2000000 ? '10L-20L (High)' : '>20L (Very High)'],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
  });

  // Investment Options Table
  currentY = (doc as any).lastAutoTable?.finalY || 75;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMMENDED INVESTMENT OPTIONS', 14, currentY + 12);

  autoTable(doc, {
    startY: currentY + 17,
    head: [['Section', 'Investment Option', 'Lock-in', 'Expected Returns', 'Risk', 'Limit']],
    body: investmentOptions.map(opt => [opt.section, opt.option, opt.lockIn, opt.returns, opt.risk, opt.limit]),
    theme: 'striped',
    headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 50 },
      2: { cellWidth: 22 },
      3: { cellWidth: 28 },
      4: { cellWidth: 18 },
      5: { cellWidth: 22 }
    }
  });

  // Tax Saving Tips
  currentY = (doc as any).lastAutoTable?.finalY || 150;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PERSONALIZED TAX SAVING TIPS', 14, currentY + 12);

  const tips = grossIncome <= 500000 
    ? ['Focus on PPF for guaranteed tax-free returns', 'ELSS is good if you can lock funds for 3 years', 'Basic health cover of ₹5L is sufficient']
    : grossIncome <= 1000000
    ? ['Maximize ELSS for better returns with equity exposure', 'Consider SSY if you have a daughter under 10', 'Family floater health insurance is cost-effective']
    : grossIncome <= 2000000
    ? ['Max out 80C with ELSS for highest potential returns', 'Go for ₹25L+ health cover with super top-up', 'Consider 80CCD(1B) for additional ₹50K deduction via NPS']
    : ['80C limit may feel insufficient - focus on quality investments', 'Premium comprehensive health cover with OPD benefits', 'NPS is efficient for retirement + tax planning'];

  autoTable(doc, {
    startY: currentY + 17,
    body: tips.map((tip, i) => [`${i + 1}.`, tip]),
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 10 } }
  });

  // Deduction Limits Summary
  currentY = (doc as any).lastAutoTable?.finalY || 200;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DEDUCTION LIMITS SUMMARY (OLD REGIME)', 14, currentY + 12);

  autoTable(doc, {
    startY: currentY + 17,
    head: [['Section', 'Description', 'Maximum Limit']],
    body: [
      ['80C', 'PPF, ELSS, LIC, NSC, Tax Saver FD, etc.', '₹1,50,000'],
      ['80CCD(1B)', 'Additional NPS contribution', '₹50,000'],
      ['80D', 'Health Insurance Premium (Self + Parents)', '₹75,000'],
      ['80E', 'Education Loan Interest', 'No Limit'],
      ['80G', 'Donations to approved funds', 'Variable'],
      ['80TTA/80TTB', 'Savings Account Interest', '₹10,000/₹50,000'],
      ['24(b)', 'Home Loan Interest (Self-occupied)', '₹2,00,000'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 }
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('This document is for informational purposes. Please consult a tax professional for personalized advice.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Generated by ABC - AI Legal & Tax Co-pilot', pageWidth / 2, footerY + 5, { align: 'center' });

  doc.save(`Tax_Recommendations_${userProfile.assessmentYear || 'AY2025-26'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportTaxCalendarPDF = (userProfile: UserProfile) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(46, 125, 50);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INCOME TAX CALENDAR', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Financial Year: ${(parseInt(userProfile.assessmentYear?.split('-')[0] || '2025') - 1)}-${userProfile.assessmentYear?.split('-')[0] || '25'}`, pageWidth / 2, 23, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 30, { align: 'center' });

  doc.setTextColor(0, 0, 0);

  // Group events by category
  const categories = ['itr', 'advance-tax', 'tds', 'other'] as const;
  const categoryLabels: Record<string, string> = {
    'itr': 'ITR FILING DEADLINES',
    'advance-tax': 'ADVANCE TAX INSTALLMENTS',
    'tds': 'TDS COMPLIANCE DATES',
    'other': 'OTHER IMPORTANT DATES'
  };
  const categoryColors: Record<string, [number, number, number]> = {
    'itr': [33, 150, 243],
    'advance-tax': [76, 175, 80],
    'tds': [156, 39, 176],
    'other': [255, 152, 0]
  };

  let currentY = 45;

  categories.forEach(category => {
    const events = taxCalendarEvents.filter(e => e.category === category);
    if (events.length === 0) return;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(categoryLabels[category], 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Due Date', 'Event', 'Description', 'Applicable To']],
      body: events.map(e => [e.date, e.title, e.description, e.applicableTo.join(', ')]),
      theme: 'striped',
      headStyles: { fillColor: categoryColors[category], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 45 },
        2: { cellWidth: 65 },
        3: { cellWidth: 35 }
      }
    });

    currentY = (doc as any).lastAutoTable?.finalY + 10 || currentY + 50;

    // Add new page if needed
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
  });

  // Important Notes
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT NOTES:', 14, currentY + 5);

  autoTable(doc, {
    startY: currentY + 10,
    body: [
      ['•', 'Advance tax is applicable if tax liability exceeds ₹10,000 in a financial year'],
      ['•', 'Late filing of ITR attracts penalty u/s 234F (₹1,000 to ₹5,000)'],
      ['•', 'Interest u/s 234A, 234B, 234C is charged for delayed tax payment'],
      ['•', 'Senior citizens (60+) opting for presumptive taxation are exempt from advance tax'],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 8 } }
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Dates are subject to change as per government notifications.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Generated by ABC - AI Legal & Tax Co-pilot', pageWidth / 2, footerY + 5, { align: 'center' });

  doc.save(`Tax_Calendar_FY${(parseInt(userProfile.assessmentYear?.split('-')[0] || '2025') - 1)}-${userProfile.assessmentYear?.split('-')[0] || '25'}_${new Date().toISOString().split('T')[0]}.pdf`);
};
