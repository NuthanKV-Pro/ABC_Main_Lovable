import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, BookOpen, Copy, Check, ChevronDown, ChevronRight, FileText, Shield, Users, Briefcase, Scale, Handshake, Lock, UserCheck, Cpu, Rocket, ScrollText, Copyright, Fingerprint, Globe, Building2, Landmark, HardHat, Leaf, ShieldCheck, ShoppingCart, Download, FileDown, Pen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface Clause {
  id: string;
  title: string;
  description: string;
  fullText: string;
  tags: string[];
  importance: "essential" | "recommended" | "optional";
}

interface ClauseCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  contractTypes: string[];
  clauses: Clause[];
}

const clauseDatabase: ClauseCategory[] = [
  {
    id: "governance",
    name: "Governance & Control",
    icon: Users,
    description: "Board composition, voting rights, and decision-making clauses",
    contractTypes: ["Shareholders' Agreement", "Investment Agreement"],
    clauses: [
      {
        id: "board-composition",
        title: "Board Composition",
        description: "Defines the structure, size, and nomination rights for the Board of Directors.",
        fullText: `The Board of Directors shall consist of [●] directors. The Investor(s) shall have the right to nominate [●] director(s) to the Board for every [●]% of shareholding held. The Founders shall have the right to nominate [●] director(s). The Board shall also include [●] independent director(s) mutually agreed upon by the Parties. No business shall be transacted at a Board meeting unless a quorum of [●] directors, including at least one Investor nominee, is present.`,
        tags: ["board", "directors", "nomination", "quorum"],
        importance: "essential"
      },
      {
        id: "reserved-matters",
        title: "Reserved Matters (Veto Rights)",
        description: "Actions requiring prior written consent of investors or specific shareholders.",
        fullText: `The following matters shall require the prior written consent of the Investor Director(s) or holders of at least [●]% of the Preference Shares:\n\n(a) Any amendment to the Memorandum or Articles of Association;\n(b) Issuance of any new securities or creation of any ESOP pool beyond [●]%;\n(c) Declaration or payment of any dividend;\n(d) Any borrowing or indebtedness exceeding ₹[●] in aggregate;\n(e) Any related party transaction exceeding ₹[●];\n(f) Any merger, amalgamation, demerger, or change of control;\n(g) Commencement of any new line of business;\n(h) Appointment or removal of Key Managerial Personnel;\n(i) Any winding up, dissolution, or filing of bankruptcy;\n(j) Any single capital expenditure exceeding ₹[●].`,
        tags: ["veto", "consent", "investor protection", "approval"],
        importance: "essential"
      },
      {
        id: "information-rights",
        title: "Information Rights",
        description: "Investor's right to receive periodic financial and operational information.",
        fullText: `The Company shall provide to each Major Investor:\n\n(a) Audited annual financial statements within [90] days of financial year end;\n(b) Unaudited quarterly financial statements within [30] days of quarter end;\n(c) Monthly MIS reports including revenue, expenses, burn rate, and runway;\n(d) Annual budget and business plan at least [30] days before the financial year;\n(e) Cap table updated within [15] days of any change;\n(f) Prompt notice of any material litigation, regulatory action, or adverse event.\n\nThe Company shall also provide inspection rights to the Investor's representatives during normal business hours upon [7] days' prior written notice.`,
        tags: ["information", "reporting", "MIS", "financial statements", "inspection"],
        importance: "essential"
      }
    ]
  },
  {
    id: "transfer",
    name: "Share Transfer & Exit",
    icon: Handshake,
    description: "ROFR, tag-along, drag-along, and exit mechanism clauses",
    contractTypes: ["Shareholders' Agreement", "Share Purchase Agreement", "Investment Agreement"],
    clauses: [
      {
        id: "rofr",
        title: "Right of First Refusal (ROFR)",
        description: "Existing shareholders get first right to purchase shares before third-party sale.",
        fullText: `If any Shareholder ("Selling Shareholder") desires to transfer any Shares to a third party, the Selling Shareholder shall first offer such Shares to the other Shareholders ("Existing Shareholders") on the same terms and conditions. The Selling Shareholder shall deliver a Transfer Notice specifying the number of Shares, proposed price, and identity of the proposed transferee. The Existing Shareholders shall have [30] days from receipt of the Transfer Notice to exercise their ROFR on a pro-rata basis. If the Existing Shareholders do not exercise their ROFR in full, the Selling Shareholder may transfer the remaining Shares to the proposed transferee at a price not less than the offered price, within [60] days.`,
        tags: ["ROFR", "first refusal", "transfer", "pre-emptive"],
        importance: "essential"
      },
      {
        id: "tag-along",
        title: "Tag-Along Rights (Co-Sale)",
        description: "Minority shareholders can join a majority sale on the same terms.",
        fullText: `If a Founder or Promoter proposes to transfer Shares representing [●]% or more of the Company's share capital to a third party, each Investor shall have the right ("Tag-Along Right") to require the proposed transferee to purchase from such Investor, on the same terms and conditions, a proportionate number of Shares held by the Investor. The tag-along ratio shall be calculated as: (Investor's Shares / Total Shares held by Selling Shareholder + Investor) × Total Shares proposed to be transferred. The Selling Shareholder shall not complete the proposed transfer unless the third-party purchaser agrees to purchase the Investor's Shares on the same terms.`,
        tags: ["tag-along", "co-sale", "minority protection"],
        importance: "essential"
      },
      {
        id: "drag-along",
        title: "Drag-Along Rights",
        description: "Majority shareholders can compel minority to join in a sale of the company.",
        fullText: `If Shareholders holding at least [●]% of the Shares ("Drag Shareholders") approve a bona fide sale of [100]% of the Company's Shares to an independent third party at fair market value, the Drag Shareholders shall have the right to require all other Shareholders ("Dragged Shareholders") to sell their Shares to such third party on the same terms and conditions. The Dragged Shareholders shall execute all documents and take all actions necessary to consummate such sale. The sale price per Share shall be no less than [●] times the original issue price of the Preference Shares.`,
        tags: ["drag-along", "forced sale", "exit", "majority"],
        importance: "recommended"
      },
      {
        id: "lock-in",
        title: "Lock-In Period",
        description: "Restriction on share transfers for a specified period after investment.",
        fullText: `The Founders and Promoters shall not directly or indirectly sell, transfer, pledge, encumber, or otherwise dispose of any Shares held by them for a period of [●] years from the date of Closing ("Lock-In Period"), without the prior written consent of the Investor(s). After the Lock-In Period, any proposed transfer shall be subject to the ROFR and other transfer restrictions set out in this Agreement. Notwithstanding the above, transfers to Permitted Transferees (being immediate family members or a trust established for the Founder's benefit) shall be allowed, provided the Permitted Transferee executes a Deed of Adherence.`,
        tags: ["lock-in", "restriction", "founder", "vesting"],
        importance: "essential"
      },
      {
        id: "put-option",
        title: "Put Option / Liquidation Preference",
        description: "Investor's right to exit at a guaranteed return after a specified period.",
        fullText: `If a Qualified IPO or Trade Sale has not occurred within [●] years from the Closing Date, each Investor shall have the right to require the Promoters to purchase all of the Investor's Shares at a price equal to the higher of: (a) the original investment amount plus an IRR of [●]% per annum, compounded annually; or (b) the fair market value as determined by an independent valuer mutually agreed upon. The Promoters shall complete such buyback within [180] days of exercise of the Put Option. If the Promoters fail to complete the buyback, the Investors shall have the right to trigger a Drag-Along Sale.`,
        tags: ["put option", "exit", "liquidation preference", "IRR", "buyback"],
        importance: "recommended"
      }
    ]
  },
  {
    id: "anti-dilution",
    name: "Anti-Dilution & Valuation",
    icon: Shield,
    description: "Protection against dilution and valuation-related clauses",
    contractTypes: ["Investment Agreement", "Term Sheet", "Shareholders' Agreement"],
    clauses: [
      {
        id: "anti-dilution-full",
        title: "Anti-Dilution (Full Ratchet)",
        description: "Adjusts conversion price to the lowest subsequent round price.",
        fullText: `If the Company issues any New Securities at a price per share less than the Conversion Price of the Series [●] Preference Shares (a "Down Round"), the Conversion Price shall be reduced to equal the price per share at which such New Securities are issued ("Full Ratchet"). The adjustment shall apply regardless of the number of New Securities issued in the Down Round. Excluded from this provision are: (a) shares issued under an approved ESOP; (b) shares issued as consideration for acquisition approved by the Board; (c) shares issued upon conversion of existing convertible instruments.`,
        tags: ["anti-dilution", "full ratchet", "down round", "conversion"],
        importance: "essential"
      },
      {
        id: "anti-dilution-weighted",
        title: "Anti-Dilution (Weighted Average)",
        description: "A more balanced anti-dilution formula considering the size of the down round.",
        fullText: `If a Down Round occurs, the Conversion Price shall be adjusted using the Broad-Based Weighted Average formula:\n\nNew Conversion Price = Old CP × (A + B) / (A + C)\n\nWhere:\nA = Number of Shares outstanding immediately before the Down Round (on a fully-diluted basis)\nB = Number of Shares that the Down Round consideration would purchase at the Old CP\nC = Number of new Shares actually issued in the Down Round\n\nThis weighted average mechanism is more founder-friendly than Full Ratchet and is the market standard for Series A and later rounds.`,
        tags: ["anti-dilution", "weighted average", "broad-based", "conversion price"],
        importance: "essential"
      },
      {
        id: "pre-emptive-rights",
        title: "Pre-Emptive Rights (Pro-Rata)",
        description: "Investor's right to participate in future funding rounds to maintain ownership percentage.",
        fullText: `Each Major Investor shall have a pre-emptive right to subscribe for its Pro-Rata Share of any New Securities that the Company may issue from time to time, on the same price and terms. "Pro-Rata Share" means the ratio of the number of Shares held by the Investor to the total issued and outstanding Shares (on a fully-diluted basis). The Company shall give at least [15] business days' prior written notice of any proposed issuance of New Securities. If any Investor does not fully exercise its pre-emptive right, the unsubscribed portion shall be offered to other participating Investors on a pro-rata basis ("Over-Allotment Right").`,
        tags: ["pre-emptive", "pro-rata", "participation", "future rounds"],
        importance: "essential"
      }
    ]
  },
  {
    id: "employment",
    name: "Employment & Compensation",
    icon: Briefcase,
    description: "Salary, benefits, termination, and restrictive covenant clauses",
    contractTypes: ["Employment Agreement", "Offer Letter"],
    clauses: [
      {
        id: "compensation-structure",
        title: "Compensation & CTC Breakdown",
        description: "Detailed salary structure including fixed pay, variable pay, and benefits.",
        fullText: `The Employee's annual Cost-to-Company ("CTC") shall be ₹[●], structured as follows:\n\n(a) Basic Salary: ₹[●] per annum (40-50% of CTC)\n(b) House Rent Allowance (HRA): ₹[●] per annum\n(c) Special Allowance: ₹[●] per annum\n(d) Employer's PF Contribution: ₹[●] per annum (12% of Basic, capped at ₹1,800/month)\n(e) Gratuity: ₹[●] per annum (4.81% of Basic)\n(f) Performance Bonus: Up to ₹[●] per annum, payable at the Company's discretion based on individual and company performance\n(g) Medical Insurance: ₹[●] (family floater policy up to ₹[●] lakhs)\n\nThe CTC is subject to applicable tax deductions at source (TDS) as per the Income Tax Act, 1961.`,
        tags: ["CTC", "salary", "compensation", "HRA", "PF", "gratuity"],
        importance: "essential"
      },
      {
        id: "esop-grant",
        title: "ESOP / RSU Grant",
        description: "Stock option grant with vesting schedule and exercise terms.",
        fullText: `Subject to the terms of the Company's Employee Stock Option Plan ("ESOP Plan") and approval of the Board/Compensation Committee, the Employee shall be granted [●] stock options at an exercise price of ₹[●] per share. The options shall vest over [4] years with a [1]-year cliff as follows:\n\n- 25% of the options shall vest on the 1st anniversary of the Grant Date\n- Remaining 75% shall vest monthly over the next 36 months in equal instalments\n\nVested options may be exercised within [●] years from the date of vesting. Upon termination of employment (other than for Cause), the Employee shall have [90] days to exercise vested options. Unvested options shall lapse immediately upon termination. The options shall be subject to lock-in restrictions as per applicable SEBI/Companies Act regulations.`,
        tags: ["ESOP", "RSU", "stock options", "vesting", "cliff"],
        importance: "recommended"
      },
      {
        id: "termination-clause",
        title: "Termination & Notice Period",
        description: "Conditions and procedures for ending the employment relationship.",
        fullText: `Either Party may terminate this Agreement by giving [●] months' prior written notice or payment of [●] months' salary in lieu thereof ("Notice Period"). The Company may terminate the Employee's employment without notice or pay in lieu of notice for Cause, including:\n\n(a) Material breach of this Agreement or Company policies;\n(b) Conviction of a criminal offence involving moral turpitude;\n(c) Willful misconduct or gross negligence;\n(d) Persistent failure to perform duties after written warning;\n(e) Fraud, dishonesty, or misappropriation of Company funds.\n\nUpon termination, the Employee shall: (i) return all Company property within [7] days; (ii) resign from all positions held in the Company and its affiliates; (iii) cooperate in the orderly transition of responsibilities.`,
        tags: ["termination", "notice period", "cause", "resignation"],
        importance: "essential"
      },
      {
        id: "probation",
        title: "Probation Period",
        description: "Initial period of assessment with simplified termination terms.",
        fullText: `The Employee shall be on probation for a period of [●] months from the Date of Joining ("Probation Period"). During the Probation Period:\n\n(a) Either Party may terminate employment by giving [●] days' written notice;\n(b) The Employee shall not be entitled to Performance Bonus or variable pay;\n(c) ESOP grant, if applicable, shall commence only after confirmation;\n(d) Leave entitlement shall be on a pro-rata basis.\n\nUpon satisfactory completion of the Probation Period, the Employee shall be confirmed in writing. The Company reserves the right to extend the Probation Period by up to [●] months if performance is not satisfactory, with written communication of specific areas of improvement required.`,
        tags: ["probation", "confirmation", "assessment", "trial period"],
        importance: "recommended"
      }
    ]
  },
  {
    id: "confidentiality",
    name: "Confidentiality & IP",
    icon: Lock,
    description: "NDA, IP assignment, and trade secret protection clauses",
    contractTypes: ["NDA", "Employment Agreement", "Non-Compete Agreement"],
    clauses: [
      {
        id: "confidentiality-obligations",
        title: "Confidentiality Obligations",
        description: "Comprehensive definition and protection of confidential information.",
        fullText: `"Confidential Information" means all information, whether oral, written, electronic, or visual, disclosed by the Disclosing Party to the Receiving Party, including but not limited to:\n\n(a) Business plans, strategies, and forecasts;\n(b) Financial information, pricing, and customer data;\n(c) Technical data, trade secrets, know-how, and algorithms;\n(d) Product roadmaps, designs, and prototypes;\n(e) Employee and vendor information;\n(f) Any information marked "Confidential" or which a reasonable person would understand to be confidential.\n\nThe Receiving Party shall: (i) maintain strict confidentiality; (ii) use Confidential Information solely for the Purpose; (iii) restrict disclosure to employees/advisors on a need-to-know basis who are bound by similar obligations; (iv) apply at least the same degree of care as it applies to its own confidential information, but no less than reasonable care.`,
        tags: ["confidentiality", "NDA", "trade secrets", "information"],
        importance: "essential"
      },
      {
        id: "exclusions",
        title: "Exclusions from Confidentiality",
        description: "Standard carve-outs defining what is not considered confidential.",
        fullText: `Confidential Information shall not include information that:\n\n(a) Is or becomes publicly available through no fault of the Receiving Party;\n(b) Was already in the Receiving Party's possession prior to disclosure, as evidenced by written records;\n(c) Is independently developed by the Receiving Party without reference to the Confidential Information;\n(d) Is received from a third party without restriction and without breach of any obligation of confidentiality;\n(e) Is required to be disclosed by law, regulation, or court order, provided that the Receiving Party gives the Disclosing Party prompt written notice and cooperates in seeking a protective order.\n\nThe burden of proving that any of the above exceptions applies shall rest with the Receiving Party.`,
        tags: ["exclusions", "exceptions", "public domain", "independent development"],
        importance: "essential"
      },
      {
        id: "ip-assignment",
        title: "Intellectual Property Assignment",
        description: "Transfer of all work product and IP rights to the company.",
        fullText: `The Employee hereby irrevocably assigns to the Company all right, title, and interest in and to any and all Inventions, including all intellectual property rights therein. "Inventions" means all inventions, works of authorship, designs, algorithms, software code, databases, trade secrets, improvements, and other intellectual property, whether patentable or not, that are:\n\n(a) Created, conceived, or developed by the Employee during the term of employment;\n(b) Related to the Company's business or reasonably anticipated business;\n(c) Created using the Company's resources, equipment, or Confidential Information.\n\nThe Employee shall promptly disclose all Inventions to the Company and shall execute all documents necessary to perfect the Company's ownership. This assignment survives termination of employment. The Employee waives all moral rights in any Inventions to the extent permitted by law.`,
        tags: ["IP", "intellectual property", "assignment", "inventions", "work product"],
        importance: "essential"
      },
      {
        id: "non-compete",
        title: "Non-Compete Restriction",
        description: "Post-employment restriction on joining competitors or starting competing business.",
        fullText: `During the term of employment and for a period of [●] months after termination ("Restricted Period"), the Employee shall not, directly or indirectly:\n\n(a) Engage in, own, manage, or control any business that competes with the Company's business within [India / specified geography];\n(b) Solicit, induce, or attempt to induce any employee or contractor of the Company to leave or reduce their engagement;\n(c) Solicit or accept business from any customer or client of the Company with whom the Employee had dealings during the last [12] months of employment.\n\nNote: Non-compete clauses post-termination may not be enforceable under Indian law (Section 27, Indian Contract Act). However, non-solicitation clauses and confidentiality obligations during and post-employment are generally upheld. The Company may offer Garden Leave compensation during the Restricted Period to improve enforceability.`,
        tags: ["non-compete", "restriction", "competition", "Section 27", "garden leave"],
        importance: "recommended"
      },
      {
        id: "non-solicitation",
        title: "Non-Solicitation",
        description: "Restriction on poaching employees and clients after departure.",
        fullText: `For a period of [●] months following the termination of this Agreement, the Receiving Party / Employee shall not, directly or indirectly:\n\n(a) Solicit, recruit, hire, or engage any employee, consultant, or contractor of the Company who was associated with the Company during the [12] months preceding termination;\n(b) Induce or encourage any such person to terminate or reduce their relationship with the Company;\n(c) Solicit, divert, or take away any customer, client, or business opportunity of the Company with whom the Employee/Party had material contact during the term.\n\nThis restriction applies regardless of who initiates the contact. A breach of this clause shall entitle the Company to injunctive relief and liquidated damages of ₹[●] per breach, without prejudice to any other remedies available at law.`,
        tags: ["non-solicitation", "poaching", "clients", "employees", "restrictive covenant"],
        importance: "essential"
      }
    ]
  },
  {
    id: "transaction",
    name: "Transaction & Closing",
    icon: FileText,
    description: "Conditions precedent, representations, warranties, and indemnification",
    contractTypes: ["Share Purchase Agreement", "Investment Agreement", "Term Sheet"],
    clauses: [
      {
        id: "conditions-precedent",
        title: "Conditions Precedent",
        description: "Actions that must be completed before the transaction closes.",
        fullText: `The obligations of the Investor to complete the investment shall be subject to the fulfilment (or waiver by the Investor) of the following Conditions Precedent on or before the Long Stop Date ([●]):\n\n(a) Completion of legal, financial, and tax due diligence to the Investor's satisfaction;\n(b) Execution of the Transaction Documents (SHA, SSA, Articles amendment);\n(c) Receipt of all necessary regulatory approvals (including RBI approval for foreign investment, if applicable);\n(d) No Material Adverse Change having occurred in the Company's business;\n(e) Allotment of Shares to the Investor and filing of necessary forms with RoC;\n(f) Key Managerial Personnel entering into employment/service agreements;\n(g) D&O insurance policy being in place with coverage of at least ₹[●];\n(h) Founder's personal guarantees, if applicable, being executed.`,
        tags: ["conditions precedent", "closing", "CP", "due diligence", "regulatory"],
        importance: "essential"
      },
      {
        id: "reps-warranties",
        title: "Representations & Warranties",
        description: "Statements of fact by each party regarding their authority and the company's status.",
        fullText: `The Company and the Founders jointly and severally represent and warrant to the Investor that as of the date hereof and as of the Closing Date:\n\n(a) The Company is duly incorporated and validly existing under the laws of India;\n(b) The execution of Transaction Documents has been duly authorized;\n(c) The capitalization table provided is accurate and complete;\n(d) There is no pending or threatened litigation that could have a Material Adverse Effect;\n(e) The Company has filed all tax returns and paid all taxes due;\n(f) The Company owns or has valid licenses for all intellectual property used in its business;\n(g) There are no undisclosed liabilities, related party transactions, or encumbrances on the Shares;\n(h) The Company is in compliance with all applicable laws, including employment, data protection, and anti-corruption laws;\n(i) All financial statements provided are true, fair, and prepared in accordance with applicable accounting standards.`,
        tags: ["representations", "warranties", "reps", "disclosure", "compliance"],
        importance: "essential"
      },
      {
        id: "indemnification",
        title: "Indemnification",
        description: "Protection against losses arising from breaches or third-party claims.",
        fullText: `The Founders and the Company shall jointly and severally indemnify, defend, and hold harmless the Investor and its affiliates, directors, and representatives ("Indemnified Parties") from and against any and all losses, damages, liabilities, costs, and expenses (including reasonable attorney's fees) arising from:\n\n(a) Any breach of representations, warranties, or covenants;\n(b) Any third-party claims arising from pre-Closing operations;\n(c) Any tax liabilities of the Company for periods prior to Closing;\n(d) Any fraud or willful misconduct by the Founders.\n\nThe maximum aggregate indemnification liability shall not exceed [●]% of the Transaction Value, except for claims arising from fraud or tax liabilities, which shall be uncapped. Claims must be notified within [●] months of Closing. A de minimis threshold of ₹[●] per individual claim and a basket of ₹[●] in aggregate shall apply before indemnification obligations are triggered.`,
        tags: ["indemnification", "indemnity", "liability", "cap", "basket", "losses"],
        importance: "essential"
      },
      {
        id: "escrow-arrangement",
        title: "Escrow Arrangement",
        description: "Portion of consideration held in escrow as security for warranty claims.",
        fullText: `An amount equal to [●]% of the Total Consideration ("Escrow Amount") shall be deposited in an escrow account maintained with [●] Bank ("Escrow Agent") for a period of [●] months from the Closing Date ("Escrow Period"). The Escrow Amount shall serve as security for any indemnification claims by the Buyer. The Escrow Agent shall release funds from the escrow account only upon:\n\n(a) Joint written instructions from both the Buyer and the Seller; or\n(b) A final, non-appealable order of a court or arbitral tribunal.\n\nAny portion of the Escrow Amount not subject to pending claims shall be released to the Seller within [30] days after the expiry of the Escrow Period. Interest earned on the Escrow Amount shall belong to the Seller. The Escrow Agent's fees shall be borne equally by both Parties.`,
        tags: ["escrow", "holdback", "security", "warranty claims"],
        importance: "recommended"
      }
    ]
  },
  {
    id: "dispute",
    name: "Dispute Resolution & General",
    icon: Scale,
    description: "Arbitration, governing law, force majeure, and boilerplate clauses",
    contractTypes: ["All Agreements"],
    clauses: [
      {
        id: "arbitration",
        title: "Arbitration Clause",
        description: "Binding arbitration as the primary dispute resolution mechanism.",
        fullText: `Any dispute, controversy, or claim arising out of or relating to this Agreement, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by arbitration in accordance with the Arbitration and Conciliation Act, 1996.\n\n(a) The arbitral tribunal shall consist of [sole arbitrator / three arbitrators] appointed in accordance with the rules of [SIAC / ICC / ad hoc];\n(b) The seat and venue of arbitration shall be [City], India;\n(c) The language of arbitration shall be English;\n(d) The arbitral award shall be final and binding on the Parties;\n(e) The costs of arbitration shall be borne as determined by the tribunal;\n(f) Notwithstanding the above, either Party may seek interim or injunctive relief from courts of competent jurisdiction to prevent irreparable harm.`,
        tags: ["arbitration", "dispute", "SIAC", "ICC", "injunctive relief"],
        importance: "essential"
      },
      {
        id: "governing-law",
        title: "Governing Law & Jurisdiction",
        description: "Applicable law and courts for interpreting the agreement.",
        fullText: `This Agreement shall be governed by and construed in accordance with the laws of India. Subject to the arbitration clause herein, the courts at [City], India shall have exclusive jurisdiction over any proceedings arising out of or in connection with this Agreement.`,
        tags: ["governing law", "jurisdiction", "Indian law", "courts"],
        importance: "essential"
      },
      {
        id: "force-majeure",
        title: "Force Majeure",
        description: "Relief from obligations due to events beyond a party's control.",
        fullText: `Neither Party shall be liable for any failure or delay in performing its obligations under this Agreement if such failure or delay results from a Force Majeure Event. "Force Majeure Event" means any event beyond the reasonable control of the affected Party, including but not limited to:\n\n(a) Natural disasters (earthquake, flood, pandemic, epidemic);\n(b) War, armed conflict, terrorism, or civil unrest;\n(c) Government actions, sanctions, embargoes, or lockdowns;\n(d) Strikes or labour disputes (other than of the affected Party's employees);\n(e) Failure of telecommunications, power, or IT infrastructure beyond the Party's control.\n\nThe affected Party shall notify the other Party within [7] days and use reasonable efforts to mitigate the impact. If the Force Majeure Event continues for more than [90] days, either Party may terminate this Agreement upon [30] days' written notice without liability.`,
        tags: ["force majeure", "act of God", "pandemic", "unforeseeable"],
        importance: "recommended"
      },
      {
        id: "entire-agreement",
        title: "Entire Agreement & Amendment",
        description: "Supersedes all prior agreements; amendments must be in writing.",
        fullText: `This Agreement, together with all Schedules and Annexures hereto, constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, warranties, understandings, and agreements between the Parties, whether written or oral. No amendment, modification, or waiver of any provision of this Agreement shall be effective unless made in writing and signed by all Parties. No waiver of any breach shall be deemed a waiver of any subsequent breach. If any provision is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect (Severability).`,
        tags: ["entire agreement", "amendment", "waiver", "severability"],
        importance: "essential"
      },
      {
        id: "notices",
        title: "Notices",
        description: "How formal communications between parties must be delivered.",
        fullText: `All notices, requests, consents, and other communications under this Agreement shall be in writing and shall be deemed duly given:\n\n(a) When delivered personally, upon receipt;\n(b) When sent by registered post / speed post with acknowledgment due, [3] business days after posting;\n(c) When sent by nationally recognized courier service, [2] business days after dispatch;\n(d) When sent by email to the designated email addresses, upon receipt of read confirmation or delivery receipt, provided a copy is also sent by post within [2] business days.\n\nNotices shall be sent to the addresses specified in Schedule [●] hereto. Either Party may change its address for notices by giving [15] days' prior written notice to the other Party.`,
        tags: ["notices", "communication", "delivery", "registered post"],
        importance: "recommended"
      }
    ]
  },
  {
    id: "startup",
    name: "Startup & Founder",
    icon: Rocket,
    description: "Founder agreements, vesting, sweat equity, and startup-specific clauses",
    contractTypes: ["Founders' Agreement", "Shareholders' Agreement", "Term Sheet", "Investment Agreement"],
    clauses: [
      {
        id: "founder-vesting",
        title: "Founder Vesting & Reverse Vesting",
        description: "Time-based vesting of founder shares to protect against early departures.",
        fullText: `The Founder's Shares shall be subject to reverse vesting over a period of [4] years from the Effective Date, with a [1]-year cliff ("Vesting Schedule"):\n\n(a) 25% of the Founder's Shares shall vest on the 1st anniversary;\n(b) The remaining 75% shall vest on a monthly/quarterly pro-rata basis over the next 36 months;\n(c) Upon a Founder ceasing to be a full-time employee/director ("Departure"), unvested Shares shall be subject to buyback by the Company or remaining Founders at face value (or such price as determined under the Articles);\n(d) In case of termination for Cause, all unvested and [●]% of vested Shares shall be subject to buyback;\n(e) Vesting shall accelerate in full upon a Change of Control event (single trigger) or upon termination without Cause following a Change of Control (double trigger);\n(f) Vesting is subject to compliance with the Companies Act, 2013 and applicable FEMA regulations for foreign founders.`,
        tags: ["founder vesting", "reverse vesting", "cliff", "buyback", "acceleration"],
        importance: "essential"
      },
      {
        id: "sweat-equity",
        title: "Sweat Equity Allotment",
        description: "Issuance of shares at a discount for non-cash contributions under Companies Act, 2013.",
        fullText: `The Company may issue Sweat Equity Shares to the Founders/Employees in accordance with Section 54 of the Companies Act, 2013 and Rule 8 of the Companies (Share Capital and Debentures) Rules, 2014:\n\n(a) The Sweat Equity Shares shall be issued at a price of ₹[●] per share (discount of [●]% from fair market value);\n(b) The consideration shall be in the form of: (i) know-how or intellectual property rights made available to the Company; or (ii) value additions attributable to the employee/director;\n(c) A valuation report from a registered valuer shall be obtained;\n(d) The Sweat Equity Shares shall be subject to a lock-in period of [3] years from the date of allotment;\n(e) The total Sweat Equity Shares issued shall not exceed 15% of the existing paid-up equity share capital in a year or shares of issue value of ₹5 crore, whichever is higher;\n(f) Special Resolution of the shareholders shall be obtained prior to issuance.`,
        tags: ["sweat equity", "Section 54", "Companies Act", "valuation", "lock-in"],
        importance: "recommended"
      },
      {
        id: "founder-roles",
        title: "Founder Roles & Responsibilities",
        description: "Defines each founder's designation, time commitment, and decision-making authority.",
        fullText: `Each Founder shall devote their full-time, attention, and best efforts to the business of the Company. The initial roles shall be:\n\n(a) Founder 1 [Name] — Chief Executive Officer (CEO): Overall strategy, fundraising, and external relations;\n(b) Founder 2 [Name] — Chief Technology Officer (CTO): Product development, engineering, and technology;\n(c) Founder 3 [Name] — Chief Operating Officer (COO): Operations, finance, and compliance.\n\nNo Founder shall, without the prior written consent of the other Founders:\n(i) Engage in any other business, employment, or consultancy (whether directly or indirectly);\n(ii) Incur any expenditure exceeding ₹[●] without Board approval;\n(iii) Enter into any agreement on behalf of the Company exceeding ₹[●] in value.\n\nDecisions requiring unanimous Founder consent: (a) pivot of business model; (b) raising of debt exceeding ₹[●]; (c) admission of a new co-founder; (d) any related party transactions.`,
        tags: ["founder roles", "responsibilities", "CEO", "CTO", "full-time commitment"],
        importance: "essential"
      },
      {
        id: "deadlock-resolution",
        title: "Deadlock Resolution (Founder Disputes)",
        description: "Mechanism to resolve disputes between co-founders when consensus fails.",
        fullText: `In the event of a Deadlock (defined as the inability of the Founders to agree on any Reserved Matter after [2] Board meetings within [30] days), the following escalation mechanism shall apply:\n\n(a) Step 1 — Mediation: The Founders shall refer the matter to a mutually agreed mediator within [15] days. The mediation shall be conducted in [City], India;\n(b) Step 2 — Independent Advisor: If mediation fails within [30] days, an independent industry expert mutually agreed upon shall provide a non-binding recommendation;\n(c) Step 3 — Shotgun Clause (Buy-Sell): If the dispute remains unresolved for [60] days, either Founder may invoke the Shotgun Clause by offering to buy the other Founder's Shares at a stated price. The receiving Founder must either accept the offer or buy the offering Founder's Shares at the same price;\n(d) Step 4 — Winding Up: If no resolution is achieved within [90] days, either Founder may trigger an orderly winding up of the Company under the Insolvency and Bankruptcy Code, 2016.\n\nDuring any Deadlock period, the Company shall continue to operate in the ordinary course of business.`,
        tags: ["deadlock", "shotgun clause", "founder dispute", "mediation", "buy-sell"],
        importance: "recommended"
      },
      {
        id: "startup-ip-assignment",
        title: "Pre-Incorporation IP Assignment",
        description: "Transfer of IP developed before company incorporation to the startup entity.",
        fullText: `Each Founder hereby irrevocably assigns, transfers, and conveys to the Company all right, title, and interest (including all intellectual property rights worldwide) in and to any and all Pre-Existing IP, including:\n\n(a) All code, software, algorithms, databases, designs, and documentation developed by the Founder prior to incorporation that relate to the Company's business;\n(b) All domain names, social media handles, and digital assets created for the business;\n(c) All business plans, financial models, customer lists, and market research.\n\nThe Founders represent and warrant that: (i) the Pre-Existing IP does not infringe any third-party rights; (ii) no third party has any claim or license over the Pre-Existing IP; (iii) they have full authority to make this assignment.\n\nThe consideration for this assignment shall be the allotment of [●] equity shares at face value. The Founders shall execute all documents (including filings with the Patent Office / Copyright Office under Indian law) necessary to perfect the Company's title.`,
        tags: ["pre-incorporation IP", "assignment", "founders", "domain names", "prior work"],
        importance: "essential"
      }
    ]
  },
  {
    id: "ai-tech",
    name: "AI, Technology & SaaS",
    icon: Cpu,
    description: "AI model governance, SaaS terms, data processing, and technology licensing",
    contractTypes: ["SaaS Agreement", "Technology License", "AI/ML Agreement", "Data Processing Agreement"],
    clauses: [
      {
        id: "ai-model-ownership",
        title: "AI Model & Output Ownership",
        description: "Defines ownership of AI models, training data, and AI-generated outputs.",
        fullText: `Ownership of AI Models and Outputs:\n\n(a) The Company retains exclusive ownership of all AI/ML models, algorithms, neural network architectures, and trained weights ("AI Models") developed using Company resources;\n(b) Training Data: The Company's right to use training data is subject to applicable data protection laws including the Digital Personal Data Protection Act, 2023 (DPDPA). Any personal data used for training shall require explicit consent of the Data Principal;\n(c) AI-Generated Outputs: All outputs, predictions, recommendations, and content generated by the AI Models ("AI Outputs") shall be owned by the Company. The Customer receives a non-exclusive, limited license to use AI Outputs solely for internal business purposes;\n(d) The Customer shall not reverse-engineer, decompile, or attempt to extract the AI Model's parameters, weights, or training methodology;\n(e) Derivative Works: Any fine-tuned models or adaptations created using Customer data shall be jointly owned, with the Company retaining the right to use the underlying architecture and learnings (in anonymized/aggregated form) for model improvement;\n(f) Indian Copyright Position: As per the Copyright Act, 1957, authorship of AI-generated works remains an evolving area of law. Parties agree that ownership shall vest as specified herein, and shall cooperate to obtain any necessary registrations.`,
        tags: ["AI", "model ownership", "training data", "outputs", "DPDPA", "copyright"],
        importance: "essential"
      },
      {
        id: "ai-liability",
        title: "AI Liability & Disclaimer",
        description: "Limitations on liability for AI predictions, decisions, and autonomous actions.",
        fullText: `AI Liability Limitations:\n\n(a) No Guarantee of Accuracy: The Company does not warrant that AI Outputs will be accurate, complete, error-free, or suitable for any particular purpose. AI Outputs are probabilistic in nature and should not be relied upon as the sole basis for decisions with legal, financial, medical, or safety implications;\n(b) Human Oversight: The Customer shall implement appropriate human oversight mechanisms before acting on AI Outputs, particularly for high-risk decisions as may be specified under applicable Indian regulations;\n(c) Bias & Fairness: The Company shall use commercially reasonable efforts to identify and mitigate bias in AI Models but does not guarantee the absence of bias. The Customer shall monitor AI Outputs for discriminatory or unfair outcomes;\n(d) Limitation of Liability: The Company's aggregate liability for any claims arising from AI Outputs shall not exceed the fees paid by the Customer in the [12] months preceding the claim;\n(e) Indemnification: The Customer shall indemnify the Company against claims arising from the Customer's use of AI Outputs in violation of applicable laws or this Agreement;\n(f) Regulatory Compliance: Both Parties shall cooperate to comply with any AI-specific regulations issued by MeitY, DPIIT, or any other Indian regulatory authority.`,
        tags: ["AI liability", "disclaimer", "bias", "accuracy", "human oversight", "MeitY"],
        importance: "essential"
      },
      {
        id: "saas-subscription",
        title: "SaaS Subscription & Service Level",
        description: "Subscription terms, uptime SLA, and service credits for SaaS products.",
        fullText: `SaaS Subscription Terms:\n\n(a) Subscription Period: The initial subscription shall be for [●] months/years from the Effective Date ("Initial Term"), auto-renewing for successive [●]-month periods unless either Party gives [30] days' prior written notice of non-renewal;\n(b) Uptime SLA: The Company shall use commercially reasonable efforts to maintain [99.9]% uptime availability, measured monthly (excluding scheduled maintenance windows notified [48] hours in advance);\n(c) Service Credits: If uptime falls below the SLA threshold:\n   - 99.0% to 99.9%: [5]% credit on monthly fees\n   - 95.0% to 99.0%: [10]% credit on monthly fees\n   - Below 95.0%: [25]% credit on monthly fees and Customer may terminate with [30] days' notice;\n(d) Data Residency: Customer data shall be stored in data centres located within India, in compliance with data localisation requirements under the DPDPA 2023 and RBI guidelines (for financial data);\n(e) Fair Use: The subscription is subject to fair usage limits of [●] API calls/month, [●] GB storage, and [●] concurrent users. Overages shall be billed at ₹[●] per unit;\n(f) Taxes: All fees are exclusive of GST (currently 18% on SaaS services), which shall be charged additionally.`,
        tags: ["SaaS", "subscription", "SLA", "uptime", "service credits", "GST", "data residency"],
        importance: "essential"
      },
      {
        id: "data-processing",
        title: "Data Processing Agreement (DPDPA Compliant)",
        description: "Data processing terms aligned with India's Digital Personal Data Protection Act, 2023.",
        fullText: `Data Processing Terms (DPDPA 2023 Compliance):\n\n(a) Definitions: "Data Fiduciary" means the Customer; "Data Processor" means the Company; "Data Principal" means the individual whose personal data is processed; "Personal Data" has the meaning assigned under the DPDPA 2023;\n(b) Processing Purpose: The Data Processor shall process Personal Data only for the purposes specified in Schedule [●] and strictly in accordance with the Data Fiduciary's documented instructions;\n(c) Security Safeguards: The Data Processor shall implement reasonable security safeguards as mandated under Section 8 of the DPDPA 2023, including encryption (AES-256 at rest, TLS 1.2+ in transit), access controls, and regular security audits;\n(d) Sub-Processing: The Data Processor shall not engage any sub-processor without prior written consent of the Data Fiduciary. A list of approved sub-processors is set out in Annexure [●];\n(e) Data Breach Notification: The Data Processor shall notify the Data Fiduciary within [72] hours of becoming aware of any Personal Data Breach, and shall assist in notification to the Data Protection Board of India;\n(f) Data Principal Rights: The Data Processor shall assist the Data Fiduciary in responding to Data Principal rights requests (access, correction, erasure, nomination) within the timelines prescribed under the DPDPA;\n(g) Cross-Border Transfer: Personal Data shall not be transferred outside India except to countries notified by the Central Government under Section 16(1) of the DPDPA 2023;\n(h) Retention & Deletion: Upon termination or upon the Data Fiduciary's request, the Data Processor shall delete or return all Personal Data within [30] days and certify such deletion.`,
        tags: ["DPDPA", "data processing", "data fiduciary", "data processor", "privacy", "data breach"],
        importance: "essential"
      },
      {
        id: "open-source-compliance",
        title: "Open Source Software Compliance",
        description: "Obligations regarding use of open-source components in proprietary software.",
        fullText: `Open Source Software (OSS) Compliance:\n\n(a) The Company represents that a list of all open-source components used in the Software, along with their respective licenses (e.g., MIT, Apache 2.0, GPL, LGPL, AGPL), is set out in Schedule [●] ("OSS Bill of Materials");\n(b) Copyleft Licenses: The Company warrants that no component licensed under a "strong copyleft" license (GPL v2/v3, AGPL) has been incorporated in a manner that would require the proprietary portions of the Software to be disclosed or distributed under such copyleft license;\n(c) Attribution: The Company shall comply with all attribution and notice requirements of the applicable OSS licenses;\n(d) Indemnification: The Company shall indemnify the Customer against any claims arising from the Company's non-compliance with OSS license terms;\n(e) Updates: The Company shall update the OSS Bill of Materials at least [quarterly] and promptly replace any component that poses a security vulnerability (CVE rating ≥ 7.0) or legal risk;\n(f) Indian IP Position: Open-source contributions and usage are subject to the Copyright Act, 1957 and the Information Technology Act, 2000. The Company shall ensure compliance with these statutes.`,
        tags: ["open source", "OSS", "GPL", "MIT", "Apache", "copyleft", "bill of materials"],
        importance: "recommended"
      },
      {
        id: "api-terms",
        title: "API License & Usage Terms",
        description: "Terms governing API access, rate limits, and acceptable use.",
        fullText: `API License Terms:\n\n(a) Grant: The Company grants the Customer a non-exclusive, non-transferable, revocable license to access and use the API solely for the purposes described in the documentation;\n(b) API Key: Each Customer shall receive unique API credentials. The Customer shall keep API keys confidential and shall be responsible for all activity under their credentials;\n(c) Rate Limits: The Customer shall not exceed [●] requests per minute / [●] requests per day. Rate limit violations may result in throttling or temporary suspension;\n(d) Acceptable Use: The Customer shall not: (i) scrape, crawl, or bulk-download data via the API; (ii) use the API to build a competing product; (iii) share API access with third parties without consent; (iv) attempt to circumvent rate limits or security measures;\n(e) Changes: The Company may modify, deprecate, or discontinue any API endpoint with [90] days' prior notice. Breaking changes shall be communicated with a minimum [6]-month deprecation window;\n(f) SLA: API availability SLA of [99.5]%. Latency target: p95 response time ≤ [200]ms;\n(g) Indian Law: Use of the API shall comply with the Information Technology Act, 2000 and the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.`,
        tags: ["API", "license", "rate limits", "acceptable use", "IT Act"],
        importance: "recommended"
      }
    ]
  },
  {
    id: "regtech",
    name: "RegTech & Compliance",
    icon: ScrollText,
    description: "Regulatory technology, fintech compliance, RBI, SEBI, and IRDAI clauses",
    contractTypes: ["RegTech Agreement", "Fintech Agreement", "Compliance Agreement", "Outsourcing Agreement"],
    clauses: [
      {
        id: "rbi-outsourcing",
        title: "RBI Outsourcing Guidelines Compliance",
        description: "Mandatory clauses for technology vendors providing services to RBI-regulated entities.",
        fullText: `RBI Outsourcing Compliance (RBI/2006-07/239):\n\nThe Service Provider acknowledges that the Customer is a Regulated Entity under the Reserve Bank of India and agrees to the following:\n\n(a) The Customer shall retain ultimate control and oversight over outsourced activities. The Service Provider shall not sub-contract without prior RBI/Customer approval;\n(b) Confidentiality: The Service Provider shall maintain the confidentiality of customer information as per RBI Master Direction on KYC and applicable banking secrecy laws;\n(c) Audit & Inspection: The Service Provider shall permit inspection and audit by the Customer, its internal/external auditors, and RBI (or any regulatory authority) at any time with reasonable notice;\n(d) Business Continuity: The Service Provider shall maintain a BCP/DR plan tested at least annually, with RPO of [●] hours and RTO of [●] hours;\n(e) Data Localisation: All data relating to Indian customers shall be stored in India in compliance with RBI's data localisation circular (RBI/2017-18/153);\n(f) Exit Management: The Service Provider shall provide transition assistance for [●] months post-termination to ensure seamless migration;\n(g) Regulatory Reporting: The Service Provider shall promptly provide information required for the Customer's regulatory filings, returns, and compliance obligations;\n(h) Material Changes: The Service Provider shall notify the Customer at least [30] days prior to any material change in ownership, management, or infrastructure.`,
        tags: ["RBI", "outsourcing", "regulated entity", "audit", "data localisation", "BCP"],
        importance: "essential"
      },
      {
        id: "sebi-compliance",
        title: "SEBI Compliance & Market Intermediary",
        description: "Clauses for technology providers serving SEBI-regulated market intermediaries.",
        fullText: `SEBI Regulatory Compliance:\n\n(a) The Service Provider acknowledges that the Customer is a SEBI-registered intermediary (Broker/Depository Participant/Mutual Fund/AIF/PMS) and shall comply with:\n   - SEBI (Intermediaries) Regulations, 2008\n   - SEBI Circular on Cyber Security & Cyber Resilience (SEBI/HO/MRD/DoP/P/CIR/2023/168)\n   - SEBI Cloud Services Framework\n(b) System Audit: The Service Provider's systems shall be audited annually by a CERT-In empanelled auditor. Audit reports shall be shared with the Customer;\n(c) Incident Response: Security incidents shall be reported to the Customer within [6] hours and to CERT-In within [6] hours as per IT Act requirements;\n(d) Algorithmic Trading: If the Software is used for algorithmic trading, it shall comply with SEBI circular on Algo Trading (SEBI/HO/MRD/DOP/P/CIR/2021/639) including kill switch, quantity limits, and audit trail;\n(e) Record Retention: The Service Provider shall retain all records, logs, and audit trails for a minimum period of [8] years (or such period as prescribed by SEBI);\n(f) Investor Grievance: The Service Provider shall cooperate with the Customer in addressing any investor grievances routed through SCORES or the SEBI grievance mechanism.`,
        tags: ["SEBI", "market intermediary", "cyber security", "CERT-In", "algo trading", "SCORES"],
        importance: "essential"
      },
      {
        id: "kyc-aml",
        title: "KYC / AML / CFT Compliance",
        description: "Know Your Customer and Anti-Money Laundering obligations for fintech platforms.",
        fullText: `KYC/AML/CFT Obligations:\n\n(a) The Platform shall implement and maintain a robust KYC program in accordance with:\n   - Prevention of Money Laundering Act, 2002 (PMLA)\n   - RBI Master Direction on KYC (updated 2023)\n   - SEBI KYC Registration Agency (KRA) Regulations\n(b) Customer Due Diligence (CDD): The Platform shall verify the identity of all users using Aadhaar-based e-KYC (with consent), PAN verification, and CKYC registry checks;\n(c) Enhanced Due Diligence (EDD) shall be conducted for: (i) Politically Exposed Persons (PEPs); (ii) high-risk jurisdictions identified by FATF; (iii) transactions exceeding ₹[●] in value;\n(d) Suspicious Transaction Reporting (STR): The Platform shall file STRs with the Financial Intelligence Unit – India (FIU-IND) within [7] days of detection;\n(e) Transaction Monitoring: Real-time transaction monitoring rules shall flag: (i) cash transactions exceeding ₹10 lakhs; (ii) cross-border wire transfers exceeding ₹5 lakhs; (iii) structuring patterns;\n(f) Record Keeping: All KYC records and transaction data shall be maintained for [5] years after the business relationship ends;\n(g) The Compliance Officer shall be a senior management-level employee responsible for AML/CFT compliance.`,
        tags: ["KYC", "AML", "CFT", "PMLA", "FIU", "Aadhaar", "e-KYC", "PEP"],
        importance: "essential"
      },
      {
        id: "data-localisation-fintech",
        title: "Data Localisation (Financial Data)",
        description: "RBI and government mandates on storage of payment and financial data within India.",
        fullText: `Data Localisation Compliance:\n\n(a) Payment System Data: All data relating to payment transactions processed in India shall be stored exclusively in India, in compliance with RBI Circular RBI/2017-18/153 dated April 6, 2018;\n(b) Scope: This includes end-to-end transaction details, information collected, carried, and processed as part of the payment processing — including customer data, payment-sensitive data, and transaction records;\n(c) Foreign Leg: For cross-border transactions, a copy of the data may be stored abroad for the foreign leg, provided the Indian copy is the primary record;\n(d) The Service Provider certifies that all servers, databases, and backup systems storing Indian payment data are located within the territory of India;\n(e) Cloud Infrastructure: If cloud services are used, the cloud provider's data centres must be located in India, and the Service Provider shall furnish a compliance certificate annually;\n(f) Audit: RBI or its authorized representatives shall have the right to audit compliance with data localisation requirements;\n(g) Penalties: Non-compliance may attract penalties under the Payment and Settlement Systems Act, 2007, and directions under Section 17 of the PSS Act.`,
        tags: ["data localisation", "RBI", "payment data", "PSS Act", "financial data", "cloud"],
        importance: "essential"
      }
    ]
  },
  {
    id: "copyright-ip",
    name: "Copyright & Creative Works",
    icon: Copyright,
    description: "Copyright ownership, licensing, moral rights, and content clauses under Indian law",
    contractTypes: ["Copyright License", "Content Agreement", "Publishing Agreement", "Work-for-Hire Agreement"],
    clauses: [
      {
        id: "copyright-ownership",
        title: "Copyright Ownership & Assignment",
        description: "Transfer of copyright in works created under contract, per the Copyright Act, 1957.",
        fullText: `Copyright Ownership & Assignment (Copyright Act, 1957):\n\n(a) All literary, artistic, musical, dramatic, and cinematographic works (including software as "literary work" under Section 2(o)) created by the Author/Creator in performance of this Agreement ("Works") shall vest exclusively in the Assignee;\n(b) The Author hereby assigns to the Assignee, in perpetuity and worldwide, all rights comprised in the copyright of the Works, including the right to reproduce, publish, communicate to the public, make adaptations, and translate, as per Section 14 of the Copyright Act, 1957;\n(c) The assignment covers all known and unknown modes of exploitation, in all media and formats, whether now known or hereafter developed;\n(d) Consideration: The assignment is made in consideration of ₹[●] (inclusive of all royalties), payable as set out in Schedule [●];\n(e) The Author shall execute Form XIV (Copyright Assignment) and any documents required for registration with the Copyright Office under Rule 70 of the Copyright Rules, 2013;\n(f) Reversion: If the Assignee does not exercise the rights within [●] years, the rights shall revert to the Author as per Section 19(4) of the Copyright Act;\n(g) The Author represents and warrants that the Works are original, do not infringe third-party rights, and have not been previously assigned or licensed.`,
        tags: ["copyright", "assignment", "Section 14", "Section 19", "Copyright Act 1957", "literary work"],
        importance: "essential"
      },
      {
        id: "moral-rights",
        title: "Moral Rights (Author's Special Rights)",
        description: "Protection of author's right to attribution and integrity under Indian copyright law.",
        fullText: `Moral Rights (Section 57, Copyright Act, 1957):\n\n(a) The Author retains the following moral rights, which are independent of and survive the assignment of copyright:\n   (i) Right of Paternity: The right to claim authorship of the Work;\n   (ii) Right of Integrity: The right to restrain or claim damages for any distortion, mutilation, modification, or other act in relation to the Work that would be prejudicial to the Author's honour or reputation;\n(b) The Assignee agrees to provide appropriate attribution to the Author as follows: [specify form of attribution — e.g., "Written by [Author Name]" on all published copies];\n(c) The Assignee shall not make any modifications to the Work that would constitute distortion or mutilation without the Author's prior written consent;\n(d) These moral rights are non-assignable and non-waivable under Indian law (Section 57 is a special right that cannot be contracted away);\n(e) Remedies: Any violation of moral rights shall entitle the Author to seek injunctive relief and damages before the competent court;\n(f) Post-Mortem: Moral rights may be exercised by the Author's legal heirs after the Author's death, for the remaining term of copyright.`,
        tags: ["moral rights", "Section 57", "paternity", "integrity", "attribution", "author"],
        importance: "essential"
      },
      {
        id: "copyright-license",
        title: "Copyright License (Non-Exclusive / Exclusive)",
        description: "Licensing terms for use of copyrighted content without full assignment.",
        fullText: `Copyright License Grant:\n\n(a) The Licensor grants to the Licensee a [non-exclusive / exclusive] license to use the Licensed Work for the following purposes: [specify — e.g., reproduction, public display, digital distribution];\n(b) Territory: [India / Worldwide];\n(c) Duration: [●] years from the Effective Date, renewable upon mutual agreement;\n(d) Medium & Format: The license covers use in [print / digital / audiovisual / all media];\n(e) Sub-Licensing: The Licensee [shall / shall not] have the right to grant sub-licenses, subject to the Licensor's prior written consent;\n(f) Royalty: The Licensee shall pay a royalty of [●]% of net revenues / flat fee of ₹[●] per [annum / use], payable [quarterly/annually];\n(g) Section 30 Compliance: This license is granted under Section 30 of the Copyright Act, 1957. The license does not transfer ownership of the copyright;\n(h) Revocation: The license may be revoked by the Licensor upon [90] days' notice if the Licensee breaches any material term;\n(i) Moral Rights: The Licensee shall respect the Licensor's moral rights under Section 57 and provide proper attribution.`,
        tags: ["copyright license", "non-exclusive", "exclusive", "Section 30", "royalty", "sub-license"],
        importance: "essential"
      },
      {
        id: "content-takedown",
        title: "Content Takedown & Safe Harbour (IT Act)",
        description: "Intermediary liability protection and takedown obligations under the IT Act, 2000.",
        fullText: `Content Takedown & Intermediary Liability:\n\n(a) Safe Harbour: The Platform claims protection under Section 79 of the Information Technology Act, 2000, as an intermediary that does not initiate, select, or modify third-party content;\n(b) Due Diligence: The Platform shall comply with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 ("IT Rules 2021"), including:\n   (i) Publishing community guidelines and Terms of Use;\n   (ii) Appointing a Grievance Officer (resident in India) with contact details published on the Platform;\n   (iii) Acknowledging user complaints within [24] hours and resolving within [15] days;\n(c) Takedown Obligations: The Platform shall remove or disable access to content within [36] hours upon receiving a court order or government direction;\n(d) Copyright Infringement: Upon receiving a valid notice from a copyright owner under Section 52(1)(c) of the Copyright Act, 1957, the Platform shall expeditiously remove the infringing content and notify the uploader;\n(e) Counter-Notice: The uploader may file a counter-notice within [14] days. If no legal proceedings are initiated, the content may be restored;\n(f) Significant Social Media Intermediary (SSMI): If the Platform has ≥50 lakh registered users in India, it shall additionally comply with SSMI obligations including appointing a Chief Compliance Officer, Nodal Contact Person, and Resident Grievance Officer, all resident in India.`,
        tags: ["takedown", "Section 79", "intermediary", "IT Act", "grievance officer", "safe harbour", "SSMI"],
        importance: "recommended"
      }
    ]
  },
  {
    id: "trademark",
    name: "Trademark & Brand Protection",
    icon: Fingerprint,
    description: "Trademark licensing, brand guidelines, domain disputes, and passing off under Indian law",
    contractTypes: ["Trademark License", "Brand Agreement", "Franchise Agreement", "Co-Branding Agreement"],
    clauses: [
      {
        id: "trademark-license",
        title: "Trademark License Agreement",
        description: "Grant of rights to use registered trademarks under the Trade Marks Act, 1999.",
        fullText: `Trademark License (Trade Marks Act, 1999):\n\n(a) The Licensor, being the registered proprietor of the Trademark(s) listed in Schedule [●] (Registration No. [●]), grants to the Licensee a [non-exclusive / exclusive] license to use the said Trademark(s) ("Licensed Marks") in connection with [specify goods/services] in the territory of [India / specified states];\n(b) Registered User: The Licensee shall be recorded as a Registered User of the Licensed Marks under Section 49 of the Trade Marks Act, 1999, by filing Form TM-U with the Trade Marks Registry;\n(c) Quality Control: The Licensee shall maintain the quality of goods/services bearing the Licensed Marks at a standard not lower than that maintained by the Licensor. The Licensor shall have the right to inspect and approve quality standards;\n(d) Usage Guidelines: The Licensee shall use the Licensed Marks strictly in accordance with the Brand Guidelines attached as Annexure [●]. Any deviation requires prior written approval;\n(e) No Assignment: The Licensee shall not assign, sub-license, or transfer the license without the Licensor's prior written consent;\n(f) Duration: [●] years, renewable upon mutual agreement;\n(g) Royalty: [●]% of net sales revenue of licensed goods/services, payable quarterly;\n(h) Termination: The Licensor may terminate immediately if the Licensee uses the Licensed Marks in a manner that dilutes, tarnishes, or brings disrepute to the brand.`,
        tags: ["trademark license", "registered user", "Section 49", "brand", "quality control", "TM-U"],
        importance: "essential"
      },
      {
        id: "trademark-infringement",
        title: "Trademark Infringement & Passing Off",
        description: "Remedies for unauthorised use of trademarks including passing off under Indian law.",
        fullText: `Trademark Infringement & Remedies:\n\n(a) Infringement (Section 29, Trade Marks Act, 1999): Use of a mark identical or deceptively similar to the Registered Trademark in relation to identical/similar goods or services constitutes infringement;\n(b) Passing Off: Even without registration, the Owner may pursue common law passing off action if: (i) the Owner has goodwill/reputation; (ii) there is misrepresentation by the infringer; (iii) the Owner suffers or is likely to suffer damage;\n(c) Remedies Available:\n   (i) Injunction (interim and permanent) under Order XXXIX CPC;\n   (ii) Damages or an account of profits;\n   (iii) Delivery up and destruction of infringing goods (Section 135);\n   (iv) Anton Piller orders (search and seizure);\n(d) Criminal Remedies: Sections 103-104 of the Trade Marks Act provide for imprisonment up to [3] years and fine up to ₹[2] lakhs for applying false trade marks;\n(e) Online Infringement: The Owner may issue takedown notices to e-commerce platforms under their IP policies and to domain registrars under INDRP (IN Domain Name Dispute Resolution Policy) or UDRP;\n(f) Customs Recordal: The Owner may record the trademark with Indian Customs under the Intellectual Property Rights (Imported Goods) Enforcement Rules, 2007, to prevent import of counterfeit goods.`,
        tags: ["infringement", "passing off", "Section 29", "injunction", "INDRP", "customs recordal"],
        importance: "recommended"
      },
      {
        id: "brand-guidelines",
        title: "Brand Usage & Style Guidelines",
        description: "Detailed rules for use of logos, colours, fonts, and brand elements.",
        fullText: `Brand Usage Guidelines:\n\n(a) Logo Usage: The Licensed Marks / Company logo shall be used only in the approved formats (vector/SVG for print, PNG for digital). Minimum clear space of [●]px / [●]mm shall be maintained around the logo;\n(b) Colour Palette: The brand colours are: Primary — [●] (Hex/Pantone); Secondary — [●]; Accent — [●]. No substitution is permitted;\n(c) Typography: Brand fonts are [●] (headings) and [●] (body). Alternative fonts may be used only with prior approval;\n(d) Prohibited Uses: The Licensed Marks shall not be: (i) altered, distorted, rotated, or animated without approval; (ii) placed on backgrounds that reduce legibility; (iii) combined with other logos or marks without consent; (iv) used in any context that is defamatory, obscene, or politically sensitive;\n(e) Co-Branding: Any co-branding with third-party marks requires the Licensor's prior written approval. The Licensed Marks shall always appear with equal or greater prominence;\n(f) Digital/Social Media: Use of the Licensed Marks on social media, websites, or apps shall comply with platform-specific brand policies and these Guidelines;\n(g) Review: All marketing materials bearing the Licensed Marks shall be submitted to the Licensor for approval at least [7] business days before publication;\n(h) Non-Compliance: Failure to comply with these Guidelines shall constitute a material breach entitling the Licensor to terminate the license.`,
        tags: ["brand guidelines", "logo", "typography", "co-branding", "style guide"],
        importance: "recommended"
      },
      {
        id: "domain-dispute",
        title: "Domain Name Dispute Resolution (INDRP)",
        description: "Resolution of .in domain disputes under India's domain dispute resolution policy.",
        fullText: `Domain Name Dispute Resolution:\n\n(a) .IN Domains (INDRP): Disputes relating to .in and .co.in domain names shall be resolved under the IN Domain Name Dispute Resolution Policy (INDRP) administered by the National Internet Exchange of India (NIXI);\n(b) Grounds for Complaint: The Complainant must establish that: (i) the domain name is identical or confusingly similar to a name, trademark, or service mark in which the Complainant has rights; (ii) the Registrant has no legitimate interest in the domain name; (iii) the domain name was registered or used in bad faith;\n(c) Bad Faith Indicators: (i) Registration primarily to sell to the trademark owner at a premium; (ii) pattern of registering domains to prevent trademark owners from reflecting their marks; (iii) registration to disrupt a competitor's business; (iv) intentional attempt to attract users by creating confusion;\n(d) .COM/.ORG Domains (UDRP): For gTLD domains, disputes shall be filed under ICANN's Uniform Domain Name Dispute Resolution Policy (UDRP) with an approved dispute resolution provider (e.g., WIPO, NAF);\n(e) Remedies: Transfer of the domain name to the Complainant, or cancellation;\n(f) Legal Proceedings: Either party may approach Indian courts before, during, or after INDRP/UDRP proceedings. INDRP decisions may be challenged before the Delhi High Court;\n(g) Costs: INDRP filing fee is approximately ₹3,000 to ₹5,000 per domain.`,
        tags: ["domain dispute", "INDRP", "UDRP", "NIXI", ".in domain", "bad faith", "cybersquatting"],
        importance: "optional"
      }
    ]
  },
  {
    id: "ip-protection",
    name: "IP Protection & Patents",
    icon: Globe,
    description: "Patent licensing, trade secrets, design registration, and IP enforcement under Indian law",
    contractTypes: ["Patent License", "IP Assignment", "Technology Transfer", "Trade Secret Agreement"],
    clauses: [
      {
        id: "patent-license",
        title: "Patent License Agreement",
        description: "Grant of license to use patented technology under the Patents Act, 1970.",
        fullText: `Patent License (Patents Act, 1970):\n\n(a) The Licensor, being the patentee of Indian Patent No. [●] titled "[●]" ("Licensed Patent"), grants to the Licensee a [non-exclusive / exclusive] license to make, use, sell, and import the patented invention in India;\n(b) Field of Use: The license is limited to [specify field — e.g., pharmaceutical, automotive, software-implemented inventions];\n(c) Royalty: The Licensee shall pay a royalty of [●]% of net sales of licensed products, with a minimum annual royalty of ₹[●]. Royalties shall be payable quarterly within [30] days of quarter-end;\n(d) Registration: The license shall be registered with the Controller of Patents under Section 68 of the Patents Act, 1970;\n(e) Improvements: Any improvements to the Licensed Patent made by the Licensee shall be: [owned by Licensee with a grant-back license to Licensor / jointly owned / owned by Licensor];\n(f) Validity: The Licensee shall not challenge the validity of the Licensed Patent during the term. This clause is subject to Section 140 of the Patents Act (which prohibits certain restrictive conditions);\n(g) Compulsory License: The Parties acknowledge that the Licensed Patent may be subject to compulsory licensing under Sections 84-92 of the Patents Act if the patented invention is not worked in India to a reasonable extent;\n(h) Term: The license shall remain in force for the remaining life of the Licensed Patent unless terminated earlier.`,
        tags: ["patent license", "Patents Act", "Section 68", "royalty", "compulsory license", "Section 84"],
        importance: "essential"
      },
      {
        id: "trade-secret-protection",
        title: "Trade Secret & Know-How Protection",
        description: "Protection of proprietary information and know-how in the absence of specific Indian legislation.",
        fullText: `Trade Secret & Know-How Protection:\n\n(a) India does not have a dedicated trade secret statute. Protection is available through: (i) Contract law (Indian Contract Act, 1872); (ii) Common law principles of breach of confidence; (iii) Copyright Act, 1957 (for documented know-how); (iv) Information Technology Act, 2000 (for digital trade secrets);\n(b) Definition: "Trade Secrets" means any non-public information, technical data, know-how, formula, process, technique, algorithm, customer list, supplier information, pricing strategy, business method, or other proprietary information that: (i) derives economic value from not being generally known; (ii) is subject to reasonable efforts to maintain its secrecy;\n(c) Obligations: The Receiving Party shall: (i) hold all Trade Secrets in strict confidence; (ii) limit access to personnel on a need-to-know basis; (iii) implement physical, electronic, and procedural security measures; (iv) not reverse-engineer products to derive Trade Secrets;\n(d) Duration: Confidentiality obligations with respect to Trade Secrets shall survive termination of this Agreement indefinitely, or until the Trade Secret enters the public domain through no fault of the Receiving Party;\n(e) Remedies: Breach shall entitle the Disclosing Party to: (i) injunctive relief; (ii) damages (including lost profits and unjust enrichment); (iii) delivery up of all materials containing Trade Secrets;\n(f) Criminal: Theft of trade secrets stored electronically may attract penalties under Section 43 and Section 65 of the IT Act, 2000.`,
        tags: ["trade secret", "know-how", "confidential", "Indian Contract Act", "IT Act", "reverse engineering"],
        importance: "essential"
      },
      {
        id: "design-registration",
        title: "Industrial Design Registration & Protection",
        description: "Registration and licensing of designs under the Designs Act, 2000.",
        fullText: `Industrial Design Protection (Designs Act, 2000):\n\n(a) Registration: The design shall be registered with the Controller of Designs at the Design Wing of the Patent Office, Kolkata, under the Designs Act, 2000;\n(b) Registrable Design: Features of shape, configuration, pattern, ornament, or composition of lines/colours applied to an article, whether 2D or 3D, that appeal to the eye — but excluding functional features;\n(c) Duration: Initially [10] years from the date of registration, extendable by [5] years upon payment of extension fee (total maximum 15 years);\n(d) Assignment: The Designer hereby assigns all rights in Design Registration No. [●] to the Assignee, including the right to sue for past infringements. The assignment shall be registered with the Controller of Designs;\n(e) License: Alternatively, the Designer grants a [non-exclusive / exclusive] license to use the registered design in India for the manufacture and sale of [specify articles];\n(f) Infringement: Applying a registered design or a fraudulent/obvious imitation to any article without consent constitutes infringement (Section 22). Remedies include injunction, damages, and account of profits;\n(g) Piracy: Any person who applies a registered design to an article without consent is liable to pay a sum not exceeding ₹25,000 for each contravention recoverable as a contract debt (Section 22(2));\n(h) Prior Publication: A design that has been published or publicly disclosed before the date of registration is not registrable.`,
        tags: ["design registration", "Designs Act", "industrial design", "Kolkata", "Section 22"],
        importance: "optional"
      },
      {
        id: "technology-transfer",
        title: "Technology Transfer & Collaboration Agreement",
        description: "Terms for transfer of technology, know-how, and technical assistance under Indian law.",
        fullText: `Technology Transfer Agreement:\n\n(a) Scope: The Licensor shall transfer to the Licensee the Technology comprising: (i) technical know-how and documentation listed in Schedule [●]; (ii) training for [●] personnel at the Licensor's facility; (iii) on-site technical assistance for [●] months;\n(b) Consideration: (i) Lump sum fee of ₹[●] / USD [●]; (ii) Running royalty of [●]% of net sales for [●] years; (iii) Total payments shall not exceed ₹[●] / USD [●] over the term;\n(c) RBI/FEMA Compliance: All payments to foreign licensors shall comply with the Foreign Exchange Management Act, 1999 (FEMA) and RBI's automatic route / approval route for technology transfer. Withholding tax (TDS) shall be deducted as per the Income Tax Act, 1961 and applicable DTAA;\n(d) DPIIT Guidelines: The agreement complies with the Department for Promotion of Industry and Internal Trade (DPIIT) guidelines on technology transfer and foreign collaboration;\n(e) Performance Guarantee: The Licensor guarantees that the Technology shall enable the Licensee to achieve [●] production capacity / quality standards within [●] months of full technology transfer;\n(f) Exclusivity: The Licensee shall have [exclusive / non-exclusive] rights to use the Technology in India;\n(g) Improvements: Improvements made by either Party during the term shall be shared with the other Party on a [royalty-free / reasonable royalty] basis;\n(h) Non-Compete: The Licensor shall not license the same Technology to any third party in India during the term;\n(i) Termination: Upon termination, the Licensee may continue to use the Technology already transferred, subject to continued royalty payments.`,
        tags: ["technology transfer", "FEMA", "DPIIT", "know-how", "royalty", "foreign collaboration", "TDS"],
        importance: "recommended"
      }
    ]
  },
  {
    id: "real-estate",
    name: "Real Estate & Property Law",
    icon: Building2,
    description: "Property transactions, RERA compliance, lease agreements, and construction contracts under Indian law",
    contractTypes: ["Sale Agreement", "Lease Agreement", "Development Agreement", "Joint Development Agreement"],
    clauses: [
      {
        id: "rera-compliance",
        title: "RERA Compliance & Registration",
        description: "Mandatory compliance with the Real Estate (Regulation and Development) Act, 2016.",
        fullText: `RERA Compliance (Real Estate (Regulation and Development) Act, 2016):\n\n(a) The Promoter represents and warrants that the Project is duly registered with the Real Estate Regulatory Authority under Section 3 of the RERA Act, 2016 (RERA Registration No. [●]);\n(b) The Promoter shall not advertise, market, book, sell, or offer for sale any apartment/plot without RERA registration (Section 3(1));\n(c) Allotment Letter: The Allotment Letter shall be issued in the prescribed format and shall contain all particulars as specified under Section 13;\n(d) Agreement for Sale: The Agreement for Sale shall be executed in the prescribed form (as per state RERA rules) and registered under the Registration Act, 1908;\n(e) Carpet Area: The sale shall be based on carpet area as defined in Section 2(k) — the net usable floor area excluding external walls, service areas, and common areas;\n(f) Structural Defect Liability: The Promoter shall be liable for structural defects or deficiencies in workmanship/quality for [5] years from the date of possession (Section 14(3));\n(g) Delayed Possession: If the Promoter fails to deliver possession by the committed date, the Allottee shall be entitled to interest at SBI's highest marginal cost of lending rate + 2% p.a. on the amount paid;\n(h) Escrow Account: 70% of the amounts realised shall be deposited in a separate escrow account to be used only for construction costs and land payment (Section 4(2)(l)(D));\n(i) Quarterly Updates: The Promoter shall upload quarterly progress reports (including photographs) on the RERA website.`,
        tags: ["RERA", "real estate", "carpet area", "structural defect", "escrow", "possession"],
        importance: "essential"
      },
      {
        id: "lease-agreement",
        title: "Commercial Lease Agreement",
        description: "Standard terms for commercial property lease under the Transfer of Property Act, 1882.",
        fullText: `Commercial Lease Agreement:\n\n(a) Demised Premises: The Lessor hereby leases to the Lessee the commercial premises situated at [●], admeasuring [●] sq. ft. (carpet area), more particularly described in Schedule A;\n(b) Lease Term: [●] years commencing from [●], with an option to renew for [●] additional terms of [●] years each, upon mutual agreement;\n(c) Monthly Rent: ₹[●] per month (₹[●] per sq. ft.), payable by the [5th] of each month. Rent escalation of [●]% every [●] years;\n(d) Security Deposit: ₹[●] (equivalent to [●] months' rent), refundable within [30] days of lease termination, after deducting unpaid dues and repair costs;\n(e) Permitted Use: The premises shall be used exclusively for [●]. Any change of use requires the Lessor's prior written consent;\n(f) Maintenance: Structural repairs — Lessor's responsibility. Interior maintenance, fixtures, and day-to-day upkeep — Lessee's responsibility;\n(g) Stamp Duty & Registration: This lease shall be executed on appropriate stamp paper as per the Indian Stamp Act, 1899 (state-specific rates) and registered under Section 17 of the Registration Act, 1908 (mandatory for leases exceeding 11 months);\n(h) GST: GST at the applicable rate (currently 18%) shall be payable on rent for commercial properties;\n(i) Lock-In Period: The first [●] months shall be a lock-in period during which neither party may terminate;\n(j) Termination: After the lock-in period, either party may terminate with [●] months' prior written notice.`,
        tags: ["lease", "commercial", "rent", "stamp duty", "Registration Act", "GST", "lock-in"],
        importance: "essential"
      },
      {
        id: "sale-agreement-property",
        title: "Agreement for Sale of Immovable Property",
        description: "Key terms for sale of land/building under the Transfer of Property Act and Registration Act.",
        fullText: `Agreement for Sale — Immovable Property:\n\n(a) The Vendor agrees to sell and the Purchaser agrees to purchase the immovable property described in Schedule A ("Property"), free from all encumbrances, charges, liens, and litigation;\n(b) Total Consideration: ₹[●] (Rupees [●] only), payable as follows:\n   - Earnest Money / Token Advance: ₹[●] on execution of this Agreement;\n   - Balance: ₹[●] at the time of execution and registration of the Sale Deed;\n(c) Title: The Vendor represents that they have clear, marketable, and undisputed title to the Property and shall provide original title documents, chain of title for [30+] years, EC (Encumbrance Certificate), tax receipts, and approved plan;\n(d) Due Diligence: The Purchaser shall have [●] days to conduct title search, verify approvals, and conduct physical inspection;\n(e) Sale Deed: The Sale Deed shall be executed on non-judicial stamp paper of appropriate value (as per state Stamp Duty rates) and registered at the Sub-Registrar's office under Section 17 of the Registration Act, 1908;\n(f) Stamp Duty & Registration Charges: To be borne by the Purchaser (rates vary by state — e.g., Maharashtra: 5-6%, Karnataka: 5.6%, Delhi: 4-6%);\n(g) TDS: The Purchaser shall deduct TDS at 1% under Section 194-IA of the Income Tax Act if the consideration exceeds ₹50 lakhs;\n(h) Mutation: Post-registration, the Purchaser shall apply for mutation in revenue records;\n(i) Default: If the Vendor defaults, the earnest money shall be refunded with interest at [●]% p.a. If the Purchaser defaults, the earnest money shall stand forfeited.`,
        tags: ["sale agreement", "immovable property", "title", "stamp duty", "TDS 194-IA", "registration"],
        importance: "essential"
      },
      {
        id: "jda",
        title: "Joint Development Agreement (JDA)",
        description: "Agreement between landowner and developer for joint property development.",
        fullText: `Joint Development Agreement:\n\n(a) The Landowner owns the Property and the Developer has expertise in real estate development. The Parties agree to jointly develop the Property;\n(b) Revenue Sharing: The built-up area / revenue shall be shared in the ratio of [●]% (Landowner) : [●]% (Developer);\n(c) Development Rights: The Landowner grants the Developer an irrevocable license and power of attorney to develop the Property, obtain approvals, and construct;\n(d) Approvals: The Developer shall obtain all necessary approvals including building plan sanction, environmental clearance (if applicable), fire NOC, and RERA registration at the Developer's cost;\n(e) Timeline: The Developer shall complete construction within [●] months from receipt of all approvals. Delay beyond [●] months shall attract a penalty of ₹[●] per month;\n(f) Capital Gains: The Landowner acknowledges that capital gains tax liability under Section 45(5A) of the Income Tax Act (as applicable from AY 2018-19) shall arise in the year in which the certificate of completion is issued;\n(g) GPA: The General Power of Attorney granted to the Developer shall be irrevocable during the term and shall be registered;\n(h) Landowner's Obligations: The Landowner shall ensure clear title, deliver physical possession, and execute all documents necessary for approvals and sale;\n(i) Developer's Obligations: The Developer shall bear all construction costs, maintain quality as per specifications in Schedule [●], and provide structural warranty for [5] years.`,
        tags: ["JDA", "joint development", "landowner", "developer", "Section 45(5A)", "GPA", "RERA"],
        importance: "recommended"
      }
    ]
  },
  {
    id: "banking-finance",
    name: "Banking & Finance",
    icon: Landmark,
    description: "Loan agreements, security interests, SARFAESI, and banking contracts under Indian law",
    contractTypes: ["Loan Agreement", "Facility Agreement", "Security Agreement", "Guarantee Agreement"],
    clauses: [
      {
        id: "loan-agreement",
        title: "Term Loan Agreement",
        description: "Standard term loan facility terms including disbursement, repayment, and security.",
        fullText: `Term Loan Agreement:\n\n(a) Facility: The Lender hereby agrees to provide a term loan facility of ₹[●] ("Loan") to the Borrower for the purpose of [●];\n(b) Disbursement: The Loan shall be disbursed in [single tranche / multiple tranches] within [●] days of fulfilment of Conditions Precedent;\n(c) Interest Rate: [●]% per annum ([fixed / floating — linked to RBI Repo Rate / MCLR + spread of [●]%]), calculated on a reducing balance basis. Interest shall be payable [monthly / quarterly];\n(d) Repayment: [●] equal monthly instalments (EMIs) of ₹[●] each, commencing [●] months from the date of first disbursement (moratorium period of [●] months);\n(e) Prepayment: The Borrower may prepay the Loan in part or in full, subject to a prepayment premium of [●]% on the prepaid amount (if within [●] years);\n(f) Security: The Loan shall be secured by: (i) first charge on [asset description]; (ii) personal guarantee of [●]; (iii) pledge of [●] shares;\n(g) Events of Default: (i) non-payment for [●] days; (ii) breach of financial covenants; (iii) cross-default; (iv) material adverse change; (v) insolvency proceedings;\n(h) Financial Covenants: The Borrower shall maintain: Debt-to-Equity ratio of not more than [●]:1; DSCR of not less than [●]:1; Current Ratio of not less than [●]:1;\n(i) CERSAI Registration: The charge shall be registered with CERSAI within [30] days of creation;\n(j) NPA Classification: The Parties acknowledge that the account shall be classified as NPA in accordance with RBI's Master Direction on Income Recognition and Asset Classification (IRAC Norms).`,
        tags: ["term loan", "EMI", "MCLR", "CERSAI", "NPA", "financial covenants", "security"],
        importance: "essential"
      },
      {
        id: "sarfaesi",
        title: "SARFAESI Act — Security Enforcement",
        description: "Rights of secured creditors under the Securitisation and Reconstruction of Financial Assets Act, 2002.",
        fullText: `SARFAESI Act Enforcement Clause:\n\n(a) The Borrower acknowledges that the Lender (being a "Secured Creditor" under SARFAESI Act, 2002) shall have the right to enforce security without court intervention if the account is classified as NPA;\n(b) Section 13(2) Notice: Upon classification as NPA, the Lender may issue a demand notice requiring the Borrower to discharge liabilities within 60 days;\n(c) Enforcement Measures (Section 13(4)): If the Borrower fails to comply, the Lender may: (i) take possession of the secured asset; (ii) sell or lease the secured asset; (iii) appoint a manager to manage the asset; (iv) take over management of the Borrower's business;\n(d) DRT Proceedings: Alternatively, the Lender may file an application before the Debt Recovery Tribunal (DRT) under the Recovery of Debts and Bankruptcy Act, 1993;\n(e) Section 17 Appeal: The Borrower may file an appeal before the DRT within [45] days of any action taken under Section 13(4);\n(f) Priority: The Lender's charge shall rank in priority as per CERSAI registration date. Government dues under Section 26E shall not have priority over secured creditors;\n(g) Limitation: Proceedings under SARFAESI must be initiated within 3 years from the date the account is classified as NPA (as per the Limitation Act, 1963, read with SC judgments);\n(h) Threshold: SARFAESI is applicable where the outstanding debt is ₹20 lakhs or more.`,
        tags: ["SARFAESI", "NPA", "DRT", "secured creditor", "Section 13", "enforcement", "CERSAI"],
        importance: "essential"
      },
      {
        id: "personal-guarantee",
        title: "Personal / Corporate Guarantee",
        description: "Guarantee obligations and enforceability under the Indian Contract Act, 1872.",
        fullText: `Guarantee Agreement (Indian Contract Act, 1872 — Sections 126-147):\n\n(a) The Guarantor hereby irrevocably and unconditionally guarantees to the Lender the due and punctual payment and performance of all obligations of the Borrower under the Loan Agreement;\n(b) Nature: This is a continuing guarantee (Section 129) covering all present and future obligations up to a maximum of ₹[●];\n(c) Co-Extensive Liability: The Guarantor's liability is co-extensive with that of the Borrower (Section 128) unless otherwise agreed;\n(d) Demand: The Lender may demand payment from the Guarantor without first proceeding against the Borrower or the security;\n(e) No Discharge: The Guarantor shall not be discharged by: (i) any variation in the terms of the Loan; (ii) any forbearance or extension of time granted to the Borrower; (iii) release of any co-guarantor or security;\n(f) Subrogation: Upon payment, the Guarantor shall be subrogated to all rights of the Lender against the Borrower (Section 140);\n(g) IBC Implications: The Guarantor acknowledges that under the Insolvency and Bankruptcy Code, 2016, a personal guarantor may be subject to insolvency proceedings independently of the corporate debtor;\n(h) Revocation: This guarantee may only be revoked for future transactions by [90] days' prior written notice (Section 130). Outstanding obligations shall remain covered.`,
        tags: ["guarantee", "surety", "Section 128", "Indian Contract Act", "IBC", "continuing guarantee"],
        importance: "essential"
      },
      {
        id: "hypothecation",
        title: "Hypothecation Agreement (Movable Assets)",
        description: "Creation of charge over movable assets without transfer of possession.",
        fullText: `Hypothecation Agreement:\n\n(a) The Borrower hereby creates a first and exclusive charge by way of hypothecation over the movable assets described in Schedule [●] ("Hypothecated Assets") in favour of the Lender as security for the Loan;\n(b) Assets Covered: [Inventory / receivables / machinery / vehicles / stock-in-trade], both present and future, valued at approximately ₹[●];\n(c) Possession: The Borrower shall retain possession and use of the Hypothecated Assets in the ordinary course of business;\n(d) Insurance: The Borrower shall insure the Hypothecated Assets at full replacement value with the Lender noted as loss payee;\n(e) Maintenance: The Borrower shall maintain the assets in good condition and shall not sell, transfer, or encumber without the Lender's prior consent;\n(f) Stock Statements: The Borrower shall submit monthly stock/debtors statements within [7] days of month-end;\n(g) Margin: The Borrower shall maintain a margin of [●]% between the value of Hypothecated Assets and the outstanding Loan;\n(h) Registration: The charge shall be registered with: (i) the Registrar of Companies (ROC) under Section 77 of the Companies Act, 2013, within [30] days; (ii) CERSAI within [30] days;\n(i) Enforcement: Upon default, the Lender may take possession of the Hypothecated Assets and sell them in accordance with the SARFAESI Act or through private sale with reasonable notice.`,
        tags: ["hypothecation", "movable assets", "charge", "CERSAI", "ROC", "stock statement", "Section 77"],
        importance: "recommended"
      }
    ]
  },
  {
    id: "labour-law",
    name: "Labour & Employment Law",
    icon: HardHat,
    description: "Labour compliance, workplace safety, social security, and industrial relations under Indian labour codes",
    contractTypes: ["Employment Agreement", "Contractor Agreement", "Standing Orders", "Settlement Agreement"],
    clauses: [
      {
        id: "labour-codes-compliance",
        title: "New Labour Codes Compliance",
        description: "Compliance with India's four new Labour Codes consolidating 29+ central labour laws.",
        fullText: `Labour Codes Compliance:\n\nThe Employer shall comply with the four Labour Codes enacted by Parliament (upon notification by states):\n\n(a) Code on Wages, 2019:\n   - Minimum wages as notified by the Central/State Government for the applicable scheduled employment;\n   - Wages shall be paid before the 7th (establishments with <1000 employees) or 10th (>1000) of the following month;\n   - Equal remuneration for equal work regardless of gender (Section 3);\n\n(b) Code on Social Security, 2020:\n   - EPF contribution: 12% of basic wages (employer + employee) for establishments with ≥20 employees;\n   - ESI contribution for employees earning ≤₹21,000/month;\n   - Gratuity payable after 5 years of continuous service (1 year for fixed-term employees) at 15 days' wages per year of service;\n\n(c) Industrial Relations Code, 2020:\n   - Standing Orders mandatory for establishments with ≥300 workers;\n   - Prior government permission required for retrenchment, lay-off, or closure if ≥300 workers;\n   - Fixed Term Employment permitted with same benefits as permanent employees on a pro-rata basis;\n\n(d) Occupational Safety, Health and Working Conditions Code, 2020:\n   - Maximum working hours: 8 hours/day, 48 hours/week;\n   - Overtime wages at twice the ordinary rate;\n   - Annual health check-ups for employees in hazardous processes;\n   - Inter-state migrant workers entitled to lump-sum travel allowance.`,
        tags: ["Labour Codes", "wages", "EPF", "ESI", "gratuity", "standing orders", "fixed term"],
        importance: "essential"
      },
      {
        id: "posh-compliance",
        title: "Prevention of Sexual Harassment (POSH)",
        description: "Mandatory POSH compliance under the Sexual Harassment of Women at Workplace Act, 2013.",
        fullText: `POSH Compliance (Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013):\n\n(a) The Employer shall constitute an Internal Complaints Committee (ICC) at each workplace/branch with ≥10 employees, comprising:\n   - Presiding Officer: Senior woman employee;\n   - ≥2 members from amongst employees committed to women's causes;\n   - 1 external member from an NGO or person familiar with the issues;\n\n(b) The ICC shall:\n   (i) Receive and inquire into complaints within [90] days;\n   (ii) Submit annual report to the employer and the District Officer;\n   (iii) Recommend action within [60] days of completion of inquiry;\n\n(c) Employer's Obligations:\n   (i) Provide a safe working environment;\n   (ii) Display conspicuously the penal consequences of sexual harassment and the ICC composition;\n   (iii) Conduct POSH awareness workshops at least annually;\n   (iv) Include POSH policy in the employee handbook;\n\n(d) Penalties: Non-compliance attracts a fine of up to ₹50,000 (first offence) and cancellation of business license (repeated offence);\n(e) Confidentiality: The identity of the complainant, respondent, and witnesses shall be kept confidential;\n(f) The Employee acknowledges receipt of the Company's POSH Policy and undertakes to abide by its provisions.`,
        tags: ["POSH", "sexual harassment", "ICC", "workplace safety", "women", "compliance"],
        importance: "essential"
      },
      {
        id: "contractor-labour",
        title: "Contract Labour Engagement",
        description: "Terms for engagement of contract labour under the Contract Labour Act and labour codes.",
        fullText: `Contract Labour Terms:\n\n(a) The Contractor is engaged as an independent contractor and shall not be deemed an employee of the Principal Employer;\n(b) Registration: The Principal Employer shall obtain registration under the Contract Labour (Regulation & Abolition) Act, 1970 (applicable to establishments with ≥20 contract workers). The Contractor shall obtain a license;\n(c) Wages: The Contractor shall ensure that contract workers are paid:\n   - Not less than the minimum wages applicable;\n   - In accordance with the Code on Wages, 2019;\n   - Within the prescribed time limits;\n(d) Statutory Compliance: The Contractor shall be solely responsible for:\n   - EPF and ESI contributions for contract workers;\n   - Maintaining registers and records as prescribed;\n   - Payment of bonus under the Payment of Bonus Act;\n(e) Principal Employer Liability: If the Contractor fails to pay wages within the prescribed period, the Principal Employer shall be liable to pay and may recover from the Contractor;\n(f) No Employer-Employee Relationship: The contract workers shall have no claim of employment, regularisation, or absorption against the Principal Employer;\n(g) Indemnification: The Contractor shall indemnify the Principal Employer against all claims, penalties, and statutory dues arising from non-compliance;\n(h) Safety: The Contractor shall comply with all applicable safety standards under the Factories Act, 1948 / OSH Code, 2020.`,
        tags: ["contract labour", "principal employer", "CLRA", "minimum wages", "EPF", "ESI", "indemnification"],
        importance: "recommended"
      },
      {
        id: "workplace-safety",
        title: "Workplace Health & Safety Policy",
        description: "Occupational safety obligations under the OSH Code, 2020 and Factories Act, 1948.",
        fullText: `Workplace Health & Safety:\n\n(a) The Employer shall ensure a safe and healthy working environment in compliance with the Occupational Safety, Health and Working Conditions Code, 2020 ("OSH Code") and, until its full notification, the Factories Act, 1948;\n(b) Safety Measures:\n   (i) Proper ventilation, lighting, and temperature control;\n   (ii) Fire safety equipment, exit signage, and regular fire drills;\n   (iii) First aid facilities and trained first aiders;\n   (iv) Personal Protective Equipment (PPE) for hazardous operations;\n(c) Safety Committee: Establishments with ≥[250] workers shall constitute a Safety Committee with equal representation of management and workers;\n(d) Accident Reporting: All workplace accidents resulting in death, serious bodily injury, or dangerous occurrences shall be reported to the Inspector within [●] hours;\n(e) Annual Health Check-Up: Employees engaged in hazardous processes shall undergo annual medical examinations at the Employer's cost;\n(f) Working Hours: Maximum [48] hours per week, [8] hours per day. Spread-over not to exceed [10.5] hours. Weekly rest of at least [1] day;\n(g) Overtime: Overtime wages payable at [2x] the ordinary rate;\n(h) Women's Safety: Women may work in all shifts (including night shifts) subject to adequate safety and transport arrangements;\n(i) Penalty: Contravention of safety provisions may attract imprisonment up to [2] years and/or fine up to ₹[5] lakhs.`,
        tags: ["workplace safety", "OSH Code", "Factories Act", "fire safety", "PPE", "overtime", "night shift"],
        importance: "recommended"
      }
    ]
  },
  {
    id: "environmental-esg",
    name: "Environmental & ESG",
    icon: Leaf,
    description: "Environmental clearance, pollution control, ESG commitments, and sustainability clauses",
    contractTypes: ["Project Agreement", "Supply Agreement", "Investment Agreement", "ESG Disclosure Agreement"],
    clauses: [
      {
        id: "environmental-clearance",
        title: "Environmental Clearance & Compliance",
        description: "Obligations under the Environment Protection Act, 1986 and EIA Notification, 2006.",
        fullText: `Environmental Clearance & Compliance:\n\n(a) The Project Proponent shall obtain Environmental Clearance (EC) from the Ministry of Environment, Forest and Climate Change (MoEFCC) or the State Environment Impact Assessment Authority (SEIAA) as applicable, prior to commencement of the Project, in compliance with the EIA Notification, 2006 (as amended);\n(b) Category: The Project falls under Category [A/B1/B2] of the EIA Notification Schedule;\n(c) EIA Report: An Environmental Impact Assessment report prepared by a QCI-NABET accredited consultant shall be submitted along with the application;\n(d) Public Hearing: For Category A and B1 projects, a public hearing shall be conducted as per the prescribed procedure;\n(e) Conditions: The Project Proponent shall strictly comply with all conditions imposed in the EC, including:\n   (i) Air and water quality monitoring;\n   (ii) Waste management and disposal;\n   (iii) Green belt development (33% of project area);\n   (iv) Corporate Environment Responsibility (CER) fund contribution;\n(f) Consent to Establish & Operate: Separate consents under the Water (Prevention and Control of Pollution) Act, 1974 and the Air (Prevention and Control of Pollution) Act, 1981 shall be obtained from the State Pollution Control Board (SPCB);\n(g) Hazardous Waste: Compliance with the Hazardous and Other Wastes (Management and Transboundary Movement) Rules, 2016;\n(h) Non-Compliance: Violation may attract penalties under Section 15 of the Environment Protection Act (imprisonment up to 5 years and/or fine up to ₹1 lakh per day of violation).`,
        tags: ["environmental clearance", "EIA", "MoEFCC", "SPCB", "pollution", "green belt", "CER"],
        importance: "essential"
      },
      {
        id: "esg-commitment",
        title: "ESG Commitment & Reporting",
        description: "Environmental, Social, and Governance obligations for investments and corporate governance.",
        fullText: `ESG Commitment Clause:\n\n(a) The Company commits to integrating Environmental, Social, and Governance (ESG) principles into its business operations and decision-making;\n(b) Environmental:\n   (i) Carbon footprint measurement and annual reduction targets;\n   (ii) Energy efficiency improvements and renewable energy adoption;\n   (iii) Water conservation and waste reduction programmes;\n   (iv) Compliance with SEBI's Business Responsibility and Sustainability Report (BRSR) framework (mandatory for top 1000 listed companies);\n(c) Social:\n   (i) CSR expenditure of at least 2% of average net profits (Section 135, Companies Act, 2013) for companies meeting the threshold;\n   (ii) Diversity & inclusion targets — [●]% women in workforce and [●]% in leadership by [year];\n   (iii) Community engagement and stakeholder welfare programmes;\n   (iv) Fair wages and supply chain labour standards;\n(d) Governance:\n   (i) Board independence — at least [1/3] independent directors;\n   (ii) Whistleblower mechanism under Section 177(9) of the Companies Act;\n   (iii) Anti-bribery and anti-corruption policy compliant with the Prevention of Corruption Act, 1988;\n   (iv) Related party transaction governance;\n(e) Reporting: Annual ESG/sustainability report aligned with GRI Standards / BRSR format;\n(f) Investor Representation: The Company represents that no material ESG risk or controversy exists that could have a Material Adverse Effect.`,
        tags: ["ESG", "BRSR", "CSR", "Section 135", "sustainability", "carbon footprint", "diversity"],
        importance: "recommended"
      },
      {
        id: "carbon-credit",
        title: "Carbon Credit & Green Energy Clause",
        description: "Terms for carbon credit trading and renewable energy obligations under Indian regulatory framework.",
        fullText: `Carbon Credit & Green Energy:\n\n(a) Carbon Credit Trading: The Company shall participate in the Indian Carbon Market (ICM) as established under the Energy Conservation (Amendment) Act, 2022, and comply with the Carbon Credit Trading Scheme, 2023 notified by MoEFCC;\n(b) Carbon Credits: Any Certified Emission Reductions (CERs) or Indian Carbon Credits generated from the Project shall be [owned by the Company / shared between the Parties in the ratio of [●]:[●]];\n(c) Renewable Purchase Obligation (RPO): The Company shall procure at least [●]% of its total electricity consumption from renewable sources, in compliance with the applicable State Electricity Regulatory Commission's RPO regulations;\n(d) Green Energy Certificate: Renewable Energy Certificates (RECs) purchased to meet RPO shall be procured from the Indian Energy Exchange (IEX) or Power Exchange India Limited (PXIL);\n(e) PAT Scheme: If the Company is a Designated Consumer under the Perform, Achieve and Trade (PAT) scheme of BEE, it shall achieve the notified specific energy consumption targets;\n(f) Green Building: The Project shall aim for [IGBC Gold / GRIHA 3-star / equivalent] green building certification;\n(g) Extended Producer Responsibility (EPR): For applicable products, the Company shall comply with EPR obligations under the Plastic Waste Management Rules, 2016 and E-Waste Management Rules, 2022;\n(h) Representation: The Company represents that its operations do not cause significant harm to any environmental objective ("Do No Significant Harm" principle).`,
        tags: ["carbon credit", "ICM", "renewable energy", "RPO", "PAT scheme", "green building", "EPR"],
        importance: "optional"
      }
    ]
  },
  {
    id: "data-privacy-cyber",
    name: "Data Privacy & Cyber Law",
    icon: ShieldCheck,
    description: "DPDPA 2023 deep-dive, cyber security, data breach response, and cross-border data transfer",
    contractTypes: ["Privacy Policy", "Data Processing Agreement", "Cyber Insurance", "IT Services Agreement"],
    clauses: [
      {
        id: "dpdpa-consent",
        title: "DPDPA 2023 — Consent Management",
        description: "Consent collection and management framework under India's Digital Personal Data Protection Act, 2023.",
        fullText: `Consent Management (DPDPA 2023):\n\n(a) The Data Fiduciary shall obtain free, specific, informed, unconditional, and unambiguous consent from the Data Principal before processing their personal data (Section 6);\n(b) Notice: Prior to seeking consent, the Data Fiduciary shall provide a clear notice in plain language (and in any language specified in the Eighth Schedule of the Constitution) containing:\n   (i) Description of personal data to be collected;\n   (ii) Purpose of processing;\n   (iii) How to exercise rights (access, correction, erasure, grievance, nomination);\n   (iv) How to file a complaint with the Data Protection Board of India;\n(c) Consent Manager: The Data Fiduciary may engage a Consent Manager (registered with the Board) to enable Data Principals to give, manage, review, and withdraw consent through an accessible and transparent platform;\n(d) Withdrawal: The Data Principal may withdraw consent at any time with the same ease with which it was given. Withdrawal shall not affect the lawfulness of processing done prior to withdrawal;\n(e) Children's Data: For personal data of children (under 18 years) or persons with disabilities, verifiable consent of the parent or lawful guardian is required (Section 9). The Data Fiduciary shall not undertake tracking, behavioural monitoring, or targeted advertising directed at children;\n(f) Deemed Consent (Section 7): Consent is deemed for: (i) voluntary provision of data for a specified purpose; (ii) state functions; (iii) medical emergencies; (iv) employment purposes; (v) public interest;\n(g) Penalties: Processing without valid consent may attract penalties up to ₹250 crore per instance as determined by the Data Protection Board.`,
        tags: ["DPDPA", "consent", "Data Principal", "children", "consent manager", "penalty", "Section 6"],
        importance: "essential"
      },
      {
        id: "cyber-security-incident",
        title: "Cyber Security Incident Response",
        description: "Obligations for reporting and managing cyber security incidents under CERT-In directions.",
        fullText: `Cyber Security Incident Response:\n\n(a) CERT-In Compliance: The Service Provider shall comply with CERT-In Directions dated 28 April 2022 (effective 25 June 2022) regarding cyber incident reporting;\n(b) Mandatory Reporting: The following incidents shall be reported to CERT-In within [6] hours of detection:\n   - Targeted scanning/probing of critical networks;\n   - Compromise of critical systems or information;\n   - Unauthorised access to IT systems/data;\n   - Defacement of websites;\n   - Malicious code attacks (ransomware, cryptomining);\n   - Attacks on servers, databases, and infrastructure;\n   - Data breaches or data leaks;\n   - Attacks on IoT devices and associated systems;\n(c) Log Retention: The Service Provider shall maintain logs of all ICT systems for a rolling period of [180] days within Indian jurisdiction;\n(d) Synchronisation: All ICT system clocks shall be synchronised with NTP servers of NIC or NPL;\n(e) KYC for VPN/VPS: If the Service Provider offers VPN, VPS, or cloud services, subscriber KYC records shall be maintained for [5] years after cancellation;\n(f) Data Breach Response Plan: The Service Provider shall maintain a documented incident response plan covering: detection, containment, eradication, recovery, and post-incident review;\n(g) Notification to Affected Parties: The Data Fiduciary shall notify affected Data Principals "without unreasonable delay" of any personal data breach under DPDPA 2023;\n(h) Penalties: Non-reporting or delayed reporting to CERT-In may attract penalties under the IT Act, 2000.`,
        tags: ["CERT-In", "cyber incident", "data breach", "6 hours", "log retention", "IT Act", "ransomware"],
        importance: "essential"
      },
      {
        id: "cross-border-data",
        title: "Cross-Border Data Transfer",
        description: "Restrictions and mechanisms for international transfer of personal data from India.",
        fullText: `Cross-Border Data Transfer:\n\n(a) DPDPA 2023 Framework: Personal data may be transferred outside India to any country or territory, EXCEPT to countries/territories specifically restricted by the Central Government through notification under Section 16(1);\n(b) Restricted Countries: The Data Fiduciary shall not transfer personal data to any country that appears on the negative list notified by the Government (to be published);\n(c) Contractual Safeguards: Notwithstanding the above, the Parties agree to implement the following safeguards for cross-border transfers:\n   (i) The recipient shall maintain security safeguards equivalent to those required under DPDPA;\n   (ii) The recipient shall process data only for the specified purpose;\n   (iii) The recipient shall assist in responding to Data Principal rights requests;\n   (iv) The recipient shall notify the transferor of any data breach;\n(d) Sectoral Restrictions:\n   - RBI: Payment system data must be stored in India (RBI Circular 2018);\n   - SEBI: Certain market data and investor data subject to localisation;\n   - Telecom: Subscriber data subject to DoT licensing conditions;\n(e) Government Access: The recipient shall not disclose personal data to any foreign government unless legally required, and shall promptly notify the transferor;\n(f) Standard Contractual Clauses: Until India notifies specific transfer mechanisms, the Parties shall execute standard contractual clauses substantially in the form attached as Annexure [●];\n(g) Audit: The Data Fiduciary shall have the right to audit the recipient's data protection practices annually.`,
        tags: ["cross-border", "data transfer", "Section 16", "DPDPA", "RBI", "localisation", "SCC"],
        importance: "recommended"
      }
    ]
  },
  {
    id: "consumer-protection",
    name: "Consumer Protection & E-Commerce",
    icon: ShoppingCart,
    description: "Consumer rights, e-commerce regulations, product liability, and advertising standards",
    contractTypes: ["Terms of Service", "E-Commerce Agreement", "Product Warranty", "Marketplace Agreement"],
    clauses: [
      {
        id: "consumer-rights",
        title: "Consumer Rights & Product Liability",
        description: "Obligations under the Consumer Protection Act, 2019 and product liability framework.",
        fullText: `Consumer Rights & Product Liability (Consumer Protection Act, 2019):\n\n(a) Consumer Rights: The Company acknowledges the following rights of consumers:\n   (i) Right to be protected against marketing of hazardous goods/services;\n   (ii) Right to be informed about quality, quantity, standard, and price;\n   (iii) Right to be assured access to a variety of goods/services at competitive prices;\n   (iv) Right to seek redressal against unfair trade practices;\n   (v) Right to consumer awareness;\n\n(b) Product Liability (Chapter VI): The manufacturer, product seller, and product service provider shall be liable for any harm caused by a defective product or deficiency in service. "Harm" includes death, personal injury, mental agony, emotional distress, property damage, and economic loss;\n\n(c) Defective Product: A product is defective if it has any fault, imperfection, or shortcoming in quality, design, manufacturing, labelling, or packaging, including failure to warn;\n\n(d) Unfair Trade Practices: The Company shall not engage in unfair trade practices including false representation, misleading advertisements, bait-and-switch, or refusing to issue receipts/bills;\n\n(e) Complaint Forums:\n   - District Commission: Claims up to ₹1 crore;\n   - State Commission: ₹1 crore to ₹10 crore;\n   - National Commission: Above ₹10 crore;\n\n(f) Mediation: The Company agrees to participate in mediation under Chapter V if proposed by the Consumer Commission;\n(g) E-filing: Complaints may be filed electronically through the e-Daakhil portal.`,
        tags: ["consumer protection", "product liability", "defective product", "unfair trade", "e-Daakhil"],
        importance: "essential"
      },
      {
        id: "ecommerce-rules",
        title: "E-Commerce Compliance (Consumer Protection Rules)",
        description: "Mandatory compliance for e-commerce entities under the Consumer Protection (E-Commerce) Rules, 2020.",
        fullText: `E-Commerce Rules Compliance (Consumer Protection (E-Commerce) Rules, 2020):\n\n(a) Entity Classification: The e-commerce entity operates as a [marketplace model / inventory model]. Marketplace entities shall not directly or indirectly influence sale prices;\n(b) Mandatory Disclosures: Every product listing shall display:\n   - Total price including taxes, delivery charges, and handling fees;\n   - Country of origin;\n   - Expiry date (where applicable);\n   - Seller name, address, and customer care details;\n   - Return, refund, exchange, and warranty/guarantee policies;\n   - Grievance officer details;\n\n(c) Seller Obligations on Marketplace:\n   - No seller or group companies shall contribute more than [25]% of total sales (to prevent inventory-based model characteristics);\n   - Sellers shall honour all warranties and guarantees;\n\n(d) Return & Refund: The Platform shall implement a clear return policy with refund processed within [●] days of return receipt;\n\n(e) Grievance Redressal:\n   - Appoint a Grievance Officer (resident in India);\n   - Acknowledge complaint within [48] hours;\n   - Resolve within [1] month of receipt;\n\n(f) Flash Sales: The Platform shall not organise flash sales that limit consumer choice or create artificial scarcity;\n(g) Fall-Back Liability: If a seller fails to deliver goods/services, the marketplace e-commerce entity may have fall-back liability;\n(h) Compliance Officer: Entities with turnover exceeding the prescribed threshold shall appoint a Chief Compliance Officer and a Nodal Contact Person.`,
        tags: ["e-commerce", "marketplace", "country of origin", "grievance officer", "flash sale", "fall-back liability"],
        importance: "essential"
      },
      {
        id: "advertising-standards",
        title: "Advertising Standards & Misleading Ads",
        description: "Compliance with advertising regulations and ASCI guidelines for digital and traditional media.",
        fullText: `Advertising Standards & Misleading Advertisements:\n\n(a) The Advertiser shall ensure that all advertisements comply with:\n   - Consumer Protection Act, 2019 (Section 2(28) — misleading advertisement);\n   - ASCI (Advertising Standards Council of India) Code for Self-Regulation;\n   - Cable Television Networks (Regulation) Act, 1995 (for broadcast ads);\n   - Guidelines for Prevention of Misleading Advertisements and Endorsements for Misleading Advertisements, 2022;\n\n(b) Prohibited Content: Advertisements shall not:\n   (i) Make false or misleading claims about product efficacy, quality, or origin;\n   (ii) Disparage competitors' products;\n   (iii) Target children with manipulative content;\n   (iv) Use surrogate advertising for prohibited products (alcohol, tobacco);\n\n(c) Endorsements: Celebrity and influencer endorsements must comply with:\n   - Section 2(47) of the Consumer Protection Act (endorsement liability);\n   - ASCI Guidelines for Influencer Advertising — mandatory disclosure of paid partnerships (#ad, #sponsored);\n   - Due diligence by the endorser to verify claims;\n\n(d) Penalties (Section 89): First offence — penalty up to ₹10 lakhs. Subsequent offence — up to ₹50 lakhs. The CCPA may also prohibit the endorser from making endorsements for up to [1] year (first offence) or [3] years (subsequent);\n\n(e) Comparative Advertising: Permitted under ASCI guidelines if: (i) it is truthful; (ii) the comparison is with identifiable products; (iii) it compares material and verifiable features;\n(f) Digital Advertising: Ads on social media, search engines, and digital platforms must comply with the IT (Intermediary Guidelines) Rules, 2021.`,
        tags: ["advertising", "ASCI", "misleading ads", "endorsement", "CCPA", "influencer", "comparative ads"],
        importance: "recommended"
      }
    ]
  }
];

const importanceBadge = {
  essential: { label: "Essential", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  recommended: { label: "Recommended", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  optional: { label: "Optional", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
};

const ClauseFinder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContractType, setSelectedContractType] = useState<string>("All");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedClauses, setExpandedClauses] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedClauses, setSelectedClauses] = useState<Set<string>>(new Set());

  const contractTypes = useMemo(() => {
    const types = new Set<string>();
    clauseDatabase.forEach(cat => cat.contractTypes.forEach(t => types.add(t)));
    return ["All", ...Array.from(types).sort()];
  }, []);

  const filteredCategories = useMemo(() => {
    return clauseDatabase.map(category => {
      const filteredClauses = category.clauses.filter(clause => {
        const matchesSearch = !searchQuery ||
          clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clause.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clause.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = selectedContractType === "All" ||
          category.contractTypes.includes(selectedContractType);

        return matchesSearch && matchesType;
      });

      return { ...category, clauses: filteredClauses };
    }).filter(cat => cat.clauses.length > 0);
  }, [searchQuery, selectedContractType]);

  const totalClauses = filteredCategories.reduce((sum, cat) => sum + cat.clauses.length, 0);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleClause = (id: string) => {
    setExpandedClauses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyClause = (clause: Clause) => {
    navigator.clipboard.writeText(clause.fullText);
    setCopiedId(clause.id);
    toast({ title: "Copied!", description: `"${clause.title}" clause copied to clipboard.` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSelectClause = (clauseId: string) => {
    setSelectedClauses(prev => {
      const next = new Set(prev);
      if (next.has(clauseId)) next.delete(clauseId);
      else next.add(clauseId);
      return next;
    });
  };

  const getAllClausesFlat = () => {
    return clauseDatabase.flatMap(cat => cat.clauses.map(c => ({ ...c, categoryName: cat.name })));
  };

  const exportSelectedToPDF = () => {
    const allClauses = getAllClausesFlat();
    const selected = allClauses.filter(c => selectedClauses.has(c.id));
    if (selected.length === 0) {
      toast({ title: "No clauses selected", description: "Please select at least one clause to export.", variant: "destructive" });
      return;
    }

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Clause Finder — Selected Clauses", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}  |  ${selected.length} clause(s)`, 14, 28);

    let y = 38;
    selected.forEach((clause, idx) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`${idx + 1}. ${clause.title}`, 14, y);
      y += 6;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(`Category: ${(clause as any).categoryName}  |  Importance: ${clause.importance}`, 14, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(clause.fullText, 180);
      lines.forEach((line: string) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(line, 14, y);
        y += 4.5;
      });
      y += 8;
    });

    doc.save("Clause_Finder_Selected.pdf");
    toast({ title: "PDF Exported!", description: `${selected.length} clause(s) exported successfully.` });
  };

  const useInContractDrafter = (clause: Clause) => {
    // Store clause text in sessionStorage and navigate to Contract Drafter
    sessionStorage.setItem("clauseForDrafter", JSON.stringify({ title: clause.title, text: clause.fullText }));
    navigate("/contract-drafter");
    toast({ title: "Clause loaded!", description: `"${clause.title}" is ready to use in Contract Drafter.` });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/prototypes")} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-primary" />
              Clause Finder
            </h1>
            <p className="text-muted-foreground text-sm">Search, learn, and copy professional legal clauses for your contracts</p>
          </div>
        </div>

        {/* Search & Filter */}
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clauses by name, keyword, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {contractTypes.map(type => (
                <Button
                  key={type}
                  variant={selectedContractType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedContractType(type)}
                  className="text-xs"
                >
                  {type}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {totalClauses} clause{totalClauses !== 1 ? "s" : ""} across {filteredCategories.length} categor{filteredCategories.length !== 1 ? "ies" : "y"}
              </p>
              {selectedClauses.size > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{selectedClauses.size} selected</Badge>
                  <Button variant="default" size="sm" onClick={exportSelectedToPDF} className="text-xs gap-1.5">
                    <FileDown className="h-3 w-3" />
                    Export PDF
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedClauses(new Set())} className="text-xs">
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clause Categories */}
        <div className="space-y-4">
          {filteredCategories.map(category => {
            const Icon = category.icon;
            const isExpanded = expandedCategories[category.id] !== false; // default open

            return (
              <Card key={category.id} className="border-border/50 overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {category.clauses.length} clause{category.clauses.length !== 1 ? "s" : ""}
                          </Badge>
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {category.contractTypes.map(t => (
                          <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
                        ))}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-3 px-4 pb-4">
                      {category.clauses.map(clause => {
                        const isClauseExpanded = expandedClauses[clause.id];
                        const imp = importanceBadge[clause.importance];

                        return (
                          <div key={clause.id} className="border border-border/50 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleClause(clause.id)}
                              className="w-full text-left p-3 hover:bg-muted/20 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={selectedClauses.has(clause.id)}
                                    onChange={(e) => { e.stopPropagation(); toggleSelectClause(clause.id); }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-1 h-3.5 w-3.5 rounded border-border accent-primary shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="font-semibold text-sm">{clause.title}</h3>
                                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${imp.className}`}>
                                        {imp.label}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{clause.description}</p>
                                  </div>
                                </div>
                                {isClauseExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2 ml-5">
                                {clause.tags.map(tag => (
                                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </button>

                            {isClauseExpanded && (
                              <div className="border-t border-border/50 p-3 bg-muted/10">
                                <div className="flex justify-end gap-2 mb-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => useInContractDrafter(clause)}
                                    className="text-xs gap-1.5"
                                  >
                                    <Pen className="h-3 w-3" />
                                    Use in Contract Drafter
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyClause(clause)}
                                    className="text-xs gap-1.5"
                                  >
                                    {copiedId === clause.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    {copiedId === clause.id ? "Copied" : "Copy Clause"}
                                  </Button>
                                </div>
                                <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90 font-sans">
                                  {clause.fullText}
                                </pre>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No clauses found matching your search.</p>
              <Button variant="link" onClick={() => { setSearchQuery(""); setSelectedContractType("All"); }}>
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClauseFinder;
