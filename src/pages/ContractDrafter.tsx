import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, RotateCcw, Shield, Plus, Trash2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

// T&C Configuration Types
interface TnCDetails {
  businessName: string;
  businessType: string;
  websiteUrl: string;
  contactEmail: string;
  effectiveDate: string;
  jurisdiction: string;
  
  // User Account Settings
  allowsUserAccounts: boolean;
  minimumAge: string;
  accountTermination: boolean;
  
  // Content & Usage
  userGeneratedContent: boolean;
  contentModeration: boolean;
  intellectualProperty: boolean;
  
  // Payment & Commerce
  hasPayments: boolean;
  refundPolicy: string;
  subscriptionBilling: boolean;
  autoRenewal: boolean;
  
  // Data & Privacy
  collectsPersonalData: boolean;
  dataTypes: string[];
  thirdPartySharing: boolean;
  cookiesUsed: boolean;
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  
  // Liability & Legal
  disclaimerOfWarranties: boolean;
  limitationOfLiability: boolean;
  indemnification: boolean;
  arbitrationClause: boolean;
  classActionWaiver: boolean;
  
  // Service Specific
  apiAccess: boolean;
  rateLimit: string;
  uptimeGuarantee: string;
  
  // Communications
  marketingEmails: boolean;
  serviceNotifications: boolean;
  
  // Custom Clauses
  customClauses: { title: string; content: string }[];
}

const businessTypes = [
  { value: "ecommerce", label: "E-Commerce / Online Store" },
  { value: "saas", label: "SaaS / Software Service" },
  { value: "marketplace", label: "Marketplace / Platform" },
  { value: "social", label: "Social Media / Community" },
  { value: "content", label: "Content / Media Website" },
  { value: "consulting", label: "Consulting / Professional Services" },
  { value: "mobile-app", label: "Mobile Application" },
  { value: "educational", label: "Educational Platform" },
  { value: "healthcare", label: "Healthcare / Wellness" },
  { value: "fintech", label: "Financial Services / Fintech" },
  { value: "gaming", label: "Gaming / Entertainment" },
  { value: "general", label: "General Website / Business" },
];

const refundPolicies = [
  { value: "no-refunds", label: "No Refunds" },
  { value: "7-days", label: "7-Day Money Back Guarantee" },
  { value: "14-days", label: "14-Day Money Back Guarantee" },
  { value: "30-days", label: "30-Day Money Back Guarantee" },
  { value: "pro-rata", label: "Pro-Rata Refund" },
  { value: "case-by-case", label: "Case-by-Case Basis" },
];

const dataTypesOptions = [
  "Name and Contact Information",
  "Email Address",
  "Phone Number",
  "Billing/Payment Information",
  "Browsing History",
  "Device Information",
  "Location Data",
  "User Preferences",
  "Usage Analytics",
  "Social Media Profiles",
  "Government ID",
  "Health Information",
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
  const [activeTab, setActiveTab] = useState("contracts");
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
  
  // T&C State
  const [tncDetails, setTncDetails] = useState<TnCDetails>({
    businessName: "",
    businessType: "",
    websiteUrl: "",
    contactEmail: "",
    effectiveDate: "",
    jurisdiction: "India",
    allowsUserAccounts: true,
    minimumAge: "18",
    accountTermination: true,
    userGeneratedContent: false,
    contentModeration: true,
    intellectualProperty: true,
    hasPayments: false,
    refundPolicy: "case-by-case",
    subscriptionBilling: false,
    autoRenewal: false,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address"],
    thirdPartySharing: false,
    cookiesUsed: true,
    gdprCompliant: false,
    ccpaCompliant: false,
    disclaimerOfWarranties: true,
    limitationOfLiability: true,
    indemnification: true,
    arbitrationClause: false,
    classActionWaiver: false,
    apiAccess: false,
    rateLimit: "",
    uptimeGuarantee: "",
    marketingEmails: true,
    serviceNotifications: true,
    customClauses: [],
  });
  const [generatedTnC, setGeneratedTnC] = useState<string>("");

  const handleChange = (field: keyof ContractDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleTnCChange = <K extends keyof TnCDetails>(field: K, value: TnCDetails[K]) => {
    setTncDetails((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDataType = (dataType: string) => {
    setTncDetails((prev) => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dataType)
        ? prev.dataTypes.filter((d) => d !== dataType)
        : [...prev.dataTypes, dataType],
    }));
  };

  const addCustomClause = () => {
    setTncDetails((prev) => ({
      ...prev,
      customClauses: [...prev.customClauses, { title: "", content: "" }],
    }));
  };

  const updateCustomClause = (index: number, field: "title" | "content", value: string) => {
    setTncDetails((prev) => ({
      ...prev,
      customClauses: prev.customClauses.map((clause, i) =>
        i === index ? { ...clause, [field]: value } : clause
      ),
    }));
  };

  const removeCustomClause = (index: number) => {
    setTncDetails((prev) => ({
      ...prev,
      customClauses: prev.customClauses.filter((_, i) => i !== index),
    }));
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

  const handleTnCReset = () => {
    setTncDetails({
      businessName: "",
      businessType: "",
      websiteUrl: "",
      contactEmail: "",
      effectiveDate: "",
      jurisdiction: "India",
      allowsUserAccounts: true,
      minimumAge: "18",
      accountTermination: true,
      userGeneratedContent: false,
      contentModeration: true,
      intellectualProperty: true,
      hasPayments: false,
      refundPolicy: "case-by-case",
      subscriptionBilling: false,
      autoRenewal: false,
      collectsPersonalData: true,
      dataTypes: ["Name and Contact Information", "Email Address"],
      thirdPartySharing: false,
      cookiesUsed: true,
      gdprCompliant: false,
      ccpaCompliant: false,
      disclaimerOfWarranties: true,
      limitationOfLiability: true,
      indemnification: true,
      arbitrationClause: false,
      classActionWaiver: false,
      apiAccess: false,
      rateLimit: "",
      uptimeGuarantee: "",
      marketingEmails: true,
      serviceNotifications: true,
      customClauses: [],
    });
    setGeneratedTnC("");
    toast({
      title: "T&C Form Reset",
      description: "All T&C fields have been cleared.",
    });
  };

  const generateTnC = () => {
    if (!tncDetails.businessName || !tncDetails.businessType) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the business name and type.",
        variant: "destructive",
      });
      return;
    }

    const businessLabel = businessTypes.find((b) => b.value === tncDetails.businessType)?.label || tncDetails.businessType;
    let tnc = "";

    // Header
    tnc += `TERMS AND CONDITIONS\n`;
    tnc += `${"═".repeat(60)}\n\n`;
    tnc += `Last Updated: ${tncDetails.effectiveDate || new Date().toLocaleDateString()}\n\n`;
    tnc += `Welcome to ${tncDetails.businessName}. These Terms and Conditions ("Terms") govern your access to and use of our ${businessLabel.toLowerCase()} services${tncDetails.websiteUrl ? ` at ${tncDetails.websiteUrl}` : ""}.\n\n`;
    tnc += `Please read these Terms carefully before using our services. By accessing or using our services, you agree to be bound by these Terms.\n\n`;
    tnc += `${"─".repeat(60)}\n\n`;

    // Section 1: Acceptance of Terms
    tnc += `1. ACCEPTANCE OF TERMS\n\n`;
    tnc += `By accessing or using the services provided by ${tncDetails.businessName} ("Company," "we," "us," or "our"), you ("User," "you," or "your") agree to be bound by these Terms and Conditions, our Privacy Policy, and any additional terms applicable to specific services.\n\n`;
    tnc += `If you do not agree to these Terms, you must not access or use our services.\n\n`;

    // Section 2: Eligibility & User Accounts
    if (tncDetails.allowsUserAccounts) {
      tnc += `2. ELIGIBILITY AND USER ACCOUNTS\n\n`;
      tnc += `2.1 Age Requirement\n`;
      tnc += `You must be at least ${tncDetails.minimumAge} years old to use our services. By using our services, you represent and warrant that you meet this age requirement.\n\n`;
      tnc += `2.2 Account Registration\n`;
      tnc += `To access certain features of our services, you may be required to create an account. You agree to:\n`;
      tnc += `  • Provide accurate, current, and complete information during registration\n`;
      tnc += `  • Maintain and promptly update your account information\n`;
      tnc += `  • Keep your password secure and confidential\n`;
      tnc += `  • Accept responsibility for all activities under your account\n`;
      tnc += `  • Notify us immediately of any unauthorized use of your account\n\n`;
      if (tncDetails.accountTermination) {
        tnc += `2.3 Account Termination\n`;
        tnc += `We reserve the right to suspend or terminate your account at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.\n\n`;
      }
    }

    // Section 3: Services Description (based on business type)
    tnc += `${tncDetails.allowsUserAccounts ? "3" : "2"}. DESCRIPTION OF SERVICES\n\n`;
    switch (tncDetails.businessType) {
      case "ecommerce":
        tnc += `${tncDetails.businessName} operates an online e-commerce platform that allows users to browse, purchase, and receive products. We strive to provide accurate product descriptions, images, and pricing, but we do not warrant that product descriptions or other content are accurate, complete, reliable, or error-free.\n\n`;
        break;
      case "saas":
        tnc += `${tncDetails.businessName} provides software-as-a-service (SaaS) solutions accessible via the internet. Our services include the software application, any associated documentation, and customer support as specified in your subscription plan.\n\n`;
        break;
      case "marketplace":
        tnc += `${tncDetails.businessName} operates a marketplace platform connecting buyers and sellers. We act solely as an intermediary and are not a party to transactions between users. We do not own, sell, or resell any products or services listed on our platform.\n\n`;
        break;
      case "social":
        tnc += `${tncDetails.businessName} provides a social networking platform enabling users to create profiles, share content, and interact with other users. We provide the platform but do not control the content posted by users.\n\n`;
        break;
      case "content":
        tnc += `${tncDetails.businessName} provides content and media services including articles, videos, and other digital content. Access to certain content may require a subscription or one-time payment.\n\n`;
        break;
      case "fintech":
        tnc += `${tncDetails.businessName} provides financial technology services. We are not a bank or licensed financial institution unless otherwise stated. Our services are provided for informational purposes and do not constitute financial, investment, or legal advice.\n\n`;
        break;
      case "healthcare":
        tnc += `${tncDetails.businessName} provides health and wellness related services. Our services are not intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.\n\n`;
        break;
      default:
        tnc += `${tncDetails.businessName} provides ${businessLabel.toLowerCase()} services as described on our website and marketing materials. The specific features and functionality of our services may change from time to time.\n\n`;
    }

    // Section 4: User Content
    if (tncDetails.userGeneratedContent) {
      tnc += `${tncDetails.allowsUserAccounts ? "4" : "3"}. USER-GENERATED CONTENT\n\n`;
      tnc += `4.1 Your Content\n`;
      tnc += `Our services may allow you to post, submit, publish, or display content including text, images, videos, and other materials ("User Content"). You retain ownership of your User Content, but you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your User Content in connection with our services.\n\n`;
      tnc += `4.2 Content Restrictions\n`;
      tnc += `You agree not to post User Content that:\n`;
      tnc += `  • Violates any applicable law or regulation\n`;
      tnc += `  • Infringes any third party's intellectual property rights\n`;
      tnc += `  • Contains viruses, malware, or harmful code\n`;
      tnc += `  • Is defamatory, obscene, threatening, or harassing\n`;
      tnc += `  • Impersonates another person or entity\n`;
      tnc += `  • Contains spam, advertising, or promotional content without authorization\n\n`;
      if (tncDetails.contentModeration) {
        tnc += `4.3 Content Moderation\n`;
        tnc += `We reserve the right to review, edit, refuse to post, or remove any User Content at our sole discretion. We may, but are not obligated to, monitor or moderate User Content.\n\n`;
      }
    }

    // Section 5: Intellectual Property
    if (tncDetails.intellectualProperty) {
      const sectionNum = tncDetails.userGeneratedContent ? "5" : (tncDetails.allowsUserAccounts ? "4" : "3");
      tnc += `${sectionNum}. INTELLECTUAL PROPERTY RIGHTS\n\n`;
      tnc += `${sectionNum}.1 Our Intellectual Property\n`;
      tnc += `All content, features, and functionality of our services, including but not limited to text, graphics, logos, icons, images, audio clips, software, and the compilation thereof, are the exclusive property of ${tncDetails.businessName} or its licensors and are protected by copyright, trademark, and other intellectual property laws.\n\n`;
      tnc += `${sectionNum}.2 Limited License\n`;
      tnc += `We grant you a limited, non-exclusive, non-transferable, revocable license to access and use our services for your personal, non-commercial use. This license does not include the right to:\n`;
      tnc += `  • Modify or copy our materials\n`;
      tnc += `  • Use the materials for commercial purposes\n`;
      tnc += `  • Attempt to decompile or reverse engineer any software\n`;
      tnc += `  • Remove any copyright or proprietary notations\n`;
      tnc += `  • Transfer the materials to another person\n\n`;
    }

    // Section 6: Payments & Commerce
    if (tncDetails.hasPayments) {
      tnc += `PAYMENT TERMS\n\n`;
      tnc += `Fees and Payment\n`;
      tnc += `Certain services may require payment. All fees are quoted in Indian Rupees (INR) unless otherwise specified. You agree to pay all applicable fees as described at the time of purchase.\n\n`;
      
      if (tncDetails.subscriptionBilling) {
        tnc += `Subscription Services\n`;
        tnc += `If you purchase a subscription, you authorize us to charge your payment method on a recurring basis. Subscription fees are billed in advance on a ${tncDetails.autoRenewal ? "recurring" : "one-time"} basis.\n\n`;
        if (tncDetails.autoRenewal) {
          tnc += `Auto-Renewal\n`;
          tnc += `Your subscription will automatically renew at the end of each billing period unless you cancel before the renewal date. You may cancel your subscription at any time through your account settings.\n\n`;
        }
      }
      
      const refundLabel = refundPolicies.find((r) => r.value === tncDetails.refundPolicy)?.label || tncDetails.refundPolicy;
      tnc += `Refund Policy\n`;
      tnc += `Our refund policy is: ${refundLabel}. `;
      switch (tncDetails.refundPolicy) {
        case "no-refunds":
          tnc += `All sales are final. No refunds will be provided except as required by applicable law.\n\n`;
          break;
        case "7-days":
        case "14-days":
        case "30-days":
          tnc += `If you are not satisfied with your purchase, you may request a refund within the specified period from the date of purchase. Refunds will be processed to the original payment method.\n\n`;
          break;
        case "pro-rata":
          tnc += `Refunds will be calculated on a pro-rata basis based on the unused portion of your subscription.\n\n`;
          break;
        default:
          tnc += `Refund requests will be evaluated on a case-by-case basis at our discretion.\n\n`;
      }
    }

    // Section 7: Privacy & Data
    if (tncDetails.collectsPersonalData) {
      tnc += `PRIVACY AND DATA COLLECTION\n\n`;
      tnc += `Data We Collect\n`;
      tnc += `We collect and process the following types of personal information:\n`;
      tncDetails.dataTypes.forEach((dataType) => {
        tnc += `  • ${dataType}\n`;
      });
      tnc += `\n`;
      
      if (tncDetails.thirdPartySharing) {
        tnc += `Third-Party Sharing\n`;
        tnc += `We may share your personal information with third-party service providers who assist us in operating our services, conducting our business, or serving you. These third parties are bound by confidentiality obligations.\n\n`;
      }
      
      if (tncDetails.cookiesUsed) {
        tnc += `Cookies and Tracking\n`;
        tnc += `We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can manage cookie preferences through your browser settings.\n\n`;
      }
      
      if (tncDetails.gdprCompliant) {
        tnc += `GDPR Compliance\n`;
        tnc += `For users in the European Economic Area (EEA), we comply with the General Data Protection Regulation (GDPR). You have the right to access, correct, delete, or port your personal data. You may also object to processing or request restriction of processing.\n\n`;
      }
      
      if (tncDetails.ccpaCompliant) {
        tnc += `CCPA Compliance\n`;
        tnc += `For California residents, we comply with the California Consumer Privacy Act (CCPA). You have the right to know what personal information we collect, request deletion, and opt-out of the sale of personal information.\n\n`;
      }
    }

    // Section 8: API Access
    if (tncDetails.apiAccess) {
      tnc += `API ACCESS AND USAGE\n\n`;
      tnc += `API License\n`;
      tnc += `If you access our services via our API, you are granted a limited, non-exclusive, non-transferable license to use the API solely to develop applications that interoperate with our services.\n\n`;
      if (tncDetails.rateLimit) {
        tnc += `Rate Limits\n`;
        tnc += `API access is subject to rate limits of ${tncDetails.rateLimit}. Exceeding these limits may result in temporary or permanent restriction of API access.\n\n`;
      }
      if (tncDetails.uptimeGuarantee) {
        tnc += `Service Level Agreement\n`;
        tnc += `We target an uptime of ${tncDetails.uptimeGuarantee} for our API services. However, this is not a guarantee and we shall not be liable for any downtime or service interruptions.\n\n`;
      }
    }

    // Section 9: Communications
    if (tncDetails.marketingEmails || tncDetails.serviceNotifications) {
      tnc += `COMMUNICATIONS\n\n`;
      if (tncDetails.serviceNotifications) {
        tnc += `Service Communications\n`;
        tnc += `By using our services, you consent to receive service-related communications including account notifications, security alerts, and updates about our services.\n\n`;
      }
      if (tncDetails.marketingEmails) {
        tnc += `Marketing Communications\n`;
        tnc += `With your consent, we may send you promotional emails about new products, services, or offers. You can opt-out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting us at ${tncDetails.contactEmail || "[contact email]"}.\n\n`;
      }
    }

    // Section 10: Liability Clauses
    tnc += `${"─".repeat(60)}\n\n`;
    tnc += `LEGAL PROVISIONS\n\n`;

    if (tncDetails.disclaimerOfWarranties) {
      tnc += `DISCLAIMER OF WARRANTIES\n\n`;
      tnc += `OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.\n\n`;
    }

    if (tncDetails.limitationOfLiability) {
      tnc += `LIMITATION OF LIABILITY\n\n`;
      tnc += `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ${tncDetails.businessName.toUpperCase()}, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:\n`;
      tnc += `  (i) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES;\n`;
      tnc += `  (ii) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES;\n`;
      tnc += `  (iii) ANY CONTENT OBTAINED FROM THE SERVICES; AND\n`;
      tnc += `  (iv) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.\n\n`;
    }

    if (tncDetails.indemnification) {
      tnc += `INDEMNIFICATION\n\n`;
      tnc += `You agree to defend, indemnify, and hold harmless ${tncDetails.businessName} and its licensors, licensees, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the services.\n\n`;
    }

    // Section 11: Dispute Resolution
    tnc += `DISPUTE RESOLUTION\n\n`;
    tnc += `Governing Law\n`;
    tnc += `These Terms shall be governed by and construed in accordance with the laws of ${tncDetails.jurisdiction || "India"}, without regard to its conflict of law provisions.\n\n`;
    
    if (tncDetails.arbitrationClause) {
      tnc += `Arbitration\n`;
      tnc += `Any dispute, controversy, or claim arising out of or relating to these Terms or the breach, termination, or invalidity thereof shall be settled by binding arbitration in accordance with the Arbitration and Conciliation Act, 1996. The place of arbitration shall be ${tncDetails.jurisdiction || "India"}.\n\n`;
    } else {
      tnc += `Jurisdiction\n`;
      tnc += `Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in ${tncDetails.jurisdiction || "India"}.\n\n`;
    }

    if (tncDetails.classActionWaiver) {
      tnc += `Class Action Waiver\n`;
      tnc += `YOU AGREE THAT ANY CLAIMS RELATING TO THESE TERMS OR THE SERVICES WILL BE BROUGHT IN YOUR INDIVIDUAL CAPACITY ONLY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, COLLECTIVE, REPRESENTATIVE, MULTIPLE PLAINTIFF, OR SIMILAR PROCEEDING.\n\n`;
    }

    // Section 12: General Provisions
    tnc += `GENERAL PROVISIONS\n\n`;
    tnc += `Modification of Terms\n`;
    tnc += `We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use of our services after any such changes constitutes your acceptance of the new Terms.\n\n`;
    tnc += `Severability\n`;
    tnc += `If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced.\n\n`;
    tnc += `Entire Agreement\n`;
    tnc += `These Terms, together with our Privacy Policy and any other agreements expressly incorporated by reference herein, constitute the entire agreement between you and ${tncDetails.businessName} concerning the services.\n\n`;
    tnc += `Waiver\n`;
    tnc += `The failure of ${tncDetails.businessName} to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision.\n\n`;

    // Custom Clauses
    if (tncDetails.customClauses.length > 0) {
      tnc += `${"─".repeat(60)}\n\n`;
      tnc += `ADDITIONAL PROVISIONS\n\n`;
      tncDetails.customClauses.forEach((clause, index) => {
        if (clause.title && clause.content) {
          tnc += `${index + 1}. ${clause.title.toUpperCase()}\n`;
          tnc += `${clause.content}\n\n`;
        }
      });
    }

    // Contact Information
    tnc += `${"─".repeat(60)}\n\n`;
    tnc += `CONTACT INFORMATION\n\n`;
    tnc += `If you have any questions about these Terms, please contact us at:\n\n`;
    tnc += `${tncDetails.businessName}\n`;
    if (tncDetails.contactEmail) tnc += `Email: ${tncDetails.contactEmail}\n`;
    if (tncDetails.websiteUrl) tnc += `Website: ${tncDetails.websiteUrl}\n`;
    tnc += `\n`;

    // Footer
    tnc += `${"═".repeat(60)}\n`;
    tnc += `© ${new Date().getFullYear()} ${tncDetails.businessName}. All rights reserved.\n`;

    setGeneratedTnC(tnc);
    toast({
      title: "T&C Generated",
      description: "Your Terms and Conditions have been drafted successfully.",
    });
  };

  const exportTnCToPDF = () => {
    if (!generatedTnC) {
      toast({
        title: "No T&C",
        description: "Please generate Terms and Conditions first.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Terms and Conditions - ${tncDetails.businessName}`, 105, 15, { align: "center" });
    
    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const lines = doc.splitTextToSize(generatedTnC, 180);
    let y = 35;
    const pageHeight = 280;
    
    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines[i], 15, y);
      y += 4.5;
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated by ABC - AI Legal & Tax Co-pilot | Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    }
    
    doc.save(`Terms_and_Conditions_${tncDetails.businessName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
    
    toast({
      title: "PDF Exported",
      description: "Your Terms and Conditions have been saved as PDF.",
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
                  Contract & T&C Drafter
                </h1>
                <p className="text-sm text-muted-foreground">Draft professional contracts and terms instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "contracts" ? (
                <>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={exportToPDF} disabled={!generatedContract}>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleTnCReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={exportTnCToPDF} disabled={!generatedTnC}>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contracts
            </TabsTrigger>
            <TabsTrigger value="tnc" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Terms & Conditions
            </TabsTrigger>
          </TabsList>

          {/* Contracts Tab */}
          <TabsContent value="contracts">
            <div className="grid lg:grid-cols-2 gap-6">
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
          </TabsContent>

          {/* T&C Tab */}
          <TabsContent value="tnc">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    T&C Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="multiple" defaultValue={["basic", "accounts", "payments"]} className="w-full">
                    {/* Basic Information */}
                    <AccordionItem value="basic">
                      <AccordionTrigger className="text-sm font-semibold">
                        Basic Information
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div>
                          <Label>Business Name *</Label>
                          <Input
                            placeholder="Your Company Name"
                            value={tncDetails.businessName}
                            onChange={(e) => handleTnCChange("businessName", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Business Type *</Label>
                          <Select value={tncDetails.businessType} onValueChange={(v) => handleTnCChange("businessType", v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                              {businessTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Website URL</Label>
                            <Input
                              placeholder="https://example.com"
                              value={tncDetails.websiteUrl}
                              onChange={(e) => handleTnCChange("websiteUrl", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Contact Email</Label>
                            <Input
                              placeholder="legal@example.com"
                              value={tncDetails.contactEmail}
                              onChange={(e) => handleTnCChange("contactEmail", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Effective Date</Label>
                            <Input
                              type="date"
                              value={tncDetails.effectiveDate}
                              onChange={(e) => handleTnCChange("effectiveDate", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Jurisdiction</Label>
                            <Input
                              placeholder="India"
                              value={tncDetails.jurisdiction}
                              onChange={(e) => handleTnCChange("jurisdiction", e.target.value)}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* User Accounts */}
                    <AccordionItem value="accounts">
                      <AccordionTrigger className="text-sm font-semibold">
                        User Accounts & Eligibility
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow User Accounts</Label>
                            <p className="text-xs text-muted-foreground">Users can create accounts on your platform</p>
                          </div>
                          <Switch
                            checked={tncDetails.allowsUserAccounts}
                            onCheckedChange={(v) => handleTnCChange("allowsUserAccounts", v)}
                          />
                        </div>
                        {tncDetails.allowsUserAccounts && (
                          <>
                            <div>
                              <Label>Minimum Age</Label>
                              <Select value={tncDetails.minimumAge} onValueChange={(v) => handleTnCChange("minimumAge", v)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="13">13 years</SelectItem>
                                  <SelectItem value="16">16 years</SelectItem>
                                  <SelectItem value="18">18 years</SelectItem>
                                  <SelectItem value="21">21 years</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Account Termination Rights</Label>
                                <p className="text-xs text-muted-foreground">Reserve right to terminate accounts</p>
                              </div>
                              <Switch
                                checked={tncDetails.accountTermination}
                                onCheckedChange={(v) => handleTnCChange("accountTermination", v)}
                              />
                            </div>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Content & Usage */}
                    <AccordionItem value="content">
                      <AccordionTrigger className="text-sm font-semibold">
                        Content & Usage
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>User-Generated Content</Label>
                            <p className="text-xs text-muted-foreground">Users can post/upload content</p>
                          </div>
                          <Switch
                            checked={tncDetails.userGeneratedContent}
                            onCheckedChange={(v) => handleTnCChange("userGeneratedContent", v)}
                          />
                        </div>
                        {tncDetails.userGeneratedContent && (
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Content Moderation</Label>
                              <p className="text-xs text-muted-foreground">Reserve right to moderate content</p>
                            </div>
                            <Switch
                              checked={tncDetails.contentModeration}
                              onCheckedChange={(v) => handleTnCChange("contentModeration", v)}
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Intellectual Property Protection</Label>
                            <p className="text-xs text-muted-foreground">Include IP ownership clauses</p>
                          </div>
                          <Switch
                            checked={tncDetails.intellectualProperty}
                            onCheckedChange={(v) => handleTnCChange("intellectualProperty", v)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Payments */}
                    <AccordionItem value="payments">
                      <AccordionTrigger className="text-sm font-semibold">
                        Payments & Commerce
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Accept Payments</Label>
                            <p className="text-xs text-muted-foreground">Platform accepts payments</p>
                          </div>
                          <Switch
                            checked={tncDetails.hasPayments}
                            onCheckedChange={(v) => handleTnCChange("hasPayments", v)}
                          />
                        </div>
                        {tncDetails.hasPayments && (
                          <>
                            <div>
                              <Label>Refund Policy</Label>
                              <Select value={tncDetails.refundPolicy} onValueChange={(v) => handleTnCChange("refundPolicy", v)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {refundPolicies.map((policy) => (
                                    <SelectItem key={policy.value} value={policy.value}>
                                      {policy.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Subscription Billing</Label>
                                <p className="text-xs text-muted-foreground">Offer subscription services</p>
                              </div>
                              <Switch
                                checked={tncDetails.subscriptionBilling}
                                onCheckedChange={(v) => handleTnCChange("subscriptionBilling", v)}
                              />
                            </div>
                            {tncDetails.subscriptionBilling && (
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Auto-Renewal</Label>
                                  <p className="text-xs text-muted-foreground">Subscriptions renew automatically</p>
                                </div>
                                <Switch
                                  checked={tncDetails.autoRenewal}
                                  onCheckedChange={(v) => handleTnCChange("autoRenewal", v)}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Privacy & Data */}
                    <AccordionItem value="privacy">
                      <AccordionTrigger className="text-sm font-semibold">
                        Privacy & Data Collection
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Collect Personal Data</Label>
                            <p className="text-xs text-muted-foreground">Platform collects user data</p>
                          </div>
                          <Switch
                            checked={tncDetails.collectsPersonalData}
                            onCheckedChange={(v) => handleTnCChange("collectsPersonalData", v)}
                          />
                        </div>
                        {tncDetails.collectsPersonalData && (
                          <>
                            <div>
                              <Label className="mb-2 block">Data Types Collected</Label>
                              <div className="grid grid-cols-2 gap-2">
                                {dataTypesOptions.map((dataType) => (
                                  <div key={dataType} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={dataType}
                                      checked={tncDetails.dataTypes.includes(dataType)}
                                      onCheckedChange={() => toggleDataType(dataType)}
                                    />
                                    <label htmlFor={dataType} className="text-xs cursor-pointer">
                                      {dataType}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Third-Party Data Sharing</Label>
                                <p className="text-xs text-muted-foreground">Share data with partners</p>
                              </div>
                              <Switch
                                checked={tncDetails.thirdPartySharing}
                                onCheckedChange={(v) => handleTnCChange("thirdPartySharing", v)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Use Cookies</Label>
                                <p className="text-xs text-muted-foreground">Website uses cookies</p>
                              </div>
                              <Switch
                                checked={tncDetails.cookiesUsed}
                                onCheckedChange={(v) => handleTnCChange("cookiesUsed", v)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>GDPR Compliant</Label>
                                <p className="text-xs text-muted-foreground">EU data protection compliance</p>
                              </div>
                              <Switch
                                checked={tncDetails.gdprCompliant}
                                onCheckedChange={(v) => handleTnCChange("gdprCompliant", v)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>CCPA Compliant</Label>
                                <p className="text-xs text-muted-foreground">California privacy compliance</p>
                              </div>
                              <Switch
                                checked={tncDetails.ccpaCompliant}
                                onCheckedChange={(v) => handleTnCChange("ccpaCompliant", v)}
                              />
                            </div>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Legal Provisions */}
                    <AccordionItem value="legal">
                      <AccordionTrigger className="text-sm font-semibold">
                        Legal Provisions
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Disclaimer of Warranties</Label>
                            <p className="text-xs text-muted-foreground">"As-is" service disclaimer</p>
                          </div>
                          <Switch
                            checked={tncDetails.disclaimerOfWarranties}
                            onCheckedChange={(v) => handleTnCChange("disclaimerOfWarranties", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Limitation of Liability</Label>
                            <p className="text-xs text-muted-foreground">Cap on damages liability</p>
                          </div>
                          <Switch
                            checked={tncDetails.limitationOfLiability}
                            onCheckedChange={(v) => handleTnCChange("limitationOfLiability", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Indemnification Clause</Label>
                            <p className="text-xs text-muted-foreground">User indemnifies company</p>
                          </div>
                          <Switch
                            checked={tncDetails.indemnification}
                            onCheckedChange={(v) => handleTnCChange("indemnification", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Arbitration Clause</Label>
                            <p className="text-xs text-muted-foreground">Disputes resolved via arbitration</p>
                          </div>
                          <Switch
                            checked={tncDetails.arbitrationClause}
                            onCheckedChange={(v) => handleTnCChange("arbitrationClause", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Class Action Waiver</Label>
                            <p className="text-xs text-muted-foreground">No class action lawsuits</p>
                          </div>
                          <Switch
                            checked={tncDetails.classActionWaiver}
                            onCheckedChange={(v) => handleTnCChange("classActionWaiver", v)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* API & Service */}
                    <AccordionItem value="api">
                      <AccordionTrigger className="text-sm font-semibold">
                        API & Service Level
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Provide API Access</Label>
                            <p className="text-xs text-muted-foreground">Offer API to developers</p>
                          </div>
                          <Switch
                            checked={tncDetails.apiAccess}
                            onCheckedChange={(v) => handleTnCChange("apiAccess", v)}
                          />
                        </div>
                        {tncDetails.apiAccess && (
                          <>
                            <div>
                              <Label>Rate Limit</Label>
                              <Input
                                placeholder="e.g., 1000 requests/hour"
                                value={tncDetails.rateLimit}
                                onChange={(e) => handleTnCChange("rateLimit", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Uptime Guarantee</Label>
                              <Input
                                placeholder="e.g., 99.9%"
                                value={tncDetails.uptimeGuarantee}
                                onChange={(e) => handleTnCChange("uptimeGuarantee", e.target.value)}
                              />
                            </div>
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Communications */}
                    <AccordionItem value="communications">
                      <AccordionTrigger className="text-sm font-semibold">
                        Communications
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Marketing Emails</Label>
                            <p className="text-xs text-muted-foreground">Send promotional emails</p>
                          </div>
                          <Switch
                            checked={tncDetails.marketingEmails}
                            onCheckedChange={(v) => handleTnCChange("marketingEmails", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Service Notifications</Label>
                            <p className="text-xs text-muted-foreground">Send service alerts</p>
                          </div>
                          <Switch
                            checked={tncDetails.serviceNotifications}
                            onCheckedChange={(v) => handleTnCChange("serviceNotifications", v)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Custom Clauses */}
                    <AccordionItem value="custom">
                      <AccordionTrigger className="text-sm font-semibold">
                        Custom Clauses
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        {tncDetails.customClauses.map((clause, index) => (
                          <div key={index} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Clause {index + 1}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCustomClause(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Clause Title"
                              value={clause.title}
                              onChange={(e) => updateCustomClause(index, "title", e.target.value)}
                            />
                            <Textarea
                              placeholder="Clause Content"
                              value={clause.content}
                              onChange={(e) => updateCustomClause(index, "content", e.target.value)}
                              rows={3}
                            />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={addCustomClause}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Clause
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Button className="w-full" onClick={generateTnC}>
                    <Shield className="h-4 w-4 mr-2" />
                    Generate Terms & Conditions
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>T&C Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedTnC ? (
                    <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                      {generatedTnC}
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground">
                      <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Configure your T&C options and click "Generate Terms & Conditions" to see the preview here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Disclaimer: This tool generates basic contract and T&C templates for reference purposes only. 
          Please consult a legal professional before using these documents for official purposes.
        </p>
      </main>
    </div>
  );
};

export default ContractDrafter;
