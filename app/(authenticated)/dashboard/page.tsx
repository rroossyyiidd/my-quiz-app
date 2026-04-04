"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/libs/auth-context";
import { Button } from "@/app/_components/button";
import { Card } from "@/app/_components/card";
import type { TQuizHistoryItem } from "@/api/quiz/type";
import { useEffect, useState } from "react";

const QUIZ_HISTORY_KEY = "quiz_app_history";

function getQuizHistory(userId: string): TQuizHistoryItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`${QUIZ_HISTORY_KEY}_${userId}`);
  return data ? JSON.parse(data) : [];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<TQuizHistoryItem[]>([]);

  useEffect(() => {
    if (user) {
      setHistory(getQuizHistory(user.id));
    }
  }, [user]);

  const bestScore =
    history.length > 0
      ? Math.max(...history.map((h) => h.percentage))
      : null;

  const totalTaken = history.length;
  const totalPassed = history.filter((h) => h.passed).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          Welcome back,{" "}
          <span className="text-gradient">{user?.name}</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Ready to test your Computer Science knowledge?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 sm:mb-12">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-400">Tests Taken</p>
              <p className="text-2xl font-bold text-white">{totalTaken}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-400">Tests Passed</p>
              <p className="text-2xl font-bold text-white">{totalPassed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.996.178-1.768.65-2.08 1.275m0 0l7.688 4.259c.782.434 1.674.434 2.456 0L21 5.511m-15.83 0c.065-.14.163-.27.294-.382a3.01 3.01 0 011.906-.65h9.26c.712 0 1.378.243 1.906.65.131.112.23.241.294.382" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-400">Best Score</p>
              <p className="text-2xl font-bold text-white">
                {bestScore !== null ? `${bestScore}%` : "—"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Start Quiz CTA */}
      <Card className="p-6 sm:p-8 mb-8 sm:mb-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Computer Science Placement Test
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg">
              5 multiple-choice questions • Science: Computers • 60 seconds per question
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20">
                Multiple Choice
              </span>
              <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium border border-violet-500/20">
                5 Questions
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                60s Timer
              </span>
            </div>
          </div>
          <Button
            onClick={() => router.push("/quiz")}
            size="lg"
            className="w-full sm:w-auto flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Start Quiz
          </Button>
        </div>
      </Card>

      {/* Quiz History */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Quiz History</h2>
        {history.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">
              No quiz history yet. Take your first test!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {history
              .slice()
              .reverse()
              .map((item, index) => (
                <Card
                  key={item.taskId}
                  hover
                  className="p-4 sm:p-5 animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          item.passed
                            ? "bg-emerald-500/10"
                            : "bg-red-500/10"
                        }`}
                      >
                        {item.passed ? (
                          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm sm:text-base">
                          Placement Test
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(item.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Score</p>
                        <p
                          className={`text-lg font-bold ${
                            item.passed ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {item.percentage}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Result</p>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            item.passed
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {item.passed ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
