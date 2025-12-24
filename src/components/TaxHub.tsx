import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  BookOpen, 
  FileText, 
  ScrollText, 
  Bell, 
  Scale, 
  Building, 
  Download, 
  Headphones, 
  Megaphone,
  ChevronDown,
  ExternalLink
} from "lucide-react";

const taxHubLinks = [
  {
    label: "Income Tax Act",
    url: "https://incometaxindia.gov.in/Pages/acts/income-tax-act.aspx",
    icon: BookOpen,
  },
  {
    label: "Income Tax Rules",
    url: "https://incometaxindia.gov.in/Pages/rules/income-tax-rules-1962.aspx",
    icon: ScrollText,
  },
  {
    label: "Circulars",
    url: "https://incometaxindia.gov.in/Pages/communications/circulars.aspx",
    icon: FileText,
  },
  {
    label: "Notifications",
    url: "https://incometaxindia.gov.in/Pages/communications/notifications.aspx",
    icon: Bell,
  },
  {
    label: "Income Tax Act 2025",
    url: "https://incometaxindia.gov.in/Pages/income-tax-no-2-bill-2025.aspx",
    icon: BookOpen,
  },
  {
    label: "Black Money Act",
    url: "https://incometaxindia.gov.in/pages/acts/black-money-undisclosed-income-act.aspx",
    icon: Scale,
  },
  {
    label: "Benami Act",
    url: "https://incometaxindia.gov.in/pages/acts/prohibition-of-benami-property-transactions-act-1988.aspx",
    icon: Building,
  },
  {
    label: "ITR Forms",
    url: "https://incometaxindia.gov.in/Pages/downloads/income-tax-return.aspx",
    icon: Download,
  },
  {
    label: "Income Tax Forms",
    url: "https://incometaxindia.gov.in/Pages/downloads/most-used-forms.aspx",
    icon: FileText,
  },
  {
    label: "Tax Services",
    url: "https://incometaxindia.gov.in/Pages/tax-services.aspx",
    icon: Headphones,
  },
  {
    label: "Press Releases",
    url: "https://incometaxindia.gov.in/Pages/press-releases.aspx",
    icon: Megaphone,
  },
];

const TaxHub = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 border-primary/30 hover:bg-primary/10">
          <BookOpen className="w-4 h-4 text-primary" />
          Tax Hub
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Tax Resources</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {taxHubLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <DropdownMenuItem
              key={index}
              className="cursor-pointer gap-2"
              onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1">{link.label}</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaxHub;
