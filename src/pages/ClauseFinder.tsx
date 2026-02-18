import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, BookOpen, Copy, Check, ChevronDown, ChevronRight, FileText, Shield, Users, Briefcase, Scale, Handshake, Lock, UserCheck } from "lucide-react";
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
