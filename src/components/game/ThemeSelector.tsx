import { cn } from "@/lib/utils";
import { BACKGROUNDS, THEME_CONFIGS, ThemeType } from "@/config/game";
import { Trees, Code, Swords, Crosshair } from "lucide-react";

interface ThemeSelectorProps {
  selected: ThemeType;
  onChange: (theme: ThemeType) => void;
}

const themeOptions: { type: ThemeType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: "forest", label: THEME_CONFIGS.forest.name, icon: <Trees className="w-5 h-5" />, description: THEME_CONFIGS.forest.description },
  { type: "coding", label: THEME_CONFIGS.coding.name, icon: <Code className="w-5 h-5" />, description: THEME_CONFIGS.coding.description },
  { type: "ninja", label: THEME_CONFIGS.ninja.name, icon: <Swords className="w-5 h-5" />, description: THEME_CONFIGS.ninja.description },
  { type: "agent", label: THEME_CONFIGS.agent.name, icon: <Crosshair className="w-5 h-5" />, description: THEME_CONFIGS.agent.description },
];

export function ThemeSelector({ selected, onChange }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {themeOptions.map(({ type, label, icon, description }) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all overflow-hidden group",
            selected === type
              ? "border-primary shadow-lg shadow-primary/20"
              : "border-border hover:border-primary/50"
          )}
        >
          {/* Background Preview */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity"
            style={{ backgroundImage: `url(${BACKGROUNDS[type]})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
              selected === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {icon}
            </div>
            <span className={cn(
              "text-sm font-medium",
              selected === type ? "text-primary" : "text-foreground"
            )}>
              {label}
            </span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
