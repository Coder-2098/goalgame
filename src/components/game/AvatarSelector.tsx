import { cn } from "@/lib/utils";
import { avatars, type AvatarType } from "./GameArena";

interface AvatarSelectorProps {
  selected: AvatarType;
  onChange: (avatar: AvatarType) => void;
}

const avatarOptions: { type: AvatarType; label: string }[] = [
  { type: "boy", label: "Boy" },
  { type: "girl", label: "Girl" },
  { type: "fighter", label: "Fighter" },
  { type: "ninja", label: "Ninja" },
  { type: "agent", label: "Agent" },
];

export function AvatarSelector({ selected, onChange }: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {avatarOptions.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            "flex flex-col items-center p-2 rounded-xl border-2 transition-all",
            selected === type
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
              : "border-border hover:border-primary/50"
          )}
        >
          <img
            src={avatars[type]}
            alt={label}
            className="w-12 h-12 rounded-full object-cover"
          />
          <span className={cn(
            "text-xs mt-1 font-medium",
            selected === type ? "text-primary" : "text-muted-foreground"
          )}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
