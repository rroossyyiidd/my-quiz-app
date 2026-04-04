"use client";

import { LoadingSpinner } from "@/app/_components/loading-spinner";

export function QuizLoading() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 mb-2">
          <svg
            className="w-10 h-10 text-cyan-400 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
            />
          </svg>
        </div>
        <LoadingSpinner size="lg" />
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            Preparing Your Quiz
          </h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Fetching questions from the question bank. This will only take a moment...
          </p>
        </div>
      </div>
    </div>
  );
}
