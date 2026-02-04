import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ExternalLink, Clock } from "lucide-react";
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
import { getAllSearchItems, SearchItem } from "@/lib/searchData";

const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSelect = (route: string | null) => {
    // Handle null routes (Coming Soon items)
    if (!route) {
      setOpen(false);
      setSearch("");
      return;
    }
    
    setOpen(false);
    setSearch("");
    
    // Handle external links
    if (route.startsWith("external:")) {
      const externalUrl = route.replace("external:", "");
      window.open(externalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    
    // Handle internal routes
    navigate(route);
  };

  // Get all search items from centralized data
  const allSearchItems = getAllSearchItems();

  // Filter items based on search query (name, category, or keywords)
  const filteredItems = search.trim() === "" 
    ? allSearchItems 
    : allSearchItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(search.toLowerCase())))
      );

  // Group filtered items by category
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
                {items.map((item) => {
                  const isExternal = item.route?.startsWith("external:");
                  const isComingSoon = !item.route;
                  
                  return (
                    <CommandItem
                      key={item.route || item.name}
                      value={item.name}
                      onSelect={() => handleSelect(item.route)}
                      className={`cursor-pointer flex items-center justify-between ${isComingSoon ? "opacity-50" : ""}`}
                      disabled={isComingSoon}
                    >
                      <span>{item.name}</span>
                      {isExternal && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                      {isComingSoon && <Clock className="h-3 w-3 text-muted-foreground" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchBar;
