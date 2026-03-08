import { useUserProfile } from "@/hooks/useUserProfile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ActiveEntitySelector = () => {
  const { legalEntities, activeEntityId, setActiveEntityId } = useUserProfile();

  if (legalEntities.length === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center">
          <Select
            value={activeEntityId || "none"}
            onValueChange={(v) => setActiveEntityId(v === "none" ? null : v)}
          >
            <SelectTrigger className="h-9 w-[140px] sm:w-[180px] text-xs gap-1 border-primary/20">
              <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <SelectValue placeholder="Select entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No active entity</SelectItem>
              {legalEntities.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Active Legal Entity — pre-fills data across tools</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ActiveEntitySelector;
