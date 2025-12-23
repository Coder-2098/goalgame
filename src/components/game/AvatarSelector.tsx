import { cn } from "@/lib/utils";
import { AVATARS, AVATAR_CONFIGS, AvatarType } from "@/config/game";

interface AvatarSelectorProps {
  selected: AvatarType;
  onChange: (avatar: AvatarType) => void;
}

const avatarOptions: { type: AvatarType; label: string }[] = Object.values(AVATAR_CONFIGS).map(config => ({
  type: config.id,
  label: config.name,
}));

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
            src={AVATARS[type]}
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
