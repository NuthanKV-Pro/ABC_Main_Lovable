import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface IncomeRow {
  particulars: string;
  income: string;
  exemption: string;
  taxableIncome: string;
}

interface EmployerDetails {
  employerName: string;
  officeAddress: string;
  employmentNature: string;
}

export const exportSalaryReport = (
  incomeData: IncomeRow[],
  employerDetails: EmployerDetails,
  totals: { income: number; exemption: number; taxableIncome: number }
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Salary Income Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 30, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Employer Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Employer Details', 14, 50);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const employerData = [
    ['Employer Name', employerDetails.employerName || 'Not specified'],
    ['Office Address', employerDetails.officeAddress || 'Not specified'],
    ['Nature of Employment', employerDetails.employmentNature || 'Not specified'],
  ];

  autoTable(doc, {
    startY: 55,
    body: employerData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 130 }
    }
  });

  // Income Details Section
  const finalY = (doc as any).lastAutoTable?.finalY || 85;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Income Details', 14, finalY + 15);

  const tableData = incomeData.map(row => [
    row.particulars,
    `₹${parseFloat(row.income || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    `₹${parseFloat(row.exemption || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    `₹${parseFloat(row.taxableIncome || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Particulars', 'Income (₹)', 'Exemption (₹)', 'Taxable Income (₹)']],
    body: tableData,
    foot: [[
      'Total',
      `₹${totals.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      `₹${totals.exemption.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      `₹${totals.taxableIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ]],
    theme: 'striped',
    headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    }
  });

  // Tax Calculation Section
  const incomeTableY = (doc as any).lastAutoTable?.finalY || 150;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Tax Calculation (New Regime)', 14, incomeTableY + 15);

  const taxableIncome = totals.taxableIncome;
  
  // Calculate tax slabs
  const calculateTax = (income: number) => {
    if (income <= 300000) return 0;
    let tax = 0;
    let remaining = income;
    
    // 0-3L: 0%
    remaining -= 300000;
    if (remaining <= 0) return 0;
    
    // 3-7L: 5%
    const slab1 = Math.min(remaining, 400000);
    tax += slab1 * 0.05;
    remaining -= slab1;
    if (remaining <= 0) return tax;
    
    // 7-10L: 10%
    const slab2 = Math.min(remaining, 300000);
    tax += slab2 * 0.10;
    remaining -= slab2;
    if (remaining <= 0) return tax;
    
    // 10-12L: 15%
    const slab3 = Math.min(remaining, 200000);
    tax += slab3 * 0.15;
    remaining -= slab3;
    if (remaining <= 0) return tax;
    
    // 12-15L: 20%
    const slab4 = Math.min(remaining, 300000);
    tax += slab4 * 0.20;
    remaining -= slab4;
    if (remaining <= 0) return tax;
    
    // >15L: 30%
    tax += remaining * 0.30;
    
    return tax;
  };

  const baseTax = calculateTax(taxableIncome);
  const cess = baseTax * 0.04;
  const totalTax = baseTax + cess;

  const taxData = [
    ['Gross Total Income', `₹${taxableIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
    ['Tax on Income', `₹${baseTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
    ['Health & Education Cess (4%)', `₹${cess.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
    ['Total Tax Liability', `₹${totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
  ];

  autoTable(doc, {
    startY: incomeTableY + 20,
    body: taxData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', cellWidth: 60 }
    }
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('This is a computer-generated report. No signature required.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Generated by ABC - AI Legal & Tax Co-pilot', pageWidth / 2, footerY + 5, { align: 'center' });

  // Save the PDF
  doc.save(`Salary_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
