import { cn } from "@/lib/utils";
import { backgrounds, type ThemeType } from "./GameArena";
import { Trees, Code, Swords, Crosshair } from "lucide-react";

interface ThemeSelectorProps {
  selected: ThemeType;
  onChange: (theme: ThemeType) => void;
}

const themeOptions: { type: ThemeType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: "forest", label: "Forest Run", icon: <Trees className="w-5 h-5" />, description: "Temple Run style" },
  { type: "coding", label: "Hacker", icon: <Code className="w-5 h-5" />, description: "Cyber warfare" },
  { type: "ninja", label: "Ninja", icon: <Swords className="w-5 h-5" />, description: "Martial arts" },
  { type: "agent", label: "Agent 007", icon: <Crosshair className="w-5 h-5" />, description: "Spy mission" },
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
            style={{ backgroundImage: `url(${backgrounds[type]})` }}
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
