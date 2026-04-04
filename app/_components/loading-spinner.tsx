"use client";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

export function LoadingSpinner({
  message,
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-white/10 border-t-cyan-500 animate-spin`}
        />
        <div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-b-violet-500 animate-spin`}
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        />
      </div>
      {message && (
        <p className="text-slate-400 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
}
