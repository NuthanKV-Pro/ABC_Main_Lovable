import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, BookOpen, Copy, Check, ChevronDown, ChevronRight, FileText, Shield, Users, Briefcase, Scale, Handshake, Lock, UserCheck, Cpu, Rocket, ScrollText, Copyright, Fingerprint, Globe } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

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
            <p className="text-xs text-muted-foreground">
              Showing {totalClauses} clause{totalClauses !== 1 ? "s" : ""} across {filteredCategories.length} categor{filteredCategories.length !== 1 ? "ies" : "y"}
            </p>
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
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-sm">{clause.title}</h3>
                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${imp.className}`}>
                                      {imp.label}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{clause.description}</p>
                                </div>
                                {isClauseExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {clause.tags.map(tag => (
                                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </button>

                            {isClauseExpanded && (
                              <div className="border-t border-border/50 p-3 bg-muted/10">
                                <div className="flex justify-end mb-2">
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
