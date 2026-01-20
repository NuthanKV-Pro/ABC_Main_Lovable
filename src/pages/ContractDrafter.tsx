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
        contract += `4. PROBATION PERIOD\n`;
        contract += `The Second Party shall be on probation for a period of [Duration] from the date of joining.\n\n`;
        contract += `5. TERMINATION\n`;
        contract += `Either party may terminate this Agreement by giving [Notice Period] written notice.\n\n`;
        break;

      case "nda":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the parties wish to explore a business relationship and in connection therewith may disclose confidential information to each other.\n\n`;
        contract += `1. DEFINITION OF CONFIDENTIAL INFORMATION\n`;
        contract += `"Confidential Information" means any data or information that is proprietary to the Disclosing Party, including but not limited to trade secrets, business plans, financial information, customer lists, and technical data.\n\n`;
        contract += `2. PURPOSE\n`;
        contract += `${details.purpose || "The parties wish to exchange confidential information for the purpose of exploring a potential business relationship."}\n\n`;
        contract += `3. NON-DISCLOSURE OBLIGATIONS\n`;
        contract += `The Receiving Party agrees to hold and maintain the Confidential Information in strict confidence and shall not disclose it to any third party without prior written consent.\n\n`;
        contract += `4. RETURN OF INFORMATION\n`;
        contract += `Upon termination of this Agreement, all Confidential Information shall be returned or destroyed.\n\n`;
        contract += `5. TERM\n`;
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
        contract += `A security deposit equivalent to [Number] months' rent shall be paid upon signing and refunded at the end of tenancy subject to deductions.\n\n`;
        contract += `5. MAINTENANCE\n`;
        contract += `The Tenant shall maintain the property in good condition and report any damages promptly.\n\n`;
        contract += `6. UTILITIES\n`;
        contract += `The Tenant shall be responsible for payment of electricity, water, and other utility charges.\n\n`;
        break;

      case "service":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the First Party requires certain services and the Second Party is willing to provide such services.\n\n`;
        contract += `1. SCOPE OF SERVICES\n`;
        contract += `${details.purpose || "The Service Provider agrees to provide the following services: [Description of Services]"}\n\n`;
        contract += `2. COMPENSATION\n`;
        contract += `The Client shall pay the Service Provider ₹${details.amount || "[Amount]"} for the services rendered.\n\n`;
        contract += `3. PAYMENT TERMS\n`;
        contract += `Payment shall be made within [Number] days of invoice submission.\n\n`;
        contract += `4. TERM\n`;
        contract += `This Agreement shall be effective from ${details.effectiveDate || "[Start Date]"} to ${details.endDate || "[End Date]"}.\n\n`;
        contract += `5. INDEPENDENT CONTRACTOR\n`;
        contract += `The Service Provider is an independent contractor and not an employee of the Client.\n\n`;
        break;

      case "partnership":
        contract += `1. FORMATION OF PARTNERSHIP\n`;
        contract += `The parties hereby form a partnership under the name "[Partnership Name]".\n\n`;
        contract += `2. PURPOSE\n`;
        contract += `${details.purpose || "The purpose of the partnership is to engage in [Business Activity]."}\n\n`;
        contract += `3. CAPITAL CONTRIBUTION\n`;
        contract += `Each partner shall contribute ₹${details.amount || "[Amount]"} as initial capital.\n\n`;
        contract += `4. PROFIT AND LOSS SHARING\n`;
        contract += `Profits and losses shall be shared in the ratio of [Ratio] between the partners.\n\n`;
        contract += `5. MANAGEMENT\n`;
        contract += `All partners shall have equal rights in the management and conduct of the partnership business.\n\n`;
        contract += `6. WITHDRAWAL\n`;
        contract += `A partner may withdraw from the partnership by giving [Notice Period] written notice.\n\n`;
        break;

      case "sale":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the Seller desires to sell and the Buyer desires to purchase the goods/property described herein.\n\n`;
        contract += `1. DESCRIPTION OF GOODS/PROPERTY\n`;
        contract += `${details.purpose || "The Seller agrees to sell the following: [Description of Goods/Property]"}\n\n`;
        contract += `2. PURCHASE PRICE\n`;
        contract += `The total purchase price shall be ₹${details.amount || "[Amount]"}.\n\n`;
        contract += `3. PAYMENT TERMS\n`;
        contract += `Payment shall be made as follows: [Payment Schedule].\n\n`;
        contract += `4. DELIVERY\n`;
        contract += `The goods/property shall be delivered on or before ${details.endDate || "[Delivery Date]"}.\n\n`;
        contract += `5. TRANSFER OF TITLE\n`;
        contract += `Title and risk of loss shall pass to the Buyer upon delivery and full payment.\n\n`;
        contract += `6. WARRANTIES\n`;
        contract += `The Seller warrants that the goods/property are free from defects and encumbrances.\n\n`;
        break;

      case "loan":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the Lender agrees to lend and the Borrower agrees to borrow the sum specified herein.\n\n`;
        contract += `1. LOAN AMOUNT\n`;
        contract += `The Lender agrees to lend ₹${details.amount || "[Amount]"} to the Borrower.\n\n`;
        contract += `2. PURPOSE\n`;
        contract += `${details.purpose || "The loan shall be used for [Purpose of Loan]."}\n\n`;
        contract += `3. INTEREST RATE\n`;
        contract += `The loan shall bear interest at the rate of [Rate]% per annum.\n\n`;
        contract += `4. REPAYMENT\n`;
        contract += `The Borrower shall repay the loan in [Number] installments, commencing from ${details.effectiveDate || "[Start Date]"} until ${details.endDate || "[End Date]"}.\n\n`;
        contract += `5. SECURITY\n`;
        contract += `The loan shall be secured by [Collateral Description].\n\n`;
        contract += `6. DEFAULT\n`;
        contract += `In the event of default, the entire outstanding amount shall become immediately due and payable.\n\n`;
        break;

      case "consulting":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the Client requires consulting services and the Consultant has the expertise to provide such services.\n\n`;
        contract += `1. SCOPE OF CONSULTING SERVICES\n`;
        contract += `${details.purpose || "The Consultant shall provide the following consulting services: [Description of Services]"}\n\n`;
        contract += `2. COMPENSATION\n`;
        contract += `The Client shall pay the Consultant ₹${details.amount || "[Amount]"} for the consulting services.\n\n`;
        contract += `3. TERM\n`;
        contract += `This Agreement shall be effective from ${details.effectiveDate || "[Start Date]"} to ${details.endDate || "[End Date]"}.\n\n`;
        contract += `4. DELIVERABLES\n`;
        contract += `The Consultant shall deliver [List of Deliverables] within the agreed timeframe.\n\n`;
        contract += `5. INTELLECTUAL PROPERTY\n`;
        contract += `All intellectual property created during the engagement shall belong to the Client.\n\n`;
        contract += `6. CONFIDENTIALITY\n`;
        contract += `The Consultant agrees to maintain confidentiality of all proprietary information.\n\n`;
        break;

      case "freelance":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the Client wishes to engage the Freelancer for specific project work.\n\n`;
        contract += `1. PROJECT DESCRIPTION\n`;
        contract += `${details.purpose || "The Freelancer shall complete the following project: [Project Description]"}\n\n`;
        contract += `2. COMPENSATION\n`;
        contract += `The Client shall pay the Freelancer ₹${details.amount || "[Amount]"} for the project.\n\n`;
        contract += `3. TIMELINE\n`;
        contract += `The project shall commence on ${details.effectiveDate || "[Start Date]"} and be completed by ${details.endDate || "[End Date]"}.\n\n`;
        contract += `4. REVISIONS\n`;
        contract += `The Freelancer shall provide up to [Number] revisions at no additional cost.\n\n`;
        contract += `5. OWNERSHIP\n`;
        contract += `Upon full payment, all work product shall become the property of the Client.\n\n`;
        contract += `6. INDEPENDENT CONTRACTOR STATUS\n`;
        contract += `The Freelancer is an independent contractor and responsible for their own taxes.\n\n`;
        break;

      case "vendor":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the Company wishes to engage the Vendor for the supply of goods/services.\n\n`;
        contract += `1. GOODS/SERVICES\n`;
        contract += `${details.purpose || "The Vendor shall supply the following: [Description of Goods/Services]"}\n\n`;
        contract += `2. PRICING\n`;
        contract += `The total contract value is ₹${details.amount || "[Amount]"}.\n\n`;
        contract += `3. DELIVERY SCHEDULE\n`;
        contract += `Delivery shall be made as per the schedule from ${details.effectiveDate || "[Start Date]"} to ${details.endDate || "[End Date]"}.\n\n`;
        contract += `4. QUALITY STANDARDS\n`;
        contract += `All goods/services shall meet the quality specifications provided by the Company.\n\n`;
        contract += `5. PAYMENT TERMS\n`;
        contract += `Payment shall be made within [Number] days of delivery and acceptance.\n\n`;
        contract += `6. WARRANTIES\n`;
        contract += `The Vendor warrants that all goods are free from defects for a period of [Warranty Period].\n\n`;
        break;

      case "licensing":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the Licensor owns certain intellectual property and wishes to grant a license to the Licensee.\n\n`;
        contract += `1. GRANT OF LICENSE\n`;
        contract += `The Licensor hereby grants to the Licensee a [exclusive/non-exclusive] license to use ${details.purpose || "[Description of Licensed Property]"}.\n\n`;
        contract += `2. LICENSE FEE\n`;
        contract += `The Licensee shall pay ₹${details.amount || "[Amount]"} as license fee.\n\n`;
        contract += `3. TERRITORY\n`;
        contract += `This license is valid for [Territory/Region].\n\n`;
        contract += `4. TERM\n`;
        contract += `The license shall be effective from ${details.effectiveDate || "[Start Date]"} to ${details.endDate || "[End Date]"}.\n\n`;
        contract += `5. RESTRICTIONS\n`;
        contract += `The Licensee shall not sublicense, transfer, or modify the licensed property without prior consent.\n\n`;
        contract += `6. TERMINATION\n`;
        contract += `Either party may terminate this license upon [Notice Period] written notice for breach of terms.\n\n`;
        break;

      case "mou":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the parties wish to record their mutual understanding and intention to collaborate.\n\n`;
        contract += `1. PURPOSE\n`;
        contract += `${details.purpose || "The parties intend to collaborate on [Description of Collaboration]."}\n\n`;
        contract += `2. SCOPE\n`;
        contract += `This MOU outlines the framework for cooperation between the parties.\n\n`;
        contract += `3. RESPONSIBILITIES\n`;
        contract += `Each party shall contribute resources and expertise as mutually agreed.\n\n`;
        contract += `4. FINANCIAL ARRANGEMENT\n`;
        contract += `The estimated value of cooperation is ₹${details.amount || "[Amount]"}.\n\n`;
        contract += `5. DURATION\n`;
        contract += `This MOU shall be effective from ${details.effectiveDate || "[Start Date]"} to ${details.endDate || "[End Date]"}.\n\n`;
        contract += `6. NON-BINDING NATURE\n`;
        contract += `This MOU is a statement of intent and does not create legally binding obligations except for confidentiality.\n\n`;
        break;

      case "joint-venture":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the parties wish to form a joint venture for their mutual benefit.\n\n`;
        contract += `1. FORMATION OF JOINT VENTURE\n`;
        contract += `The parties hereby form a joint venture to be known as "[Joint Venture Name]".\n\n`;
        contract += `2. PURPOSE\n`;
        contract += `${details.purpose || "The purpose of the joint venture is to [Business Objective]."}\n\n`;
        contract += `3. CAPITAL CONTRIBUTION\n`;
        contract += `Each party shall contribute ₹${details.amount || "[Amount]"} representing [Percentage]% of total capital.\n\n`;
        contract += `4. PROFIT AND LOSS SHARING\n`;
        contract += `Profits and losses shall be shared in proportion to each party's capital contribution.\n\n`;
        contract += `5. MANAGEMENT AND CONTROL\n`;
        contract += `The joint venture shall be managed by a committee comprising representatives from each party.\n\n`;
        contract += `6. DURATION\n`;
        contract += `The joint venture shall commence on ${details.effectiveDate || "[Start Date]"} and continue until ${details.endDate || "[End Date]"} or until terminated by mutual consent.\n\n`;
        contract += `7. DECISION MAKING\n`;
        contract += `Major decisions shall require unanimous consent of all parties.\n\n`;
        contract += `8. INTELLECTUAL PROPERTY\n`;
        contract += `Any intellectual property created during the joint venture shall be jointly owned by the parties.\n\n`;
        contract += `9. EXIT STRATEGY\n`;
        contract += `Upon termination, assets shall be distributed in proportion to capital contributions.\n\n`;
        break;

      case "share-purchase":
        contract += `RECITALS:\n`;
        contract += `WHEREAS, the Seller is the legal owner of certain shares and wishes to sell them to the Buyer.\n\n`;
        contract += `1. SALE OF SHARES\n`;
        contract += `The Seller agrees to sell and the Buyer agrees to purchase [Number] shares of [Company Name].\n\n`;
        contract += `2. PURCHASE PRICE\n`;
        contract += `The total purchase price for the shares shall be ₹${details.amount || "[Amount]"}.\n\n`;
        contract += `3. DESCRIPTION OF SHARES\n`;
        contract += `${details.purpose || "The shares being sold are [Class] shares with a face value of ₹[Value] each."}\n\n`;
        contract += `4. PAYMENT TERMS\n`;
        contract += `The Buyer shall pay the purchase price on or before ${details.effectiveDate || "[Payment Date]"}.\n\n`;
        contract += `5. TRANSFER OF SHARES\n`;
        contract += `Upon receipt of payment, the Seller shall execute necessary transfer documents.\n\n`;
        contract += `6. REPRESENTATIONS AND WARRANTIES\n`;
        contract += `The Seller represents that:\n`;
        contract += `  a) The shares are free from encumbrances and claims.\n`;
        contract += `  b) The Seller has full authority to sell the shares.\n`;
        contract += `  c) All information provided about the company is accurate.\n\n`;
        contract += `7. CONDITIONS PRECEDENT\n`;
        contract += `Completion of this transaction is subject to regulatory approvals and board consent.\n\n`;
        contract += `8. INDEMNIFICATION\n`;
        contract += `The Seller shall indemnify the Buyer against any claims arising from pre-sale liabilities.\n\n`;
        contract += `9. CLOSING DATE\n`;
        contract += `The transaction shall be completed on or before ${details.endDate || "[Closing Date]"}.\n\n`;
        break;

      case "power-of-attorney":
        contract += `KNOW ALL MEN BY THESE PRESENTS:\n\n`;
        contract += `That I/We, ${details.party1Name}, residing at ${details.party1Address || "[Address]"}, do hereby appoint and constitute ${details.party2Name}, residing at ${details.party2Address || "[Address]"}, as my/our true and lawful Attorney.\n\n`;
        contract += `1. PURPOSE\n`;
        contract += `${details.purpose || "This Power of Attorney is granted for the purpose of [Specific Purpose]."}\n\n`;
        contract += `2. POWERS GRANTED\n`;
        contract += `The Attorney is authorized to:\n`;
        contract += `  a) Execute documents and deeds on behalf of the Principal.\n`;
        contract += `  b) Represent the Principal in legal and official matters.\n`;
        contract += `  c) Operate bank accounts and handle financial transactions.\n`;
        contract += `  d) Enter into contracts and agreements.\n`;
        contract += `  e) Take all necessary actions to fulfill the stated purpose.\n\n`;
        contract += `3. FINANCIAL AUTHORITY\n`;
        contract += `The Attorney is authorized to handle transactions up to ₹${details.amount || "[Amount]"}.\n\n`;
        contract += `4. DURATION\n`;
        contract += `This Power of Attorney shall be effective from ${details.effectiveDate || "[Start Date]"} and shall remain in force until ${details.endDate || "[End Date]"} or until revoked.\n\n`;
        contract += `5. REVOCATION\n`;
        contract += `The Principal reserves the right to revoke this Power of Attorney at any time by written notice.\n\n`;
        contract += `6. RATIFICATION\n`;
        contract += `The Principal hereby ratifies all lawful acts done by the Attorney in pursuance of this authority.\n\n`;
        contract += `7. LIABILITY\n`;
        contract += `The Attorney shall exercise due diligence and shall not be liable for actions taken in good faith.\n\n`;
        contract += `8. NON-TRANSFERABLE\n`;
        contract += `This Power of Attorney is personal and cannot be transferred or delegated to another person.\n\n`;
        break;

      default:
        contract += `1. PURPOSE\n`;
        contract += `${details.purpose || "[Purpose of the Agreement]"}\n\n`;
        contract += `2. CONSIDERATION\n`;
        contract += `The amount involved is ₹${details.amount || "[Amount]"}.\n\n`;
        contract += `3. TERM\n`;
        contract += `This Agreement shall be effective from ${details.effectiveDate || "[Start Date]"} to ${details.endDate || "[End Date]"}.\n\n`;
        contract += `4. OBLIGATIONS\n`;
        contract += `Each party shall fulfill their respective obligations as agreed.\n\n`;
        contract += `5. TERMINATION\n`;
        contract += `Either party may terminate this Agreement by giving written notice.\n\n`;
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
