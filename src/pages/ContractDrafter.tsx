import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, RotateCcw, Shield, Plus, Trash2, Lock, Sparkles } from "lucide-react";
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

// T&C Template Presets for each business type
const tncPresets: Record<string, Partial<TnCDetails>> = {
  ecommerce: {
    businessType: "ecommerce",
    allowsUserAccounts: true,
    minimumAge: "18",
    accountTermination: true,
    userGeneratedContent: true,
    contentModeration: true,
    intellectualProperty: true,
    hasPayments: true,
    refundPolicy: "14-days",
    subscriptionBilling: false,
    autoRenewal: false,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Billing/Payment Information", "Device Information", "Browsing History"],
    thirdPartySharing: true,
    cookiesUsed: true,
    gdprCompliant: true,
    ccpaCompliant: true,
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
  },
  saas: {
    businessType: "saas",
    allowsUserAccounts: true,
    minimumAge: "18",
    accountTermination: true,
    userGeneratedContent: true,
    contentModeration: false,
    intellectualProperty: true,
    hasPayments: true,
    refundPolicy: "pro-rata",
    subscriptionBilling: true,
    autoRenewal: true,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Billing/Payment Information", "Usage Analytics", "Device Information"],
    thirdPartySharing: true,
    cookiesUsed: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    disclaimerOfWarranties: true,
    limitationOfLiability: true,
    indemnification: true,
    arbitrationClause: true,
    classActionWaiver: true,
    apiAccess: true,
    rateLimit: "1000 requests per hour",
    uptimeGuarantee: "99.9%",
    marketingEmails: true,
    serviceNotifications: true,
  },
  marketplace: {
    businessType: "marketplace",
    allowsUserAccounts: true,
    minimumAge: "18",
    accountTermination: true,
    userGeneratedContent: true,
    contentModeration: true,
    intellectualProperty: true,
    hasPayments: true,
    refundPolicy: "case-by-case",
    subscriptionBilling: false,
    autoRenewal: false,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Billing/Payment Information", "Government ID", "Location Data"],
    thirdPartySharing: true,
    cookiesUsed: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    disclaimerOfWarranties: true,
    limitationOfLiability: true,
    indemnification: true,
    arbitrationClause: true,
    classActionWaiver: false,
    apiAccess: true,
    rateLimit: "500 requests per hour",
    uptimeGuarantee: "99.5%",
    marketingEmails: true,
    serviceNotifications: true,
  },
  social: {
    businessType: "social",
    allowsUserAccounts: true,
    minimumAge: "13",
    accountTermination: true,
    userGeneratedContent: true,
    contentModeration: true,
    intellectualProperty: true,
    hasPayments: false,
    refundPolicy: "no-refunds",
    subscriptionBilling: false,
    autoRenewal: false,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Social Media Profiles", "Location Data", "Browsing History", "Device Information", "User Preferences"],
    thirdPartySharing: true,
    cookiesUsed: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    disclaimerOfWarranties: true,
    limitationOfLiability: true,
    indemnification: true,
    arbitrationClause: false,
    classActionWaiver: true,
    apiAccess: true,
    rateLimit: "200 requests per hour",
    uptimeGuarantee: "",
    marketingEmails: true,
    serviceNotifications: true,
  },
  content: {
    businessType: "content",
    allowsUserAccounts: true,
    minimumAge: "13",
    accountTermination: true,
    userGeneratedContent: false,
    contentModeration: false,
    intellectualProperty: true,
    hasPayments: true,
    refundPolicy: "7-days",
    subscriptionBilling: true,
    autoRenewal: true,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Billing/Payment Information", "Browsing History", "Device Information", "User Preferences"],
    thirdPartySharing: false,
    cookiesUsed: true,
    gdprCompliant: true,
    ccpaCompliant: true,
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
  },
  consulting: {
    businessType: "consulting",
    allowsUserAccounts: true,
    minimumAge: "18",
    accountTermination: true,
    userGeneratedContent: false,
    contentModeration: false,
    intellectualProperty: true,
    hasPayments: true,
    refundPolicy: "case-by-case",
    subscriptionBilling: false,
    autoRenewal: false,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Billing/Payment Information"],
    thirdPartySharing: false,
    cookiesUsed: true,
    gdprCompliant: true,
    ccpaCompliant: false,
    disclaimerOfWarranties: true,
    limitationOfLiability: true,
    indemnification: true,
    arbitrationClause: true,
    classActionWaiver: false,
    apiAccess: false,
    rateLimit: "",
    uptimeGuarantee: "",
    marketingEmails: true,
    serviceNotifications: true,
  },
  "mobile-app": {
    businessType: "mobile-app",
    allowsUserAccounts: true,
    minimumAge: "13",
    accountTermination: true,
    userGeneratedContent: true,
    contentModeration: true,
    intellectualProperty: true,
    hasPayments: true,
    refundPolicy: "no-refunds",
    subscriptionBilling: true,
    autoRenewal: true,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Device Information", "Location Data", "Usage Analytics", "User Preferences"],
    thirdPartySharing: true,
    cookiesUsed: false,
    gdprCompliant: true,
    ccpaCompliant: true,
    disclaimerOfWarranties: true,
    limitationOfLiability: true,
    indemnification: true,
    arbitrationClause: true,
    classActionWaiver: true,
    apiAccess: true,
    rateLimit: "300 requests per hour",
    uptimeGuarantee: "99.5%",
    marketingEmails: true,
    serviceNotifications: true,
  },
  educational: {
    businessType: "educational",
    allowsUserAccounts: true,
    minimumAge: "13",
    accountTermination: true,
    userGeneratedContent: true,
    contentModeration: true,
    intellectualProperty: true,
    hasPayments: true,
    refundPolicy: "30-days",
    subscriptionBilling: true,
    autoRenewal: true,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Billing/Payment Information", "Usage Analytics", "User Preferences"],
    thirdPartySharing: false,
    cookiesUsed: true,
    gdprCompliant: true,
    ccpaCompliant: true,
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
  },
  healthcare: {
    businessType: "healthcare",
    allowsUserAccounts: true,
    minimumAge: "18",
    accountTermination: true,
    userGeneratedContent: false,
    contentModeration: false,
    intellectualProperty: true,
    hasPayments: true,
    refundPolicy: "case-by-case",
    subscriptionBilling: true,
    autoRenewal: false,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Billing/Payment Information", "Health Information", "Government ID"],
    thirdPartySharing: false,
    cookiesUsed: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    disclaimerOfWarranties: true,
    limitationOfLiability: true,
    indemnification: true,
    arbitrationClause: true,
    classActionWaiver: false,
    apiAccess: false,
    rateLimit: "",
    uptimeGuarantee: "99.9%",
    marketingEmails: false,
    serviceNotifications: true,
  },
  fintech: {
    businessType: "fintech",
    allowsUserAccounts: true,
    minimumAge: "18",
    accountTermination: true,
    userGeneratedContent: false,
    contentModeration: false,
    intellectualProperty: true,
    hasPayments: true,
    refundPolicy: "no-refunds",
    subscriptionBilling: true,
    autoRenewal: true,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Billing/Payment Information", "Government ID", "Device Information", "Location Data"],
    thirdPartySharing: true,
    cookiesUsed: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    disclaimerOfWarranties: true,
    limitationOfLiability: true,
    indemnification: true,
    arbitrationClause: true,
    classActionWaiver: true,
    apiAccess: true,
    rateLimit: "100 requests per hour",
    uptimeGuarantee: "99.99%",
    marketingEmails: true,
    serviceNotifications: true,
  },
  gaming: {
    businessType: "gaming",
    allowsUserAccounts: true,
    minimumAge: "13",
    accountTermination: true,
    userGeneratedContent: true,
    contentModeration: true,
    intellectualProperty: true,
    hasPayments: true,
    refundPolicy: "no-refunds",
    subscriptionBilling: true,
    autoRenewal: true,
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Billing/Payment Information", "Device Information", "Usage Analytics", "User Preferences", "Social Media Profiles"],
    thirdPartySharing: true,
    cookiesUsed: true,
    gdprCompliant: true,
    ccpaCompliant: true,
    disclaimerOfWarranties: true,
    limitationOfLiability: true,
    indemnification: true,
    arbitrationClause: true,
    classActionWaiver: true,
    apiAccess: true,
    rateLimit: "500 requests per hour",
    uptimeGuarantee: "99.5%",
    marketingEmails: true,
    serviceNotifications: true,
  },
  general: {
    businessType: "general",
    allowsUserAccounts: true,
    minimumAge: "18",
    accountTermination: true,
    userGeneratedContent: false,
    contentModeration: false,
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
  },
};

// Custom Clause Presets for T&C
const customClausePresets = [
  { 
    title: "Force Majeure", 
    content: "Neither party shall be liable for any failure or delay in performing their obligations where such failure or delay results from any cause that is beyond the reasonable control of that party, including but not limited to acts of God, natural disasters, pandemics, war, terrorism, riots, civil commotion, government actions, strikes, or failures of third-party telecommunications or power supply.",
    category: "common"
  },
  { 
    title: "Non-Compete Clause", 
    content: "During the term of this agreement and for a period of [12/24] months thereafter, User agrees not to directly or indirectly engage in any business that competes with the Company's core services within the same geographic market, except with prior written consent.",
    category: "unique"
  },
  { 
    title: "Anti-Spam Compliance", 
    content: "Users agree not to use our services for sending unsolicited bulk emails (spam), harvesting email addresses, or any activities that violate CAN-SPAM Act, GDPR, or other applicable anti-spam laws. Violation will result in immediate account termination without refund.",
    category: "useful"
  },
  { 
    title: "Accessibility Statement", 
    content: "We are committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards (WCAG 2.1 Level AA). If you experience any accessibility barriers, please contact us.",
    category: "unique"
  },
  { 
    title: "Fair Use Policy", 
    content: "While we offer unlimited usage on certain plans, all usage is subject to our Fair Use Policy. Excessive usage that negatively impacts service quality for other users may result in throttling, suspension, or plan upgrade requirements. Specific thresholds are outlined in our service documentation.",
    category: "useful"
  },
  { 
    title: "No Warranty on Third-Party Integrations", 
    content: "Our service may integrate with third-party applications and services. We provide no warranty regarding the availability, functionality, or security of these third-party integrations. Your use of third-party services is subject to their respective terms and conditions.",
    category: "common"
  },
  { 
    title: "Data Portability Rights", 
    content: "Upon written request and subject to verification, we will provide you with a copy of your personal data in a structured, commonly used, and machine-readable format (JSON or CSV). Data export requests will be fulfilled within 30 days of verification.",
    category: "useful"
  },
  { 
    title: "Beta Features Disclaimer", 
    content: "Certain features may be designated as 'Beta' or 'Experimental'. These features are provided 'as-is' without warranty, may be modified or discontinued at any time, and should not be relied upon for critical business operations. Data stored in beta features may not be migrated upon feature changes.",
    category: "unique"
  },
  { 
    title: "Suspension for Non-Payment", 
    content: "In the event of non-payment of fees when due, we reserve the right to suspend your access to the services after providing 7 days written notice. Continued non-payment for 30 days may result in account termination and data deletion. A reactivation fee may apply for account reinstatement.",
    category: "common"
  },
  { 
    title: "AI and Automated Processing Disclosure", 
    content: "Our services may use artificial intelligence, machine learning, and automated decision-making systems to improve user experience, provide recommendations, or process content. You have the right to request human review of automated decisions that significantly affect you.",
    category: "unique"
  },
  { 
    title: "Content Backup Responsibility", 
    content: "While we maintain regular backups of our systems, you are solely responsible for maintaining backup copies of any content you upload or create using our services. We shall not be liable for any loss of data due to technical failures, user error, or service termination.",
    category: "useful"
  },
  { 
    title: "Dispute Resolution - Mediation First", 
    content: "Before initiating any legal proceedings, both parties agree to first attempt to resolve disputes through good-faith negotiation for a minimum of 30 days. If negotiation fails, parties agree to participate in mediation before a mutually agreed mediator before proceeding to arbitration or litigation.",
    category: "common"
  },
  { 
    title: "Export Compliance", 
    content: "You agree to comply with all applicable export and import control laws and regulations. You shall not export, re-export, or transfer any data or services to any country, entity, or person prohibited by applicable laws, including U.S. export restrictions and international sanctions.",
    category: "useful"
  },
  { 
    title: "Affiliate Program Terms", 
    content: "Participation in our affiliate or referral program is subject to additional terms. Commission rates, payment thresholds, and prohibited marketing practices are detailed in the Affiliate Agreement. We reserve the right to modify commission structures with 30 days notice.",
    category: "unique"
  },
  { 
    title: "Service Credits for Downtime", 
    content: "If service availability falls below our SLA commitment in any calendar month, eligible customers may request service credits. Credits are calculated as a percentage of monthly fees proportional to the downtime exceeding the SLA. Credits must be requested within 30 days and do not exceed 100% of monthly fees.",
    category: "useful"
  }
];

// Privacy Policy Interface
interface PrivacyPolicyDetails {
  businessName: string;
  businessType: string;
  websiteUrl: string;
  contactEmail: string;
  dpoEmail: string;
  effectiveDate: string;
  jurisdiction: string;
  
  // Data Collection
  collectsPersonalData: boolean;
  dataTypes: string[];
  collectsFromChildren: boolean;
  childrenAgeLimit: string;
  automaticDataCollection: boolean;
  
  // Cookies & Tracking
  usesCookies: boolean;
  cookieTypes: string[];
  usesAnalytics: boolean;
  analyticsProvider: string;
  usesAdvertising: boolean;
  
  // Data Usage
  usesForMarketing: boolean;
  usesForPersonalization: boolean;
  usesForAnalytics: boolean;
  usesForThirdPartySharing: boolean;
  sellsData: boolean;
  
  // Data Protection
  dataEncryption: boolean;
  dataRetentionPeriod: string;
  dataStorageLocation: string;
  
  // User Rights
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  rightToAccess: boolean;
  rightToDelete: boolean;
  rightToPortability: boolean;
  rightToOptOut: boolean;
  
  // Third Parties
  thirdPartyServices: string[];
  internationalTransfers: boolean;
  
  // Specific Industries
  hipaaCompliant: boolean;
  pciCompliant: boolean;
  
  // Contact & Updates
  privacyContactMethod: string;
  notifyOnChanges: boolean;
}

const cookieTypeOptions = [
  "Essential/Necessary Cookies",
  "Performance/Analytics Cookies",
  "Functionality Cookies",
  "Targeting/Advertising Cookies",
  "Social Media Cookies",
];

const thirdPartyServiceOptions = [
  "Google Analytics",
  "Google Ads",
  "Facebook Pixel",
  "Stripe (Payments)",
  "PayPal",
  "AWS (Cloud Hosting)",
  "Cloudflare (CDN/Security)",
  "Mailchimp (Email Marketing)",
  "Intercom (Customer Support)",
  "Zendesk (Support)",
  "Hotjar (Analytics)",
  "Mixpanel (Analytics)",
  "Segment (Data Platform)",
  "HubSpot (CRM)",
  "Salesforce (CRM)",
];

// Privacy Policy Presets by Business Type
const privacyPolicyPresets: Record<string, Partial<PrivacyPolicyDetails>> = {
  ecommerce: {
    businessType: "ecommerce",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Billing/Payment Information", "Browsing History", "Device Information"],
    collectsFromChildren: false,
    childrenAgeLimit: "13",
    automaticDataCollection: true,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies", "Performance/Analytics Cookies", "Targeting/Advertising Cookies"],
    usesAnalytics: true,
    analyticsProvider: "Google Analytics",
    usesAdvertising: true,
    usesForMarketing: true,
    usesForPersonalization: true,
    usesForAnalytics: true,
    usesForThirdPartySharing: true,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "3 years after last activity",
    dataStorageLocation: "India / Cloud servers",
    gdprCompliant: true,
    ccpaCompliant: true,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToOptOut: true,
    thirdPartyServices: ["Google Analytics", "Stripe (Payments)", "Mailchimp (Email Marketing)"],
    internationalTransfers: true,
    hipaaCompliant: false,
    pciCompliant: true,
    privacyContactMethod: "Email and Web Form",
    notifyOnChanges: true,
  },
  saas: {
    businessType: "saas",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Billing/Payment Information", "Usage Analytics", "Device Information"],
    collectsFromChildren: false,
    childrenAgeLimit: "16",
    automaticDataCollection: true,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies", "Performance/Analytics Cookies", "Functionality Cookies"],
    usesAnalytics: true,
    analyticsProvider: "Mixpanel",
    usesAdvertising: false,
    usesForMarketing: true,
    usesForPersonalization: true,
    usesForAnalytics: true,
    usesForThirdPartySharing: false,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "Duration of account plus 1 year",
    dataStorageLocation: "AWS (Multiple Regions)",
    gdprCompliant: true,
    ccpaCompliant: true,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToOptOut: true,
    thirdPartyServices: ["AWS (Cloud Hosting)", "Stripe (Payments)", "Intercom (Customer Support)", "Mixpanel (Analytics)"],
    internationalTransfers: true,
    hipaaCompliant: false,
    pciCompliant: true,
    privacyContactMethod: "Email",
    notifyOnChanges: true,
  },
  marketplace: {
    businessType: "marketplace",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Billing/Payment Information", "Government ID", "Location Data"],
    collectsFromChildren: false,
    childrenAgeLimit: "18",
    automaticDataCollection: true,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies", "Performance/Analytics Cookies", "Targeting/Advertising Cookies", "Social Media Cookies"],
    usesAnalytics: true,
    analyticsProvider: "Google Analytics",
    usesAdvertising: true,
    usesForMarketing: true,
    usesForPersonalization: true,
    usesForAnalytics: true,
    usesForThirdPartySharing: true,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "5 years for transaction records",
    dataStorageLocation: "Cloud servers with regional presence",
    gdprCompliant: true,
    ccpaCompliant: true,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToOptOut: true,
    thirdPartyServices: ["Google Analytics", "Stripe (Payments)", "PayPal", "Cloudflare (CDN/Security)"],
    internationalTransfers: true,
    hipaaCompliant: false,
    pciCompliant: true,
    privacyContactMethod: "Email and In-App",
    notifyOnChanges: true,
  },
  social: {
    businessType: "social",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Social Media Profiles", "Location Data", "Browsing History", "Device Information", "User Preferences"],
    collectsFromChildren: false,
    childrenAgeLimit: "13",
    automaticDataCollection: true,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies", "Performance/Analytics Cookies", "Functionality Cookies", "Targeting/Advertising Cookies", "Social Media Cookies"],
    usesAnalytics: true,
    analyticsProvider: "Mixpanel",
    usesAdvertising: true,
    usesForMarketing: true,
    usesForPersonalization: true,
    usesForAnalytics: true,
    usesForThirdPartySharing: true,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "Duration of account plus 90 days",
    dataStorageLocation: "Global CDN and Cloud servers",
    gdprCompliant: true,
    ccpaCompliant: true,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToOptOut: true,
    thirdPartyServices: ["Google Analytics", "Facebook Pixel", "AWS (Cloud Hosting)", "Cloudflare (CDN/Security)"],
    internationalTransfers: true,
    hipaaCompliant: false,
    pciCompliant: false,
    privacyContactMethod: "In-App and Email",
    notifyOnChanges: true,
  },
  content: {
    businessType: "content",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Billing/Payment Information", "Browsing History", "Device Information", "User Preferences"],
    collectsFromChildren: false,
    childrenAgeLimit: "13",
    automaticDataCollection: true,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies", "Performance/Analytics Cookies", "Targeting/Advertising Cookies"],
    usesAnalytics: true,
    analyticsProvider: "Google Analytics",
    usesAdvertising: true,
    usesForMarketing: true,
    usesForPersonalization: true,
    usesForAnalytics: true,
    usesForThirdPartySharing: false,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "Duration of subscription plus 1 year",
    dataStorageLocation: "Cloud servers",
    gdprCompliant: true,
    ccpaCompliant: true,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToOptOut: true,
    thirdPartyServices: ["Google Analytics", "Google Ads", "Stripe (Payments)", "Mailchimp (Email Marketing)"],
    internationalTransfers: false,
    hipaaCompliant: false,
    pciCompliant: true,
    privacyContactMethod: "Email",
    notifyOnChanges: true,
  },
  consulting: {
    businessType: "consulting",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Billing/Payment Information"],
    collectsFromChildren: false,
    childrenAgeLimit: "18",
    automaticDataCollection: false,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies", "Performance/Analytics Cookies"],
    usesAnalytics: true,
    analyticsProvider: "Google Analytics",
    usesAdvertising: false,
    usesForMarketing: true,
    usesForPersonalization: false,
    usesForAnalytics: true,
    usesForThirdPartySharing: false,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "7 years for business records",
    dataStorageLocation: "Secure local and cloud storage",
    gdprCompliant: true,
    ccpaCompliant: false,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToOptOut: true,
    thirdPartyServices: ["Google Analytics", "Stripe (Payments)", "HubSpot (CRM)"],
    internationalTransfers: false,
    hipaaCompliant: false,
    pciCompliant: true,
    privacyContactMethod: "Email",
    notifyOnChanges: true,
  },
  "mobile-app": {
    businessType: "mobile-app",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Device Information", "Location Data", "Usage Analytics", "User Preferences"],
    collectsFromChildren: false,
    childrenAgeLimit: "13",
    automaticDataCollection: true,
    usesCookies: false,
    cookieTypes: [],
    usesAnalytics: true,
    analyticsProvider: "Firebase Analytics",
    usesAdvertising: true,
    usesForMarketing: true,
    usesForPersonalization: true,
    usesForAnalytics: true,
    usesForThirdPartySharing: true,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "Duration of app installation plus 90 days",
    dataStorageLocation: "Firebase/Google Cloud",
    gdprCompliant: true,
    ccpaCompliant: true,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToOptOut: true,
    thirdPartyServices: ["Google Analytics", "Google Ads", "Facebook Pixel", "AWS (Cloud Hosting)"],
    internationalTransfers: true,
    hipaaCompliant: false,
    pciCompliant: true,
    privacyContactMethod: "In-App and Email",
    notifyOnChanges: true,
  },
  educational: {
    businessType: "educational",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Billing/Payment Information", "Usage Analytics", "User Preferences"],
    collectsFromChildren: true,
    childrenAgeLimit: "13",
    automaticDataCollection: true,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies", "Performance/Analytics Cookies", "Functionality Cookies"],
    usesAnalytics: true,
    analyticsProvider: "Google Analytics",
    usesAdvertising: false,
    usesForMarketing: true,
    usesForPersonalization: true,
    usesForAnalytics: true,
    usesForThirdPartySharing: false,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "Duration of enrollment plus 5 years",
    dataStorageLocation: "Educational cloud providers",
    gdprCompliant: true,
    ccpaCompliant: true,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToOptOut: true,
    thirdPartyServices: ["Google Analytics", "Stripe (Payments)", "AWS (Cloud Hosting)"],
    internationalTransfers: false,
    hipaaCompliant: false,
    pciCompliant: true,
    privacyContactMethod: "Email",
    notifyOnChanges: true,
  },
  healthcare: {
    businessType: "healthcare",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Billing/Payment Information", "Health Information", "Government ID"],
    collectsFromChildren: false,
    childrenAgeLimit: "18",
    automaticDataCollection: false,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies"],
    usesAnalytics: true,
    analyticsProvider: "HIPAA-compliant analytics",
    usesAdvertising: false,
    usesForMarketing: false,
    usesForPersonalization: true,
    usesForAnalytics: true,
    usesForThirdPartySharing: false,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "As required by healthcare regulations (typically 7+ years)",
    dataStorageLocation: "HIPAA-compliant cloud infrastructure",
    gdprCompliant: true,
    ccpaCompliant: true,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToOptOut: true,
    thirdPartyServices: ["AWS (Cloud Hosting)", "Stripe (Payments)"],
    internationalTransfers: false,
    hipaaCompliant: true,
    pciCompliant: true,
    privacyContactMethod: "Secure Email and Phone",
    notifyOnChanges: true,
  },
  fintech: {
    businessType: "fintech",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Phone Number", "Billing/Payment Information", "Government ID", "Device Information", "Location Data"],
    collectsFromChildren: false,
    childrenAgeLimit: "18",
    automaticDataCollection: true,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies", "Performance/Analytics Cookies"],
    usesAnalytics: true,
    analyticsProvider: "Custom/Internal Analytics",
    usesAdvertising: false,
    usesForMarketing: true,
    usesForPersonalization: true,
    usesForAnalytics: true,
    usesForThirdPartySharing: true,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "As required by financial regulations (typically 7+ years)",
    dataStorageLocation: "PCI-DSS compliant data centers",
    gdprCompliant: true,
    ccpaCompliant: true,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToOptOut: true,
    thirdPartyServices: ["AWS (Cloud Hosting)", "Stripe (Payments)"],
    internationalTransfers: true,
    hipaaCompliant: false,
    pciCompliant: true,
    privacyContactMethod: "Secure Email",
    notifyOnChanges: true,
  },
  gaming: {
    businessType: "gaming",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address", "Billing/Payment Information", "Device Information", "Usage Analytics", "User Preferences", "Social Media Profiles"],
    collectsFromChildren: true,
    childrenAgeLimit: "13",
    automaticDataCollection: true,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies", "Performance/Analytics Cookies", "Functionality Cookies", "Targeting/Advertising Cookies"],
    usesAnalytics: true,
    analyticsProvider: "Unity Analytics / Custom",
    usesAdvertising: true,
    usesForMarketing: true,
    usesForPersonalization: true,
    usesForAnalytics: true,
    usesForThirdPartySharing: true,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "Duration of account plus 1 year",
    dataStorageLocation: "Gaming cloud infrastructure",
    gdprCompliant: true,
    ccpaCompliant: true,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToOptOut: true,
    thirdPartyServices: ["Google Analytics", "Google Ads", "Facebook Pixel", "AWS (Cloud Hosting)", "Stripe (Payments)"],
    internationalTransfers: true,
    hipaaCompliant: false,
    pciCompliant: true,
    privacyContactMethod: "In-Game and Email",
    notifyOnChanges: true,
  },
  general: {
    businessType: "general",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address"],
    collectsFromChildren: false,
    childrenAgeLimit: "18",
    automaticDataCollection: true,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies", "Performance/Analytics Cookies"],
    usesAnalytics: true,
    analyticsProvider: "Google Analytics",
    usesAdvertising: false,
    usesForMarketing: true,
    usesForPersonalization: false,
    usesForAnalytics: true,
    usesForThirdPartySharing: false,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "2 years",
    dataStorageLocation: "Cloud servers",
    gdprCompliant: false,
    ccpaCompliant: false,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: false,
    rightToOptOut: true,
    thirdPartyServices: ["Google Analytics"],
    internationalTransfers: false,
    hipaaCompliant: false,
    pciCompliant: false,
    privacyContactMethod: "Email",
    notifyOnChanges: true,
  },
};

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

  // Privacy Policy State
  const [privacyDetails, setPrivacyDetails] = useState<PrivacyPolicyDetails>({
    businessName: "",
    businessType: "",
    websiteUrl: "",
    contactEmail: "",
    dpoEmail: "",
    effectiveDate: "",
    jurisdiction: "India",
    collectsPersonalData: true,
    dataTypes: ["Name and Contact Information", "Email Address"],
    collectsFromChildren: false,
    childrenAgeLimit: "13",
    automaticDataCollection: true,
    usesCookies: true,
    cookieTypes: ["Essential/Necessary Cookies"],
    usesAnalytics: true,
    analyticsProvider: "Google Analytics",
    usesAdvertising: false,
    usesForMarketing: true,
    usesForPersonalization: false,
    usesForAnalytics: true,
    usesForThirdPartySharing: false,
    sellsData: false,
    dataEncryption: true,
    dataRetentionPeriod: "2 years",
    dataStorageLocation: "Cloud servers",
    gdprCompliant: false,
    ccpaCompliant: false,
    rightToAccess: true,
    rightToDelete: true,
    rightToPortability: false,
    rightToOptOut: true,
    thirdPartyServices: [],
    internationalTransfers: false,
    hipaaCompliant: false,
    pciCompliant: false,
    privacyContactMethod: "Email",
    notifyOnChanges: true,
  });
  const [generatedPrivacyPolicy, setGeneratedPrivacyPolicy] = useState<string>("");

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

  const addPresetClause = (preset: { title: string; content: string }) => {
    // Check if clause with same title already exists
    if (tncDetails.customClauses.some(c => c.title === preset.title)) {
      toast({
        title: "Clause Already Added",
        description: `"${preset.title}" is already in your custom clauses.`,
        variant: "destructive",
      });
      return;
    }
    setTncDetails((prev) => ({
      ...prev,
      customClauses: [...prev.customClauses, { title: preset.title, content: preset.content }],
    }));
    toast({
      title: "Clause Added",
      description: `"${preset.title}" has been added to your custom clauses.`,
    });
  };

  const applyTnCPreset = (businessType: string) => {
    const preset = tncPresets[businessType];
    if (preset) {
      setTncDetails((prev) => ({
        ...prev,
        ...preset,
        // Preserve user-entered basic info
        businessName: prev.businessName,
        websiteUrl: prev.websiteUrl,
        contactEmail: prev.contactEmail,
        effectiveDate: prev.effectiveDate,
        jurisdiction: prev.jurisdiction,
        customClauses: prev.customClauses,
      }));
      const businessLabel = businessTypes.find((b) => b.value === businessType)?.label || businessType;
      toast({
        title: "Template Applied",
        description: `${businessLabel} preset has been loaded with recommended settings.`,
      });
    }
  };

  // Privacy Policy handlers
  const handlePrivacyChange = <K extends keyof PrivacyPolicyDetails>(field: K, value: PrivacyPolicyDetails[K]) => {
    setPrivacyDetails((prev) => ({ ...prev, [field]: value }));
  };

  const togglePrivacyDataType = (dataType: string) => {
    setPrivacyDetails((prev) => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dataType)
        ? prev.dataTypes.filter((d) => d !== dataType)
        : [...prev.dataTypes, dataType],
    }));
  };

  const toggleCookieType = (cookieType: string) => {
    setPrivacyDetails((prev) => ({
      ...prev,
      cookieTypes: prev.cookieTypes.includes(cookieType)
        ? prev.cookieTypes.filter((c) => c !== cookieType)
        : [...prev.cookieTypes, cookieType],
    }));
  };

  const toggleThirdPartyService = (service: string) => {
    setPrivacyDetails((prev) => ({
      ...prev,
      thirdPartyServices: prev.thirdPartyServices.includes(service)
        ? prev.thirdPartyServices.filter((s) => s !== service)
        : [...prev.thirdPartyServices, service],
    }));
  };

  const applyPrivacyPreset = (businessType: string) => {
    const preset = privacyPolicyPresets[businessType];
    if (preset) {
      setPrivacyDetails((prev) => ({
        ...prev,
        ...preset,
        // Preserve user-entered basic info
        businessName: prev.businessName,
        websiteUrl: prev.websiteUrl,
        contactEmail: prev.contactEmail,
        dpoEmail: prev.dpoEmail,
        effectiveDate: prev.effectiveDate,
        jurisdiction: prev.jurisdiction,
      }));
      const businessLabel = businessTypes.find((b) => b.value === businessType)?.label || businessType;
      toast({
        title: "Template Applied",
        description: `${businessLabel} privacy policy preset has been loaded.`,
      });
    }
  };

  const resetPrivacyPolicy = () => {
    setPrivacyDetails({
      businessName: "",
      businessType: "",
      websiteUrl: "",
      contactEmail: "",
      dpoEmail: "",
      effectiveDate: "",
      jurisdiction: "India",
      collectsPersonalData: true,
      dataTypes: ["Name and Contact Information", "Email Address"],
      collectsFromChildren: false,
      childrenAgeLimit: "13",
      automaticDataCollection: true,
      usesCookies: true,
      cookieTypes: ["Essential/Necessary Cookies"],
      usesAnalytics: true,
      analyticsProvider: "Google Analytics",
      usesAdvertising: false,
      usesForMarketing: true,
      usesForPersonalization: false,
      usesForAnalytics: true,
      usesForThirdPartySharing: false,
      sellsData: false,
      dataEncryption: true,
      dataRetentionPeriod: "2 years",
      dataStorageLocation: "Cloud servers",
      gdprCompliant: false,
      ccpaCompliant: false,
      rightToAccess: true,
      rightToDelete: true,
      rightToPortability: false,
      rightToOptOut: true,
      thirdPartyServices: [],
      internationalTransfers: false,
      hipaaCompliant: false,
      pciCompliant: false,
      privacyContactMethod: "Email",
      notifyOnChanges: true,
    });
    setGeneratedPrivacyPolicy("");
    toast({
      title: "Privacy Policy Form Reset",
      description: "All privacy policy fields have been cleared.",
    });
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

  const generatePrivacyPolicy = () => {
    if (!privacyDetails.businessName || !privacyDetails.businessType) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the business name and type.",
        variant: "destructive",
      });
      return;
    }

    const businessLabel = businessTypes.find((b) => b.value === privacyDetails.businessType)?.label || privacyDetails.businessType;
    let policy = "";

    // Header
    policy += `PRIVACY POLICY\n`;
    policy += `${"═".repeat(60)}\n\n`;
    policy += `Last Updated: ${privacyDetails.effectiveDate || new Date().toLocaleDateString()}\n\n`;
    policy += `${privacyDetails.businessName} ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our ${businessLabel.toLowerCase()} services${privacyDetails.websiteUrl ? ` at ${privacyDetails.websiteUrl}` : ""}.\n\n`;
    policy += `Please read this Privacy Policy carefully. By using our services, you consent to the data practices described in this policy.\n\n`;
    policy += `${"─".repeat(60)}\n\n`;

    // Section 1: Information We Collect
    policy += `1. INFORMATION WE COLLECT\n\n`;
    
    if (privacyDetails.collectsPersonalData && privacyDetails.dataTypes.length > 0) {
      policy += `1.1 Personal Information\n`;
      policy += `We may collect the following types of personal information:\n`;
      privacyDetails.dataTypes.forEach((type) => {
        policy += `  • ${type}\n`;
      });
      policy += `\n`;
    }
    
    if (privacyDetails.automaticDataCollection) {
      policy += `1.2 Automatically Collected Information\n`;
      policy += `When you access our services, we automatically collect:\n`;
      policy += `  • IP address and browser type\n`;
      policy += `  • Device identifiers and operating system\n`;
      policy += `  • Pages visited and time spent\n`;
      policy += `  • Referring URL and search terms\n`;
      policy += `  • Click patterns and navigation data\n\n`;
    }

    if (privacyDetails.collectsFromChildren) {
      policy += `1.3 Children's Information\n`;
      policy += `Our services may be used by individuals under ${privacyDetails.childrenAgeLimit} years of age with parental consent. We comply with COPPA and other applicable children's privacy laws. We do not knowingly collect personal information from children without verifiable parental consent.\n\n`;
    } else {
      policy += `1.3 Children's Privacy\n`;
      policy += `Our services are not intended for individuals under ${privacyDetails.childrenAgeLimit} years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.\n\n`;
    }

    // Section 2: Cookies and Tracking
    if (privacyDetails.usesCookies) {
      policy += `2. COOKIES AND TRACKING TECHNOLOGIES\n\n`;
      policy += `2.1 Types of Cookies We Use\n`;
      policy += `We use the following types of cookies:\n`;
      privacyDetails.cookieTypes.forEach((type) => {
        policy += `  • ${type}\n`;
      });
      policy += `\n`;
      
      policy += `2.2 Cookie Control\n`;
      policy += `You can control cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our services.\n\n`;
    }

    if (privacyDetails.usesAnalytics) {
      policy += `2.3 Analytics\n`;
      policy += `We use ${privacyDetails.analyticsProvider || "analytics services"} to understand how users interact with our services. This helps us improve user experience and service performance.\n\n`;
    }

    if (privacyDetails.usesAdvertising) {
      policy += `2.4 Advertising\n`;
      policy += `We may use third-party advertising services to display relevant advertisements. These services may use cookies and similar technologies to collect information about your browsing activities.\n\n`;
    }

    // Section 3: How We Use Information
    policy += `3. HOW WE USE YOUR INFORMATION\n\n`;
    policy += `We use the information we collect for the following purposes:\n`;
    policy += `  • To provide and maintain our services\n`;
    policy += `  • To process transactions and send related information\n`;
    policy += `  • To respond to your inquiries and provide customer support\n`;
    if (privacyDetails.usesForPersonalization) {
      policy += `  • To personalize your experience and deliver tailored content\n`;
    }
    if (privacyDetails.usesForMarketing) {
      policy += `  • To send promotional communications (with your consent)\n`;
    }
    if (privacyDetails.usesForAnalytics) {
      policy += `  • To analyze usage patterns and improve our services\n`;
    }
    policy += `  • To detect, prevent, and address technical issues and fraud\n`;
    policy += `  • To comply with legal obligations\n\n`;

    // Section 4: Data Sharing
    policy += `4. DISCLOSURE OF YOUR INFORMATION\n\n`;
    
    if (privacyDetails.usesForThirdPartySharing) {
      policy += `4.1 Third-Party Service Providers\n`;
      policy += `We may share your information with third-party service providers who perform services on our behalf:\n`;
      if (privacyDetails.thirdPartyServices.length > 0) {
        privacyDetails.thirdPartyServices.forEach((service) => {
          policy += `  • ${service}\n`;
        });
      }
      policy += `\nThese providers are contractually obligated to protect your information and may only use it for the specific purposes we authorize.\n\n`;
    }

    if (privacyDetails.sellsData) {
      policy += `4.2 Sale of Data\n`;
      policy += `We may sell or share your personal information with third parties for commercial purposes. You have the right to opt-out of such sales as described in the "Your Rights" section below.\n\n`;
    } else {
      policy += `4.2 No Sale of Data\n`;
      policy += `We do not sell your personal information to third parties.\n\n`;
    }

    policy += `4.3 Legal Requirements\n`;
    policy += `We may disclose your information:\n`;
    policy += `  • To comply with legal obligations or court orders\n`;
    policy += `  • To protect our rights, privacy, safety, or property\n`;
    policy += `  • In connection with a merger, acquisition, or sale of assets\n`;
    policy += `  • With your consent or at your direction\n\n`;

    // Section 5: Data Security
    policy += `5. DATA SECURITY\n\n`;
    if (privacyDetails.dataEncryption) {
      policy += `We implement appropriate technical and organizational security measures to protect your personal information, including:\n`;
      policy += `  • Encryption of data in transit (SSL/TLS) and at rest\n`;
      policy += `  • Secure access controls and authentication\n`;
      policy += `  • Regular security assessments and audits\n`;
      policy += `  • Employee training on data protection\n\n`;
    } else {
      policy += `We implement reasonable security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure.\n\n`;
    }

    // Section 6: Data Retention
    policy += `6. DATA RETENTION\n\n`;
    policy += `We retain your personal information for: ${privacyDetails.dataRetentionPeriod || "as long as necessary to fulfill the purposes outlined in this Privacy Policy"}.\n\n`;
    policy += `After the retention period, we will securely delete or anonymize your information unless longer retention is required by law.\n\n`;

    // Section 7: International Transfers
    if (privacyDetails.internationalTransfers) {
      policy += `7. INTERNATIONAL DATA TRANSFERS\n\n`;
      policy += `Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws.\n\n`;
      policy += `When we transfer your data internationally, we ensure appropriate safeguards are in place, including:\n`;
      policy += `  • Standard contractual clauses approved by regulatory authorities\n`;
      policy += `  • Binding corporate rules for intra-group transfers\n`;
      policy += `  • Certification under approved frameworks\n\n`;
    }

    // Section 8: Your Rights
    policy += `${privacyDetails.internationalTransfers ? "8" : "7"}. YOUR RIGHTS\n\n`;
    
    policy += `Depending on your location, you may have the following rights:\n`;
    if (privacyDetails.rightToAccess) {
      policy += `  • Right to Access: Request a copy of your personal information\n`;
    }
    if (privacyDetails.rightToDelete) {
      policy += `  • Right to Deletion: Request deletion of your personal information\n`;
    }
    if (privacyDetails.rightToPortability) {
      policy += `  • Right to Portability: Receive your data in a structured, commonly used format\n`;
    }
    if (privacyDetails.rightToOptOut) {
      policy += `  • Right to Opt-Out: Opt-out of marketing communications and data sales\n`;
    }
    policy += `  • Right to Correction: Request correction of inaccurate information\n`;
    policy += `  • Right to Object: Object to certain processing of your information\n\n`;

    policy += `To exercise these rights, contact us using the information provided below.\n\n`;

    // GDPR Section
    if (privacyDetails.gdprCompliant) {
      policy += `GDPR COMPLIANCE (FOR EEA USERS)\n\n`;
      policy += `If you are in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):\n\n`;
      policy += `Legal Basis for Processing:\n`;
      policy += `  • Contractual necessity: To fulfill our contract with you\n`;
      policy += `  • Legitimate interests: To operate and improve our services\n`;
      policy += `  • Consent: For marketing and optional data processing\n`;
      policy += `  • Legal obligation: To comply with applicable laws\n\n`;
      policy += `Data Protection Officer:\n`;
      policy += `You may contact our Data Protection Officer at: ${privacyDetails.dpoEmail || privacyDetails.contactEmail || "[DPO Email]"}\n\n`;
      policy += `You have the right to lodge a complaint with your local supervisory authority if you believe your rights have been violated.\n\n`;
    }

    // CCPA Section
    if (privacyDetails.ccpaCompliant) {
      policy += `CCPA COMPLIANCE (FOR CALIFORNIA RESIDENTS)\n\n`;
      policy += `If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with specific rights:\n\n`;
      policy += `Your CCPA Rights:\n`;
      policy += `  • Right to Know: What personal information we collect, use, and disclose\n`;
      policy += `  • Right to Delete: Request deletion of your personal information\n`;
      policy += `  • Right to Opt-Out: Opt-out of the sale of personal information\n`;
      policy += `  • Right to Non-Discrimination: We will not discriminate against you for exercising your rights\n\n`;
      policy += `Categories of Information Collected in the Past 12 Months:\n`;
      policy += `  • Identifiers (name, email, IP address)\n`;
      policy += `  • Commercial information (transaction history)\n`;
      policy += `  • Internet activity (browsing history, interactions)\n`;
      policy += `  • Geolocation data\n\n`;
      if (privacyDetails.sellsData) {
        policy += `To opt-out of the sale of your personal information, please contact us or use our "Do Not Sell My Personal Information" link.\n\n`;
      }
    }

    // Industry-Specific Compliance
    if (privacyDetails.hipaaCompliant) {
      policy += `HIPAA COMPLIANCE\n\n`;
      policy += `We comply with the Health Insurance Portability and Accountability Act (HIPAA) for protected health information (PHI). We implement administrative, physical, and technical safeguards to protect PHI.\n\n`;
      policy += `Your HIPAA Rights:\n`;
      policy += `  • Access your health records\n`;
      policy += `  • Request amendments to your records\n`;
      policy += `  • Receive an accounting of disclosures\n`;
      policy += `  • Request restrictions on certain uses and disclosures\n\n`;
    }

    if (privacyDetails.pciCompliant) {
      policy += `PCI-DSS COMPLIANCE\n\n`;
      policy += `We comply with the Payment Card Industry Data Security Standard (PCI-DSS) for handling payment card information. Credit card data is encrypted and processed through secure, certified payment processors.\n\n`;
    }

    // Section 9: Updates
    policy += `${"─".repeat(60)}\n\n`;
    policy += `CHANGES TO THIS PRIVACY POLICY\n\n`;
    if (privacyDetails.notifyOnChanges) {
      policy += `We may update this Privacy Policy from time to time. We will notify you of any material changes by:\n`;
      policy += `  • Posting the updated policy on our website\n`;
      policy += `  • Updating the "Last Updated" date\n`;
      policy += `  • Sending an email notification (for material changes)\n\n`;
    } else {
      policy += `We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last Updated" date.\n\n`;
    }

    // Contact Information
    policy += `CONTACT US\n\n`;
    policy += `If you have questions or concerns about this Privacy Policy or our data practices, please contact us:\n\n`;
    policy += `${privacyDetails.businessName}\n`;
    if (privacyDetails.contactEmail) policy += `Email: ${privacyDetails.contactEmail}\n`;
    if (privacyDetails.dpoEmail && privacyDetails.gdprCompliant) policy += `Data Protection Officer: ${privacyDetails.dpoEmail}\n`;
    if (privacyDetails.websiteUrl) policy += `Website: ${privacyDetails.websiteUrl}\n`;
    policy += `Preferred Contact Method: ${privacyDetails.privacyContactMethod}\n\n`;

    // Footer
    policy += `${"═".repeat(60)}\n`;
    policy += `© ${new Date().getFullYear()} ${privacyDetails.businessName}. All rights reserved.\n`;

    setGeneratedPrivacyPolicy(policy);
    toast({
      title: "Privacy Policy Generated",
      description: "Your Privacy Policy has been drafted successfully.",
    });
  };

  const exportPrivacyPolicyToPDF = () => {
    if (!generatedPrivacyPolicy) {
      toast({
        title: "No Privacy Policy",
        description: "Please generate a Privacy Policy first.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Privacy Policy - ${privacyDetails.businessName}`, 105, 15, { align: "center" });
    
    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const lines = doc.splitTextToSize(generatedPrivacyPolicy, 180);
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
    
    doc.save(`Privacy_Policy_${privacyDetails.businessName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
    
    toast({
      title: "PDF Exported",
      description: "Your Privacy Policy has been saved as PDF.",
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
                  Legal Document Drafter
                </h1>
                <p className="text-sm text-muted-foreground">Draft contracts, T&Cs, and privacy policies</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "contracts" && (
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
              )}
              {activeTab === "tnc" && (
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
              {activeTab === "privacy" && (
                <>
                  <Button variant="outline" onClick={resetPrivacyPolicy}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={exportPrivacyPolicyToPDF} disabled={!generatedPrivacyPolicy}>
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
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contracts
            </TabsTrigger>
            <TabsTrigger value="tnc" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Terms & Conditions
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Privacy Policy
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
                        
                        {/* Template Preset Button */}
                        {tncDetails.businessType && (
                          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium">Load Template Preset</p>
                                <p className="text-xs text-muted-foreground">
                                  Apply recommended settings for {businessTypes.find(b => b.value === tncDetails.businessType)?.label || tncDetails.businessType}
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => applyTnCPreset(tncDetails.businessType)}
                                className="whitespace-nowrap"
                              >
                                Apply Template
                              </Button>
                            </div>
                          </div>
                        )}
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
                        {/* Preset Clause Suggestions */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <Label className="text-sm font-medium">Quick Add Preset Clauses</Label>
                          </div>
                          <div className="grid gap-2">
                            {["common", "useful", "unique"].map((category) => (
                              <div key={category} className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground capitalize">{category === "common" ? "📋 Common" : category === "useful" ? "⭐ Most Useful" : "✨ Unique"}</p>
                                <div className="flex flex-wrap gap-1">
                                  {customClausePresets
                                    .filter((p) => p.category === category)
                                    .map((preset) => (
                                      <Button
                                        key={preset.title}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-7"
                                        onClick={() => addPresetClause(preset)}
                                        disabled={tncDetails.customClauses.some(c => c.title === preset.title)}
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        {preset.title}
                                      </Button>
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <Label className="text-sm font-medium mb-2 block">Your Custom Clauses ({tncDetails.customClauses.length})</Label>
                          {tncDetails.customClauses.map((clause, index) => (
                            <div key={index} className="border rounded-lg p-3 space-y-2 mb-3">
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
                            Add Blank Custom Clause
                          </Button>
                        </div>
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

          {/* Privacy Policy Tab */}
          <TabsContent value="privacy">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Privacy Policy Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="multiple" defaultValue={["basic", "data", "cookies"]} className="w-full">
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
                            value={privacyDetails.businessName}
                            onChange={(e) => handlePrivacyChange("businessName", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Business Type *</Label>
                          <Select value={privacyDetails.businessType} onValueChange={(v) => handlePrivacyChange("businessType", v)}>
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
                        
                        {/* Template Preset Button */}
                        {privacyDetails.businessType && (
                          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium">Load Template Preset</p>
                                <p className="text-xs text-muted-foreground">
                                  Apply GDPR/CCPA-compliant settings for {businessTypes.find(b => b.value === privacyDetails.businessType)?.label}
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => applyPrivacyPreset(privacyDetails.businessType)}
                                className="whitespace-nowrap"
                              >
                                Apply Template
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Website URL</Label>
                            <Input
                              placeholder="https://example.com"
                              value={privacyDetails.websiteUrl}
                              onChange={(e) => handlePrivacyChange("websiteUrl", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Contact Email</Label>
                            <Input
                              placeholder="privacy@example.com"
                              value={privacyDetails.contactEmail}
                              onChange={(e) => handlePrivacyChange("contactEmail", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>DPO Email (for GDPR)</Label>
                            <Input
                              placeholder="dpo@example.com"
                              value={privacyDetails.dpoEmail}
                              onChange={(e) => handlePrivacyChange("dpoEmail", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Effective Date</Label>
                            <Input
                              type="date"
                              value={privacyDetails.effectiveDate}
                              onChange={(e) => handlePrivacyChange("effectiveDate", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Jurisdiction</Label>
                          <Input
                            placeholder="India"
                            value={privacyDetails.jurisdiction}
                            onChange={(e) => handlePrivacyChange("jurisdiction", e.target.value)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Data Collection */}
                    <AccordionItem value="data">
                      <AccordionTrigger className="text-sm font-semibold">
                        Data Collection
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Collect Personal Data</Label>
                            <p className="text-xs text-muted-foreground">Platform collects user data</p>
                          </div>
                          <Switch
                            checked={privacyDetails.collectsPersonalData}
                            onCheckedChange={(v) => handlePrivacyChange("collectsPersonalData", v)}
                          />
                        </div>
                        {privacyDetails.collectsPersonalData && (
                          <div>
                            <Label className="mb-2 block">Data Types Collected</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {dataTypesOptions.map((dataType) => (
                                <div key={dataType} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`privacy-${dataType}`}
                                    checked={privacyDetails.dataTypes.includes(dataType)}
                                    onCheckedChange={() => togglePrivacyDataType(dataType)}
                                  />
                                  <label htmlFor={`privacy-${dataType}`} className="text-xs cursor-pointer">
                                    {dataType}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Automatic Data Collection</Label>
                            <p className="text-xs text-muted-foreground">Collect IP, device info, etc.</p>
                          </div>
                          <Switch
                            checked={privacyDetails.automaticDataCollection}
                            onCheckedChange={(v) => handlePrivacyChange("automaticDataCollection", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Collect Data from Children</Label>
                            <p className="text-xs text-muted-foreground">COPPA compliance required</p>
                          </div>
                          <Switch
                            checked={privacyDetails.collectsFromChildren}
                            onCheckedChange={(v) => handlePrivacyChange("collectsFromChildren", v)}
                          />
                        </div>
                        <div>
                          <Label>Minimum Age Requirement</Label>
                          <Select value={privacyDetails.childrenAgeLimit} onValueChange={(v) => handlePrivacyChange("childrenAgeLimit", v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="13">13 years (COPPA)</SelectItem>
                              <SelectItem value="16">16 years (GDPR)</SelectItem>
                              <SelectItem value="18">18 years (Adult)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Cookies & Tracking */}
                    <AccordionItem value="cookies">
                      <AccordionTrigger className="text-sm font-semibold">
                        Cookies & Tracking
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Use Cookies</Label>
                            <p className="text-xs text-muted-foreground">Website uses cookies</p>
                          </div>
                          <Switch
                            checked={privacyDetails.usesCookies}
                            onCheckedChange={(v) => handlePrivacyChange("usesCookies", v)}
                          />
                        </div>
                        {privacyDetails.usesCookies && (
                          <div>
                            <Label className="mb-2 block">Cookie Types</Label>
                            <div className="space-y-2">
                              {cookieTypeOptions.map((cookieType) => (
                                <div key={cookieType} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={cookieType}
                                    checked={privacyDetails.cookieTypes.includes(cookieType)}
                                    onCheckedChange={() => toggleCookieType(cookieType)}
                                  />
                                  <label htmlFor={cookieType} className="text-xs cursor-pointer">
                                    {cookieType}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Use Analytics</Label>
                            <p className="text-xs text-muted-foreground">Track user behavior</p>
                          </div>
                          <Switch
                            checked={privacyDetails.usesAnalytics}
                            onCheckedChange={(v) => handlePrivacyChange("usesAnalytics", v)}
                          />
                        </div>
                        {privacyDetails.usesAnalytics && (
                          <div>
                            <Label>Analytics Provider</Label>
                            <Input
                              placeholder="e.g., Google Analytics"
                              value={privacyDetails.analyticsProvider}
                              onChange={(e) => handlePrivacyChange("analyticsProvider", e.target.value)}
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Use Advertising</Label>
                            <p className="text-xs text-muted-foreground">Display targeted ads</p>
                          </div>
                          <Switch
                            checked={privacyDetails.usesAdvertising}
                            onCheckedChange={(v) => handlePrivacyChange("usesAdvertising", v)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Data Usage */}
                    <AccordionItem value="usage">
                      <AccordionTrigger className="text-sm font-semibold">
                        Data Usage
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Use for Marketing</Label>
                            <p className="text-xs text-muted-foreground">Send promotional content</p>
                          </div>
                          <Switch
                            checked={privacyDetails.usesForMarketing}
                            onCheckedChange={(v) => handlePrivacyChange("usesForMarketing", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Use for Personalization</Label>
                            <p className="text-xs text-muted-foreground">Customize user experience</p>
                          </div>
                          <Switch
                            checked={privacyDetails.usesForPersonalization}
                            onCheckedChange={(v) => handlePrivacyChange("usesForPersonalization", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Share with Third Parties</Label>
                            <p className="text-xs text-muted-foreground">Share data with partners</p>
                          </div>
                          <Switch
                            checked={privacyDetails.usesForThirdPartySharing}
                            onCheckedChange={(v) => handlePrivacyChange("usesForThirdPartySharing", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Sell Personal Data</Label>
                            <p className="text-xs text-muted-foreground text-destructive">Important for CCPA</p>
                          </div>
                          <Switch
                            checked={privacyDetails.sellsData}
                            onCheckedChange={(v) => handlePrivacyChange("sellsData", v)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Third Party Services */}
                    <AccordionItem value="thirdparty">
                      <AccordionTrigger className="text-sm font-semibold">
                        Third-Party Services
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div>
                          <Label className="mb-2 block">Services Used</Label>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                            {thirdPartyServiceOptions.map((service) => (
                              <div key={service} className="flex items-center space-x-2">
                                <Checkbox
                                  id={service}
                                  checked={privacyDetails.thirdPartyServices.includes(service)}
                                  onCheckedChange={() => toggleThirdPartyService(service)}
                                />
                                <label htmlFor={service} className="text-xs cursor-pointer">
                                  {service}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>International Data Transfers</Label>
                            <p className="text-xs text-muted-foreground">Transfer data across borders</p>
                          </div>
                          <Switch
                            checked={privacyDetails.internationalTransfers}
                            onCheckedChange={(v) => handlePrivacyChange("internationalTransfers", v)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Data Security */}
                    <AccordionItem value="security">
                      <AccordionTrigger className="text-sm font-semibold">
                        Data Security & Retention
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Data Encryption</Label>
                            <p className="text-xs text-muted-foreground">Encrypt data in transit/rest</p>
                          </div>
                          <Switch
                            checked={privacyDetails.dataEncryption}
                            onCheckedChange={(v) => handlePrivacyChange("dataEncryption", v)}
                          />
                        </div>
                        <div>
                          <Label>Data Retention Period</Label>
                          <Input
                            placeholder="e.g., 2 years after account deletion"
                            value={privacyDetails.dataRetentionPeriod}
                            onChange={(e) => handlePrivacyChange("dataRetentionPeriod", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Data Storage Location</Label>
                          <Input
                            placeholder="e.g., AWS servers in Mumbai, India"
                            value={privacyDetails.dataStorageLocation}
                            onChange={(e) => handlePrivacyChange("dataStorageLocation", e.target.value)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Compliance */}
                    <AccordionItem value="compliance">
                      <AccordionTrigger className="text-sm font-semibold">
                        Regulatory Compliance
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>GDPR Compliant</Label>
                            <p className="text-xs text-muted-foreground">EU data protection</p>
                          </div>
                          <Switch
                            checked={privacyDetails.gdprCompliant}
                            onCheckedChange={(v) => handlePrivacyChange("gdprCompliant", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>CCPA Compliant</Label>
                            <p className="text-xs text-muted-foreground">California privacy law</p>
                          </div>
                          <Switch
                            checked={privacyDetails.ccpaCompliant}
                            onCheckedChange={(v) => handlePrivacyChange("ccpaCompliant", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>HIPAA Compliant</Label>
                            <p className="text-xs text-muted-foreground">Healthcare data protection</p>
                          </div>
                          <Switch
                            checked={privacyDetails.hipaaCompliant}
                            onCheckedChange={(v) => handlePrivacyChange("hipaaCompliant", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>PCI-DSS Compliant</Label>
                            <p className="text-xs text-muted-foreground">Payment card security</p>
                          </div>
                          <Switch
                            checked={privacyDetails.pciCompliant}
                            onCheckedChange={(v) => handlePrivacyChange("pciCompliant", v)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* User Rights */}
                    <AccordionItem value="rights">
                      <AccordionTrigger className="text-sm font-semibold">
                        User Rights
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Right to Access</Label>
                            <p className="text-xs text-muted-foreground">Users can request their data</p>
                          </div>
                          <Switch
                            checked={privacyDetails.rightToAccess}
                            onCheckedChange={(v) => handlePrivacyChange("rightToAccess", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Right to Delete</Label>
                            <p className="text-xs text-muted-foreground">Users can request deletion</p>
                          </div>
                          <Switch
                            checked={privacyDetails.rightToDelete}
                            onCheckedChange={(v) => handlePrivacyChange("rightToDelete", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Right to Data Portability</Label>
                            <p className="text-xs text-muted-foreground">Export data in standard format</p>
                          </div>
                          <Switch
                            checked={privacyDetails.rightToPortability}
                            onCheckedChange={(v) => handlePrivacyChange("rightToPortability", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Right to Opt-Out</Label>
                            <p className="text-xs text-muted-foreground">Opt-out of marketing/sales</p>
                          </div>
                          <Switch
                            checked={privacyDetails.rightToOptOut}
                            onCheckedChange={(v) => handlePrivacyChange("rightToOptOut", v)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Contact & Updates */}
                    <AccordionItem value="contact">
                      <AccordionTrigger className="text-sm font-semibold">
                        Contact & Updates
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div>
                          <Label>Privacy Contact Method</Label>
                          <Select value={privacyDetails.privacyContactMethod} onValueChange={(v) => handlePrivacyChange("privacyContactMethod", v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Email">Email</SelectItem>
                              <SelectItem value="Email and Web Form">Email and Web Form</SelectItem>
                              <SelectItem value="In-App and Email">In-App and Email</SelectItem>
                              <SelectItem value="Phone and Email">Phone and Email</SelectItem>
                              <SelectItem value="Secure Portal">Secure Portal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Notify on Policy Changes</Label>
                            <p className="text-xs text-muted-foreground">Email users about updates</p>
                          </div>
                          <Switch
                            checked={privacyDetails.notifyOnChanges}
                            onCheckedChange={(v) => handlePrivacyChange("notifyOnChanges", v)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Button className="w-full" onClick={generatePrivacyPolicy}>
                    <Lock className="h-4 w-4 mr-2" />
                    Generate Privacy Policy
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy Policy Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedPrivacyPolicy ? (
                    <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                      {generatedPrivacyPolicy}
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground">
                      <Lock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Configure your privacy policy options and click "Generate Privacy Policy" to see the preview here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Disclaimer: This tool generates basic contract, T&C, and privacy policy templates for reference purposes only. 
          Please consult a legal professional before using these documents for official purposes.
        </p>
      </main>
    </div>
  );
};

export default ContractDrafter;
