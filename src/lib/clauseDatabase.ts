// Shared clause database used by both ClauseFinder and ContractDrafter
import { Users, Handshake, Shield, Briefcase, Lock, FileText, Scale, Rocket, Cpu, ScrollText, Copyright, Fingerprint, Globe, Building2, Landmark, HardHat, Leaf, ShieldCheck, ShoppingCart, UserCheck } from "lucide-react";

export interface Clause {
  id: string;
  title: string;
  description: string;
  fullText: string;
  tags: string[];
  importance: "essential" | "recommended" | "optional";
}

export interface ClauseCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  contractTypes: string[];
  clauses: Clause[];
}

export const importanceBadge = {
  essential: { label: "Essential", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  recommended: { label: "Recommended", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  optional: { label: "Optional", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
};

// Re-export the clauseDatabase - this will be imported from ClauseFinder's original data
// We use a dynamic import pattern to avoid duplicating the massive dataset
export { clauseDatabase } from "@/pages/ClauseFinderData";
