"use client";

import { ReactNode, useState } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-card border border-cardborder rounded-card p-4 mb-3 ${className}`}>
      {children}
    </div>
  );
}

interface CollapsibleCardProps {
  title: string;
  icon?: ReactNode;
  rightSlot?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleCard({ title, icon, rightSlot, children, defaultOpen = true }: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-cardborder rounded-card p-4 mb-3">
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[13px] font-semibold text-muted">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {rightSlot}
          <button
            className="bg-transparent border-none text-[#555] text-base p-0.5 cursor-pointer flex items-center transition-transform"
            style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
            onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          >
            ›
          </button>
        </div>
      </div>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
