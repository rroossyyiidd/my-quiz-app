"use client";

import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", hover = false, style }: CardProps) {
  return (
    <div
      style={style}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-xl
        border border-white/10
        ${hover ? "transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
