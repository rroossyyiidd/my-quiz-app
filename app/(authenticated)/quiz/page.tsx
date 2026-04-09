"use client";

import { useState, useEffect } from "react";
import { QuizStatus } from "@/common/enums/quiz";
import { useQuiz } from "./_hooks/use-quiz";
import { QuizLoading } from "./_components/quiz-loading";
import { QuizRunner } from "./_components/quiz-runner";
import { QuizProcessing } from "./_components/quiz-processing";
import { QuizResult } from "./_components/quiz-result";
import { QuizError } from "./_components/quiz-error";
import { Button } from "@/app/_components/button";
import { Card } from "@/app/_components/card";
import { useRouter } from "next/navigation";
import type { TQuizAnswer } from "@/api/quiz/type";

const QUIZ_PROGRESS_KEY = "quiz_app_progress";

interface QuizProgress {
  currentQuestionIndex: number;
  answers: TQuizAnswer[];
  timeLeft: number;
  savedAt: number;
}

export default function QuizPage() {
  const router = useRouter();
  const [hasSavedProgress, setHasSavedProgress] = useState<boolean | null>(null);
  const showSavedProgress = hasSavedProgress === true;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(QUIZ_PROGRESS_KEY);
    if (!saved) return;
    try {
      const progress = JSON.parse(saved) as QuizProgress;
      const maxAge = 24 * 60 * 60 * 1000;
      setHasSavedProgress(Date.now() - progress.savedAt <= maxAge);
    } catch {
      // ignore
    }
  }, []);

  const {
    status,
    currentQuestionIndex,
    currentQuestion,
    timeLeft,
    error,
    result,
    startQuiz,
    handleAnswer,
    restart,
    totalQuestions,
  } = useQuiz();

  // IDLE — show start screen
  if (status === QuizStatus.IDLE) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <Card className="p-6 sm:p-10 max-w-lg w-full text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 mb-6">
            <svg
              className="w-10 h-10 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
              />
            </svg>
          </div>
          {showSavedProgress ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Continue Your Quiz?
              </h2>
              <p className="text-slate-400 mb-8 text-sm sm:text-base max-w-sm mx-auto">
                You have an unfinished quiz. Would you like to continue where you left off?
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to Begin?
              </h2>
              <p className="text-slate-400 mb-8 text-sm sm:text-base max-w-sm mx-auto">
                You&apos;ll answer 5 computer science questions. You have 5 minutes for entire quiz.
                The quiz will run in full-screen mode.
              </p>
            </>
          )}

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              <span className="text-xs text-slate-300">5 Questions</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-slate-300">5 minutes total</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
              <span className="text-xs text-slate-300">Computers</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={startQuiz} size="lg" className="flex-1">
              {showSavedProgress ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Continue Quiz
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Start Quiz
                </>
              )}
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="ghost"
              size="lg"
              className="flex-1"
            >
              Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // LOADING
  if (status === QuizStatus.LOADING) {
    return <QuizLoading />;
  }

  // IN_PROGRESS — full-screen quiz
  if (status === QuizStatus.IN_PROGRESS && currentQuestion) {
    return (
      <QuizRunner
        question={currentQuestion}
        questionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        onAnswer={handleAnswer}
      />
    );
  }

  // PROCESSING / SUBMITTED
  if (
    status === QuizStatus.PROCESSING ||
    status === QuizStatus.SUBMITTED
  ) {
    return <QuizProcessing />;
  }

  // COMPLETED
  if (status === QuizStatus.COMPLETED && result) {
    return <QuizResult result={result} onRestart={restart} />;
  }

  // ERROR
  if (status === QuizStatus.ERROR) {
    return (
      <QuizError
        message={error || "An unexpected error occurred"}
        onRetry={restart}
      />
    );
  }

  return null;
}
