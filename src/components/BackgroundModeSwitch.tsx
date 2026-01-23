import { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid3X3, CircleDot, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type BackgroundMode = "grid" | "solar" | "off";

const STORAGE_KEY = "bg-mode";

export function useBackgroundMode() {
  const [mode, setMode] = useState<BackgroundMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "grid" || stored === "solar" || stored === "off") {
        return stored;
      }
    }
    return "solar";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return [mode, setMode] as const;
}

interface BackgroundModeSwitchProps {
  mode: BackgroundMode;
  onChange: (mode: BackgroundMode) => void;
}

export default function BackgroundModeSwitch({ mode, onChange }: BackgroundModeSwitchProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden sm:inline">BG:</span>
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(value) => value && onChange(value as BackgroundMode)}
        className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg p-0.5"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="grid"
              aria-label="Grid background"
              className="h-7 w-7 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Grid</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="solar"
              aria-label="Solar system background"
              className="h-7 w-7 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
              <CircleDot className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Solar</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="off"
              aria-label="No background animation"
              className="h-7 w-7 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Off</TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </div>
  );
}
