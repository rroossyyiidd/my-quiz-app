"use client";

import { useState, useEffect } from "react";
import type { TQuizQuestion } from "@/api/quiz/type";
import { ProgressBar } from "@/app/_components/progress-bar";
import { Card } from "@/app/_components/card";

interface QuizRunnerProps {
  question: TQuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  onAnswer: (answer: string, question: TQuizQuestion) => void;
}

export function QuizRunner({
  question,
  questionIndex,
  totalQuestions,
  timeLeft,
  onAnswer,
}: QuizRunnerProps) {
  const key = `${questionIndex}-${question.id}`;
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(() => null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(() => false);
  
  // Reset when question changes - necessary for local UI state management
  useEffect(() => {
    setSelectedAnswer(null);
    setIsTransitioning(false);
  }, [key]);

  const handleSelect = (answer: string) => {
    if (selectedAnswer || isTransitioning) return;
    setSelectedAnswer(answer);
    setIsTransitioning(true);
    // Brief delay for visual feedback
    setTimeout(() => {
      onAnswer(answer, question);
    }, 600);
  };

  const timerPercentage = (timeLeft / 60) * 100;
  const isTimerWarning = timeLeft <= 10;
  const isTimerCritical = timeLeft <= 5;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "hard":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-400 bg-white/5 border-white/10";
    }
  };

  return (
    <div className="flex flex-col bg-mesh h-[calc(100dvh-4rem)]">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getDifficultyColor(
                question.difficulty
              )}`}
            >
              {question.difficulty.charAt(0).toUpperCase() +
                question.difficulty.slice(1)}
            </span>

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                isTimerCritical
                  ? "bg-red-500/20 border border-red-500/30 timer-warning"
                  : isTimerWarning
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-white/5 border border-white/10"
              }`}
            >
              <svg
                className={`w-4 h-4 ${
                  isTimerCritical
                    ? "text-red-400"
                    : isTimerWarning
                      ? "text-amber-400"
                      : "text-slate-400"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                className={`text-sm font-mono font-bold tabular-nums ${
                  isTimerCritical
                    ? "text-red-400"
                    : isTimerWarning
                      ? "text-amber-400"
                      : "text-white"
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Timer bar */}
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-1000 linear ${
                isTimerCritical
                  ? "bg-red-500"
                  : isTimerWarning
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-cyan-500 to-violet-500"
              }`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>

          <ProgressBar
            current={questionIndex + 1}
            total={totalQuestions}
          />
        </div>
      </div>

      {/* Question - fixed, does not scroll */}
      <div className="flex-shrink-0 px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="w-full max-w-3xl mx-auto animate-scale-in" key={questionIndex}>
          <Card className="p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-relaxed">
              {question.question}
            </h2>
          </Card>
        </div>
      </div>

      {/* Options - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 pb-8 sm:pb-12">
        <div className="w-full max-w-3xl mx-auto grid gap-3 sm:gap-4">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const letter = String.fromCharCode(65 + index);

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={!!selectedAnswer}
                className={`
                  w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300
                  flex items-center gap-4 group cursor-pointer
                  ${
                    isSelected
                      ? "bg-cyan-500/20 border-cyan-500/40 scale-[0.98]"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.01]"
                  }
                  ${selectedAnswer && !isSelected ? "opacity-50" : ""}
                  disabled:cursor-default
                `}
                style={{
                  animationDelay: `${index * 0.08}s`,
                }}
              >
                <span
                  className={`
                    w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0
                    transition-all duration-300
                    ${
                      isSelected
                        ? "bg-cyan-500 text-white"
                        : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                    }
                  `}
                >
                  {letter}
                </span>
                <span
                  className={`text-sm sm:text-base ${
                    isSelected ? "text-white font-medium" : "text-slate-300"
                  }`}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
