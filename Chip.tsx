"use client";

type ChipVariant = "green" | "blue" | "orange" | "red" | "purple";

const variants: Record<ChipVariant, string> = {
  green:  "bg-accent-soft text-accent-text",
  blue:   "bg-blueish-soft text-blueish",
  orange: "bg-warn-soft text-warn",
  red:    "bg-danger-soft text-danger-text",
  purple: "bg-purpleish-soft text-purpleish",
};

interface ChipProps {
  variant?: ChipVariant;
  children: React.ReactNode;
}

export function Chip({ variant = "green", children }: ChipProps) {
  return (
    <span className={`inline-block text-[11px] rounded-full px-2.5 py-0.5 font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function ReadonlyBanner({ reason }: { reason: string }) {
  return (
    <div className="bg-purpleish-soft border border-[#3A4A8C] rounded-xl px-3.5 py-2.5 mb-3 flex items-center gap-2">
      <span className="text-purpleish text-base">🔒</span>
      <span className="text-[12px] text-purpleish font-semibold">
        Gerenciado pelo seu {reason}.
      </span>
    </div>
  );
}
