import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText, Download, Plus } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { jsPDF } from "jspdf";

interface Receipt {
  month: string;
  year: string;
  amount: number;
}

const RentReceiptGenerator = () => {
  const goBack = useGoBack();
  const [tenantName, setTenantName] = useState("");
  const [tenantPAN, setTenantPAN] = useState("");
  const [landlordName, setLandlordName] = useState("");
  const [landlordPAN, setLandlordPAN] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [startMonth, setStartMonth] = useState("April");
  const [startYear, setStartYear] = useState("2024");
  const [numberOfMonths, setNumberOfMonths] = useState("12");

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const generateReceipts = (): Receipt[] => {
    const receipts: Receipt[] = [];
    const rent = parseFloat(monthlyRent) || 0;
    const numMonths = parseInt(numberOfMonths) || 12;
    let monthIdx = months.indexOf(startMonth);
    let year = parseInt(startYear);

    for (let i = 0; i < numMonths; i++) {
      receipts.push({
        month: months[monthIdx],
        year: year.toString(),
        amount: rent
      });
      monthIdx++;
      if (monthIdx >= 12) {
        monthIdx = 0;
        year++;
      }
    }
    return receipts;
  };

  const downloadPDF = () => {
    const receipts = generateReceipts();
    const doc = new jsPDF();
    
    receipts.forEach((receipt, index) => {
      if (index > 0) doc.addPage();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("RENT RECEIPT", pageWidth / 2, 25, { align: "center" });
      
      // Receipt details
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const startY = 45;
      const lineHeight = 8;
      
      doc.text(`Receipt No: ${index + 1}`, 20, startY);
      doc.text(`Date: ${receipt.month} ${receipt.year}`, pageWidth - 60, startY);
      
      doc.line(20, startY + 5, pageWidth - 20, startY + 5);
      
      doc.text(`Received from: ${tenantName}`, 20, startY + lineHeight * 2);
      if (tenantPAN) {
        doc.text(`Tenant PAN: ${tenantPAN}`, 20, startY + lineHeight * 3);
      }
      
      doc.text(`Amount: Rs. ${receipt.amount.toLocaleString()}/-`, 20, startY + lineHeight * 4.5);
      doc.text(`(Rupees ${numberToWords(receipt.amount)} Only)`, 20, startY + lineHeight * 5.5);
      
      doc.text(`For rent of property at:`, 20, startY + lineHeight * 7);
      
      // Word wrap for address
      const splitAddress = doc.splitTextToSize(propertyAddress, pageWidth - 40);
      doc.text(splitAddress, 20, startY + lineHeight * 8);
      
      const addressEndY = startY + lineHeight * 8 + (splitAddress.length * 5);
      
      doc.text(`For the month of: ${receipt.month} ${receipt.year}`, 20, addressEndY + lineHeight * 2);
      
      // Landlord details
      doc.text(`Landlord Name: ${landlordName}`, 20, addressEndY + lineHeight * 4);
      if (landlordPAN) {
        doc.text(`Landlord PAN: ${landlordPAN}`, 20, addressEndY + lineHeight * 5);
      }
      
      // Signature line
      doc.text("_______________________", pageWidth - 70, addressEndY + lineHeight * 8);
      doc.text("Signature of Landlord", pageWidth - 70, addressEndY + lineHeight * 9);
      
      // Revenue stamp placeholder
      doc.setFontSize(9);
      doc.rect(20, addressEndY + lineHeight * 7, 40, 20);
      doc.text("Revenue", 28, addressEndY + lineHeight * 8.5);
      doc.text("Stamp", 30, addressEndY + lineHeight * 9.5);
      
      // Footer
      doc.setFontSize(8);
      doc.text("Note: This is a computer-generated receipt. Revenue stamp to be affixed for rent > Rs. 5,000", 20, 280);
    });
    
    doc.save(`Rent_Receipts_FY${startYear}.pdf`);
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    
    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    };
    
    if (num >= 10000000) {
      return convertLessThanThousand(Math.floor(num / 10000000)) + ' Crore ' + numberToWords(num % 10000000);
    }
    if (num >= 100000) {
      return convertLessThanThousand(Math.floor(num / 100000)) + ' Lakh ' + numberToWords(num % 100000);
    }
    if (num >= 1000) {
      return convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand ' + numberToWords(num % 1000);
    }
    return convertLessThanThousand(num);
  };

  const receipts = generateReceipts();
  const totalRent = receipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Rent Receipt Generator</CardTitle>
              <CardDescription>Generate rent receipts for HRA claims</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tenant Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tenant Name *</Label>
                  <Input
                    placeholder="Your full name"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tenant PAN (optional)</Label>
                  <Input
                    placeholder="ABCDE1234F"
                    value={tenantPAN}
                    onChange={(e) => setTenantPAN(e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Landlord Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Landlord Name *</Label>
                  <Input
                    placeholder="Landlord's full name"
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Landlord PAN (required if rent &gt; ₹1L/year)</Label>
                  <Input
                    placeholder="ABCDE1234F"
                    value={landlordPAN}
                    onChange={(e) => setLandlordPAN(e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Property & Rent Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Property Address *</Label>
                <Input
                  placeholder="Complete address of rented property"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label>Monthly Rent (₹) *</Label>
                  <Input
                    type="number"
                    placeholder="25000"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Start Month</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                  >
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Start Year</Label>
                  <Input
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Number of Months</Label>
                  <Input
                    type="number"
                    value={numberOfMonths}
                    onChange={(e) => setNumberOfMonths(e.target.value)}
                    min="1"
                    max="12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">Receipt Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {receipts.length} receipt(s) • {receipts[0]?.month} {receipts[0]?.year} to {receipts[receipts.length - 1]?.month} {receipts[receipts.length - 1]?.year}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Rent</p>
                  <p className="text-2xl font-bold text-primary">₹{totalRent.toLocaleString()}</p>
                </div>
              </div>
              
              <Button 
                onClick={downloadPDF} 
                className="w-full"
                disabled={!tenantName || !landlordName || !propertyAddress || !monthlyRent}
              >
                <Download className="h-4 w-4 mr-2" />
                Download All Receipts (PDF)
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">⚠️ Important Notes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Landlord PAN is mandatory if annual rent exceeds ₹1,00,000</li>
                <li>• Revenue stamp (₹1) required on receipts for rent &gt; ₹5,000</li>
                <li>• Keep original receipts for at least 6 years</li>
                <li>• HRA exemption requires actual rent payment proof</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default RentReceiptGenerator;
