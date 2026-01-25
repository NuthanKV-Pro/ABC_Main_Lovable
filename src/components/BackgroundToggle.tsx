import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const STORAGE_KEY = "bg-enabled";

export function useBackgroundEnabled() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== "false"; // Default to true
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  return [enabled, setEnabled] as const;
}

interface BackgroundToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function BackgroundToggle({ enabled, onChange }: BackgroundToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg px-2 py-1">
          <Sparkles className={`h-3.5 w-3.5 transition-colors ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
          <Switch
            checked={enabled}
            onCheckedChange={onChange}
            className="data-[state=checked]:bg-primary h-5 w-9"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {enabled ? "Turn off background animation" : "Turn on background animation"}
      </TooltipContent>
    </Tooltip>
  );
}
