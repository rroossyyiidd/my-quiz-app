"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/button";
import { Card } from "@/app/_components/card";
import type { TQuizResult } from "@/api/quiz/type";

interface QuizResultProps {
  result: TQuizResult;
  onRestart: () => void;
}

export function QuizResult({ result, onRestart }: QuizResultProps) {
  const router = useRouter();

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-emerald-400";
    if (percentage >= 60) return "text-cyan-400";
    if (percentage >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBg = (percentage: number) => {
    if (percentage >= 80)
      return "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20";
    if (percentage >= 60)
      return "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20";
    if (percentage >= 40)
      return "from-amber-500/20 to-amber-500/5 border-amber-500/20";
    return "from-red-500/20 to-red-500/5 border-red-500/20";
  };

  const getScoreRingColor = (percentage: number) => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 60) return "#06b6d4";
    if (percentage >= 40) return "#f59e0b";
    return "#ef4444";
  };

  // SVG circle math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (result.percentage / 100) * circumference;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-start px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
      <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
        {/* Score Card */}
        <Card
          className={`p-6 sm:p-8 bg-gradient-to-b ${getScoreBg(
            result.percentage
          )}`}
        >
          <div className="text-center">
            {/* Score Ring */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={getScoreRingColor(result.percentage)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-3xl sm:text-4xl font-bold ${getScoreColor(
                    result.percentage
                  )}`}
                >
                  {result.percentage}%
                </span>
                <span className="text-xs text-slate-400">Score</span>
              </div>
            </div>

            {/* Pass/Fail badge */}
            <div className="mb-4">
              {result.passed ? (
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  PASSED
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-semibold">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  FAILED
                </span>
              )}
            </div>

            <p className="text-slate-400 text-sm">
              You got{" "}
              <span className="text-white font-semibold">
                {result.correctAnswers}
              </span>{" "}
              out of{" "}
              <span className="text-white font-semibold">
                {result.totalQuestions}
              </span>{" "}
              questions correct
            </p>
          </div>
        </Card>

        {/* Answer Breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Answer Breakdown
          </h3>
          <div className="space-y-3">
            {result.answers.map((answer, index) => (
              <Card
                key={index}
                className={`p-4 sm:p-5 border ${
                  answer.isCorrect
                    ? "border-emerald-500/20"
                    : "border-red-500/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      answer.isCorrect
                        ? "bg-emerald-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    {answer.isCorrect ? (
                      <svg
                        className="w-4 h-4 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-2">
                      Question {index + 1}
                    </p>
                    {!answer.isCorrect && (
                      <div className="space-y-1 text-xs">
                        <p className="text-red-400">
                          <span className="text-slate-500">Your answer:</span>{" "}
                          {answer.selectedAnswer || "(No answer — time expired)"}
                        </p>
                        <p className="text-emerald-400">
                          <span className="text-slate-500">Correct answer:</span>{" "}
                          {answer.correctAnswer}
                        </p>
                      </div>
                    )}
                    {answer.isCorrect && (
                      <p className="text-xs text-emerald-400">
                        <span className="text-slate-500">Answer:</span>{" "}
                        {answer.correctAnswer}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Time: {answer.timeSpent}s
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <Button onClick={onRestart} variant="primary" className="flex-1">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
            Take Again
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="secondary"
            className="flex-1"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
