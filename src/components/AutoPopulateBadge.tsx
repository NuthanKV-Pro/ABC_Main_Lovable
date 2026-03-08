import { Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PopulatedInfo } from "@/hooks/useAutoPopulate";

interface AutoPopulateBadgeProps {
  fieldKey: string;
  populatedFields: Map<string, PopulatedInfo>;
  onReset: (fieldKey: string) => void;
}

const AutoPopulateBadge = ({ fieldKey, populatedFields, onReset }: AutoPopulateBadgeProps) => {
  const info = populatedFields.get(fieldKey);
  if (!info) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 ml-2">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-1 font-normal">
            <Info className="h-3 w-3 text-primary" />
            {info.source}
            <Button
              variant="ghost"
              size="icon"
              className="h-3.5 w-3.5 p-0 hover:bg-destructive/20 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                onReset(fieldKey);
              }}
            >
              <X className="h-2.5 w-2.5 text-muted-foreground" />
            </Button>
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">Auto-filled from <strong>{info.source}</strong>. Click ✕ to reset.</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default AutoPopulateBadge;
