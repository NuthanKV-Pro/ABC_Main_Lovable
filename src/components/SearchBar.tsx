import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchItem {
  name: string;
  route: string;
  category: string;
}

const searchItems: SearchItem[] = [
  // Income Modules
  { name: "Salary Income", route: "/salary", category: "Income Modules" },
  { name: "House Property", route: "/house-property", category: "Income Modules" },
  { name: "Business & Profession", route: "/business-profession", category: "Income Modules" },
  { name: "Capital Gains", route: "/capital-gains", category: "Income Modules" },
  { name: "Other Sources", route: "/other-sources", category: "Income Modules" },
  
  // Tax Modules
  { name: "Deductions", route: "/deductions", category: "Tax Modules" },
  { name: "Exempt Income", route: "/exempt-income", category: "Tax Modules" },
  { name: "Regime Comparison", route: "/regime-comparison", category: "Tax Modules" },
  { name: "Year Comparison", route: "/year-comparison", category: "Tax Modules" },
  { name: "Tax Payments", route: "/tax-payments", category: "Tax Modules" },
  { name: "Total Income & Tax", route: "/total-income-tax", category: "Tax Modules" },
  
  // Amazing Tools
  { name: "Gratuity Calculator", route: "/gratuity-calculator", category: "Amazing Tools" },
  { name: "Retirement Calculator", route: "/retirement-calculator", category: "Amazing Tools" },
  { name: "SIP Calculator", route: "/sip-calculator", category: "Amazing Tools" },
  { name: "PPF Calculator", route: "/ppf-calculator", category: "Amazing Tools" },
  { name: "FD Calculator", route: "/fd-calculator", category: "Amazing Tools" },
  { name: "Lumpsum Calculator", route: "/lumpsum-calculator", category: "Amazing Tools" },
  { name: "EMI Calculator", route: "/emi-calculator", category: "Amazing Tools" },
  { name: "Financial Ratios", route: "/financial-ratios", category: "Amazing Tools" },
  
  // Other Pages
  { name: "Dashboard", route: "/dashboard", category: "Pages" },
  { name: "Profile Settings", route: "/profile-settings", category: "Pages" },
];

const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSelect = (route: string) => {
    setOpen(false);
    setSearch("");
    navigate(route);
  };

  const filteredItems = searchItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] md:w-[280px] justify-start text-muted-foreground"
        >
          <Search className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">Search modules & tools...</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] md:w-[350px] p-0" align="end">
        <Command>
          <CommandInput 
            placeholder="Search modules & tools..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(groupedItems).map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((item) => (
                  <CommandItem
                    key={item.route}
                    value={item.name}
                    onSelect={() => handleSelect(item.route)}
                    className="cursor-pointer"
                  >
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchBar;
