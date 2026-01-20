import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

const contractTypes = [
  { value: "employment", label: "Employment Agreement" },
  { value: "nda", label: "Non-Disclosure Agreement (NDA)" },
  { value: "service", label: "Service Agreement" },
  { value: "rental", label: "Rental/Lease Agreement" },
  { value: "partnership", label: "Partnership Agreement" },
  { value: "sale", label: "Sale Agreement" },
  { value: "loan", label: "Loan Agreement" },
  { value: "consulting", label: "Consulting Agreement" },
  { value: "freelance", label: "Freelance Contract" },
  { value: "vendor", label: "Vendor Agreement" },
  { value: "licensing", label: "Licensing Agreement" },
  { value: "mou", label: "Memorandum of Understanding (MOU)" },
  { value: "joint-venture", label: "Joint Venture Agreement" },
  { value: "share-purchase", label: "Share Purchase Agreement" },
  { value: "power-of-attorney", label: "Power of Attorney" },
];

interface ContractDetails {
  contractType: string;
  party1Name: string;
  party1Address: string;
  party2Name: string;
  party2Address: string;
  effectiveDate: string;
  endDate: string;
  amount: string;
  purpose: string;
  terms: string;
  jurisdiction: string;
  witnessName: string;
}

const ContractDrafter = () => {
  const navigate = useNavigate();
  const [details, setDetails] = useState<ContractDetails>({
    contractType: "",
    party1Name: "",
    party1Address: "",
    party2Name: "",
    party2Address: "",
    effectiveDate: "",
    endDate: "",
    amount: "",
    purpose: "",
    terms: "",
    jurisdiction: "",
    witnessName: "",
  });
  const [generatedContract, setGeneratedContract] = useState<string>("");

  const handleChange = (field: keyof ContractDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const getContractLabel = (type: string) => {
    return contractTypes.find((c) => c.value === type)?.label || type;
  };

  const generateContract = () => {
    if (!details.contractType || !details.party1Name || !details.party2Name) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the contract type and both party names.",
        variant: "destructive",
      });
      return;
    }

    const contractLabel = getContractLabel(details.contractType);
    let contract = "";

    // Common header
    contract += `${contractLabel.toUpperCase()}\n\n`;
    contract += `This ${contractLabel} ("Agreement") is entered into on ${details.effectiveDate || "[DATE]"}\n\n`;
    contract += `BETWEEN:\n\n`;
    contract += `PARTY 1 (First Party):\n`;
    contract += `Name: ${details.party1Name}\n`;
    contract += `Address: ${details.party1Address || "[Address]"}\n\n`;
    contract += `AND\n\n`;
    contract += `PARTY 2 (Second Party):\n`;
    contract += `Name: ${details.party2Name}\n`;
    contract += `Address: ${details.party2Address || "[Address]"}\n\n`;
    contract += `${"─".repeat(60)}\n\n`;

    // Contract-specific clauses
    switch (details.contractType) {
      case "employment":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the First Party desires to employ the Second Party, and the Second Party desires to be employed by the First Party on the terms and conditions set forth herein.\n\n`;
        contract += `NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth, the parties agree as follows:\n\n`;
        contract += `1. POSITION AND DUTIES\n`;
        contract += `The Second Party shall serve as ${details.purpose || "[Position Title]"} and shall perform all duties and responsibilities as assigned.\n\n`;
        contract += `2. COMPENSATION\n`;
        contract += `The First Party shall pay the Second Party a salary of ₹${details.amount || "[Amount]"} per annum, payable in monthly installments.\n\n`;
        contract += `3. TERM OF EMPLOYMENT\n`;
        contract += `This Agreement shall commence on ${details.effectiveDate || "[Start Date]"} and shall continue until ${details.endDate || "[End Date]"} unless terminated earlier.\n\n`;
        break;

      case "nda":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the parties wish to explore a business relationship and in connection therewith may disclose confidential information to each other.\n\n`;
        contract += `1. DEFINITION OF CONFIDENTIAL INFORMATION\n`;
        contract += `"Confidential Information" means any data or information that is proprietary to the Disclosing Party.\n\n`;
        contract += `2. PURPOSE\n`;
        contract += `${details.purpose || "The parties wish to exchange confidential information for the purpose of exploring a potential business relationship."}\n\n`;
        contract += `3. NON-DISCLOSURE OBLIGATIONS\n`;
        contract += `The Receiving Party agrees to hold and maintain the Confidential Information in strict confidence.\n\n`;
        contract += `4. TERM\n`;
        contract += `This Agreement shall remain in effect from ${details.effectiveDate || "[Start Date]"} to ${details.endDate || "[End Date]"}.\n\n`;
        break;

      case "rental":
        contract += `LEASE AGREEMENT FOR PROPERTY\n\n`;
        contract += `1. PROPERTY DESCRIPTION\n`;
        contract += `${details.purpose || "The property being leased is located at [Property Address]."}\n\n`;
        contract += `2. LEASE TERM\n`;
        contract += `The lease shall commence on ${details.effectiveDate || "[Start Date]"} and end on ${details.endDate || "[End Date]"}.\n\n`;
        contract += `3. RENT\n`;
        contract += `The monthly rent shall be ₹${details.amount || "[Amount]"}, payable on the first day of each month.\n\n`;
        contract += `4. SECURITY DEPOSIT\n`;
        contract += `A security deposit equivalent to [Number] months' rent shall be paid upon signing.\n\n`;
        break;

      case "service":
        contract += `1. SCOPE OF SERVICES\n`;
        contract += `${details.purpose || "The Service Provider agrees to provide the following services: [Description of Services]"}\n\n`;
        contract += `2. COMPENSATION\n`;
        contract += `The Client shall pay the Service Provider ₹${details.amount || "[Amount]"} for the services rendered.\n\n`;
        contract += `3. TERM\n`;
        contract += `This Agreement shall be effective from ${details.effectiveDate || "[Start Date]"} to ${details.endDate || "[End Date]"}.\n\n`;
        break;

      case "partnership":
        contract += `1. FORMATION OF PARTNERSHIP\n`;
        contract += `The parties hereby form a partnership under the name "[Partnership Name]".\n\n`;
        contract += `2. PURPOSE\n`;
        contract += `${details.purpose || "The purpose of the partnership is to engage in [Business Activity]."}\n\n`;
        contract += `3. CAPITAL CONTRIBUTION\n`;
        contract += `Each partner shall contribute ₹${details.amount || "[Amount]"} as initial capital.\n\n`;
        contract += `4. PROFIT SHARING\n`;
        contract += `Profits and losses shall be shared equally between the partners.\n\n`;
        break;

      default:
        contract += `1. PURPOSE\n`;
        contract += `${details.purpose || "[Purpose of the Agreement]"}\n\n`;
        contract += `2. CONSIDERATION\n`;
        contract += `The amount involved is ₹${details.amount || "[Amount]"}.\n\n`;
        contract += `3. TERM\n`;
        contract += `This Agreement shall be effective from ${details.effectiveDate || "[Start Date]"} to ${details.endDate || "[End Date]"}.\n\n`;
    }

    // Common clauses
    contract += `${"─".repeat(60)}\n\n`;
    contract += `GENERAL TERMS AND CONDITIONS:\n\n`;
    contract += `1. GOVERNING LAW\n`;
    contract += `This Agreement shall be governed by and construed in accordance with the laws of ${details.jurisdiction || "India"}.\n\n`;
    contract += `2. DISPUTE RESOLUTION\n`;
    contract += `Any disputes arising out of this Agreement shall be resolved through arbitration in ${details.jurisdiction || "[Jurisdiction]"}.\n\n`;
    contract += `3. ENTIRE AGREEMENT\n`;
    contract += `This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements.\n\n`;
    contract += `4. AMENDMENTS\n`;
    contract += `No amendment or modification of this Agreement shall be valid unless made in writing and signed by both parties.\n\n`;
    
    if (details.terms) {
      contract += `5. ADDITIONAL TERMS\n`;
      contract += `${details.terms}\n\n`;
    }

    contract += `${"─".repeat(60)}\n\n`;
    contract += `IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.\n\n\n`;
    contract += `PARTY 1:\n\n`;
    contract += `Signature: _________________________\n`;
    contract += `Name: ${details.party1Name}\n`;
    contract += `Date: _________________________\n\n\n`;
    contract += `PARTY 2:\n\n`;
    contract += `Signature: _________________________\n`;
    contract += `Name: ${details.party2Name}\n`;
    contract += `Date: _________________________\n\n\n`;
    
    if (details.witnessName) {
      contract += `WITNESS:\n\n`;
      contract += `Signature: _________________________\n`;
      contract += `Name: ${details.witnessName}\n`;
      contract += `Date: _________________________\n`;
    }

    setGeneratedContract(contract);
    toast({
      title: "Contract Generated",
      description: "Your contract has been drafted successfully.",
    });
  };

  const exportToPDF = () => {
    if (!generatedContract) {
      toast({
        title: "No Contract",
        description: "Please generate a contract first.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    const contractLabel = getContractLabel(details.contractType);
    
    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(contractLabel, 105, 15, { align: "center" });
    
    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const lines = doc.splitTextToSize(generatedContract, 180);
    let y = 35;
    const pageHeight = 280;
    
    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines[i], 15, y);
      y += 5;
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated by ABC - AI Legal & Tax Co-pilot | Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    }
    
    doc.save(`${contractLabel.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
    
    toast({
      title: "PDF Exported",
      description: "Your contract has been saved as PDF.",
    });
  };

  const handleReset = () => {
    setDetails({
      contractType: "",
      party1Name: "",
      party1Address: "",
      party2Name: "",
      party2Address: "",
      effectiveDate: "",
      endDate: "",
      amount: "",
      purpose: "",
      terms: "",
      jurisdiction: "",
      witnessName: "",
    });
    setGeneratedContract("");
    toast({
      title: "Form Reset",
      description: "All fields have been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Contract Drafter
                </h1>
                <p className="text-sm text-muted-foreground">Draft professional contracts instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={exportToPDF} disabled={!generatedContract}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Contract Type *</Label>
                <Select value={details.contractType} onValueChange={(v) => handleChange("contractType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Party 1 Name *</Label>
                  <Input
                    placeholder="First party name"
                    value={details.party1Name}
                    onChange={(e) => handleChange("party1Name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Party 1 Address</Label>
                  <Input
                    placeholder="First party address"
                    value={details.party1Address}
                    onChange={(e) => handleChange("party1Address", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Party 2 Name *</Label>
                  <Input
                    placeholder="Second party name"
                    value={details.party2Name}
                    onChange={(e) => handleChange("party2Name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Party 2 Address</Label>
                  <Input
                    placeholder="Second party address"
                    value={details.party2Address}
                    onChange={(e) => handleChange("party2Address", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={details.effectiveDate}
                    onChange={(e) => handleChange("effectiveDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={details.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Amount (₹)</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 50,000"
                    value={details.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Jurisdiction</Label>
                  <Input
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={details.jurisdiction}
                    onChange={(e) => handleChange("jurisdiction", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Purpose / Description</Label>
                <Textarea
                  placeholder="Describe the purpose or scope of the contract"
                  value={details.purpose}
                  onChange={(e) => handleChange("purpose", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Additional Terms</Label>
                <Textarea
                  placeholder="Any additional terms or conditions"
                  value={details.terms}
                  onChange={(e) => handleChange("terms", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Witness Name (Optional)</Label>
                <Input
                  placeholder="Witness full name"
                  value={details.witnessName}
                  onChange={(e) => handleChange("witnessName", e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={generateContract}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Contract
              </Button>
            </CardContent>
          </Card>

          {/* Generated Contract Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedContract ? (
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                  {generatedContract}
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Fill in the details and click "Generate Contract" to see the preview here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Disclaimer: This tool generates basic contract templates for reference purposes only. 
          Please consult a legal professional before using these contracts for official purposes.
        </p>
      </main>
    </div>
  );
};

export default ContractDrafter;
