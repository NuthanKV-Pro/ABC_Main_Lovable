import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface IncomeData {
  salary: number;
  hp: number;
  pgbp: number;
  cg: number;
  os: number;
}

interface UserProfile {
  name: string;
  pan: string;
  assessmentYear?: string;
}

// Tax calculation for New Regime (FY 2024-25)
const calculateNewRegimeTax = (income: number): number => {
  if (income <= 300000) return 0;
  if (income <= 700000) return (income - 300000) * 0.05;
  if (income <= 1000000) return 20000 + (income - 700000) * 0.1;
  if (income <= 1200000) return 20000 + 30000 + (income - 1000000) * 0.15;
  if (income <= 1500000) return 20000 + 30000 + 30000 + (income - 1200000) * 0.2;
  return 20000 + 30000 + 30000 + 60000 + (income - 1500000) * 0.3;
};

// Tax calculation for Old Regime
const calculateOldRegimeTax = (income: number): number => {
  if (income <= 250000) return 0;
  if (income <= 500000) return (income - 250000) * 0.05;
  if (income <= 1000000) return 12500 + (income - 500000) * 0.2;
  return 12500 + 100000 + (income - 1000000) * 0.3;
};

const calculateSurcharge = (income: number, taxAmount: number): number => {
  if (income <= 5000000) return 0;
  if (income <= 10000000) return taxAmount * 0.1;
  if (income <= 20000000) return taxAmount * 0.15;
  if (income <= 50000000) return taxAmount * 0.25;
  return taxAmount * 0.37;
};

export const exportTaxComputationReport = (
  incomeData: IncomeData,
  deductions: number,
  userProfile: UserProfile
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const gti = incomeData.salary + incomeData.hp + incomeData.pgbp + incomeData.cg + incomeData.os;
  const totalIncome = Math.max(0, gti - deductions);
  
  // Calculate taxes for both regimes
  const newRegimeTax = calculateNewRegimeTax(totalIncome);
  const oldRegimeTax = calculateOldRegimeTax(totalIncome - deductions);
  
  const newRegimeCess = Math.round(newRegimeTax * 0.04);
  const oldRegimeCess = Math.round(oldRegimeTax * 0.04);
  
  const newRegimeSurcharge = Math.round(calculateSurcharge(totalIncome, newRegimeTax));
  const oldRegimeSurcharge = Math.round(calculateSurcharge(totalIncome - deductions, oldRegimeTax));
  
  const newRegimeTotalTax = Math.round(newRegimeTax + newRegimeCess + newRegimeSurcharge);
  const oldRegimeTotalTax = Math.round(oldRegimeTax + oldRegimeCess + oldRegimeSurcharge);

  // Header
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('INCOME TAX COMPUTATION REPORT', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Assessment Year: ${userProfile.assessmentYear || '2025-26'}`, pageWidth / 2, 28, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 35, { align: 'center' });

  doc.setTextColor(0, 0, 0);

  // Assessee Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ASSESSEE DETAILS', 14, 52);
  
  autoTable(doc, {
    startY: 57,
    body: [
      ['Name of Assessee', userProfile.name],
      ['PAN', userProfile.pan],
      ['Assessment Year', userProfile.assessmentYear || '2025-26'],
      ['Status', 'Individual'],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 100 }
    }
  });

  // Income from All Heads
  let currentY = (doc as any).lastAutoTable?.finalY || 85;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INCOME FROM ALL HEADS', 14, currentY + 12);

  autoTable(doc, {
    startY: currentY + 17,
    head: [['Head of Income', 'Amount (₹)']],
    body: [
      ['1. Income from Salary', `₹${incomeData.salary.toLocaleString('en-IN')}`],
      ['2. Income from House Property', `₹${incomeData.hp.toLocaleString('en-IN')}`],
      ['3. Profits & Gains from Business/Profession', `₹${incomeData.pgbp.toLocaleString('en-IN')}`],
      ['4. Capital Gains', `₹${incomeData.cg.toLocaleString('en-IN')}`],
      ['5. Income from Other Sources', `₹${incomeData.os.toLocaleString('en-IN')}`],
    ],
    foot: [['Gross Total Income', `₹${gti.toLocaleString('en-IN')}`]],
    theme: 'striped',
    headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { halign: 'right', cellWidth: 50 }
    }
  });

  // Deductions
  currentY = (doc as any).lastAutoTable?.finalY || 130;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DEDUCTIONS UNDER CHAPTER VI-A', 14, currentY + 12);

  autoTable(doc, {
    startY: currentY + 17,
    body: [
      ['Gross Total Income', `₹${gti.toLocaleString('en-IN')}`],
      ['Less: Deductions under Chapter VI-A', `₹${deductions.toLocaleString('en-IN')}`],
    ],
    foot: [['Total Taxable Income', `₹${totalIncome.toLocaleString('en-IN')}`]],
    theme: 'plain',
    footStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 50 }
    }
  });

  // Tax Computation - New Regime
  currentY = (doc as any).lastAutoTable?.finalY || 175;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX COMPUTATION (NEW REGIME)', 14, currentY + 12);

  autoTable(doc, {
    startY: currentY + 17,
    body: [
      ['Tax on Total Income', `₹${newRegimeTax.toLocaleString('en-IN')}`],
      ['Add: Surcharge', `₹${newRegimeSurcharge.toLocaleString('en-IN')}`],
      ['Add: Health & Education Cess @ 4%', `₹${newRegimeCess.toLocaleString('en-IN')}`],
    ],
    foot: [['Total Tax Liability (New Regime)', `₹${newRegimeTotalTax.toLocaleString('en-IN')}`]],
    theme: 'plain',
    footStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 50 }
    }
  });

  // Tax Computation - Old Regime
  currentY = (doc as any).lastAutoTable?.finalY || 220;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX COMPUTATION (OLD REGIME)', 14, currentY + 12);

  autoTable(doc, {
    startY: currentY + 17,
    body: [
      ['Tax on Total Income', `₹${oldRegimeTax.toLocaleString('en-IN')}`],
      ['Add: Surcharge', `₹${oldRegimeSurcharge.toLocaleString('en-IN')}`],
      ['Add: Health & Education Cess @ 4%', `₹${oldRegimeCess.toLocaleString('en-IN')}`],
    ],
    foot: [['Total Tax Liability (Old Regime)', `₹${oldRegimeTotalTax.toLocaleString('en-IN')}`]],
    theme: 'plain',
    footStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 50 }
    }
  });

  // Recommendation Box
  currentY = (doc as any).lastAutoTable?.finalY || 265;
  
  const recommendedRegime = newRegimeTotalTax <= oldRegimeTotalTax ? 'New Regime' : 'Old Regime';
  const savings = Math.abs(newRegimeTotalTax - oldRegimeTotalTax);

  doc.setFillColor(240, 248, 255);
  doc.roundedRect(14, currentY + 8, pageWidth - 28, 25, 3, 3, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.roundedRect(14, currentY + 8, pageWidth - 28, 25, 3, 3, 'S');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 33, 33);
  doc.text('RECOMMENDATION', pageWidth / 2, currentY + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Based on your income, ${recommendedRegime} is more beneficial. You save ₹${savings.toLocaleString('en-IN')} compared to the other regime.`, pageWidth / 2, currentY + 27, { align: 'center' });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('This is a computer-generated report. No signature required.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Generated by ABC - AI Legal & Tax Co-pilot', pageWidth / 2, footerY + 5, { align: 'center' });

  // Save the PDF
  doc.save(`Tax_Computation_Report_${userProfile.assessmentYear || 'AY2025-26'}_${new Date().toISOString().split('T')[0]}.pdf`);
};
