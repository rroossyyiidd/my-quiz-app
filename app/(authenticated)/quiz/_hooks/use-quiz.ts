"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QuizStatus } from "@/common/enums/quiz";
import type { TQuizAnswer, TQuizQuestion } from "@/api/quiz/type";
import { useQuizQuestions } from "./use-quiz-questions";
import { useSubmitQuiz } from "./use-submit-quiz";
import { useQuizResult } from "./use-quiz-result";
import { useAuth } from "@/libs/auth-context";

const TIMER_SECONDS = 300;
const QUIZ_HISTORY_KEY = process.env.NEXT_PUBLIC_QUIZ_HISTORY_KEY || "quiz_app_history";
const QUIZ_PROGRESS_KEY = "quiz_app_progress";

interface QuizProgress {
  currentQuestionIndex: number;
  answers: TQuizAnswer[];
  timeLeft: number;
  savedAt: number;
}

function saveProgress(currentQuestionIndex: number, answers: TQuizAnswer[], timeLeft: number) {
  if (typeof window === "undefined") return;
  const progress: QuizProgress = {
    currentQuestionIndex,
    answers,
    timeLeft,
    savedAt: Date.now(),
  };
  localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
}

function loadProgress(): QuizProgress | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(QUIZ_PROGRESS_KEY);
  if (!saved) return null;
  try {
    const progress: QuizProgress = JSON.parse(saved);
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - progress.savedAt > maxAge) {
      localStorage.removeItem(QUIZ_PROGRESS_KEY);
      return null;
    }
    return progress;
  } catch {
    return null;
  }
}

function clearProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUIZ_PROGRESS_KEY);
}

export function useQuiz() {
  const { user } = useAuth();
  const [status, setStatus] = useState<QuizStatus>(QuizStatus.IDLE);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TQuizAnswer[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch questions
  const questionsQuery = useQuizQuestions(status === QuizStatus.LOADING);

  // Submit mutation
  const submitMutation = useSubmitQuiz();

  // Result polling
  const resultQuery = useQuizResult(taskId);

  // Load saved progress on mount
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

  useEffect(() => {
    const progress = loadProgress();
    if (progress && user) {
      setCurrentQuestionIndex(progress.currentQuestionIndex);
      setAnswers(progress.answers);
      setTimeLeft(progress.timeLeft);
      setStatus(QuizStatus.LOADING);
      setHasRestoredProgress(true);
    }
  }, [user]);

  // Save progress when it changes
  useEffect(() => {
    if (status === QuizStatus.IN_PROGRESS && answers.length > 0) {
      saveProgress(currentQuestionIndex, answers, timeLeft);
    }
  }, [status, currentQuestionIndex, answers, timeLeft]);

  // Handle questions fetched
  useEffect(() => {
    if (questionsQuery.data && status === QuizStatus.LOADING) {
      setStatus(QuizStatus.IN_PROGRESS);
      if (!hasRestoredProgress) {
        setTimeLeft(TIMER_SECONDS);
      }
      questionStartTimeRef.current = Date.now();
    }
    if (questionsQuery.error && status === QuizStatus.LOADING) {
      setError(questionsQuery.error.message);
      setStatus(QuizStatus.ERROR);
    }
  }, [questionsQuery.data, questionsQuery.error, status, hasRestoredProgress]);

  // Timer logic
  useEffect(() => {
    if (status === QuizStatus.IN_PROGRESS) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up — auto-submit current question as unanswered
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [status, currentQuestionIndex]);

  // Submit answers after all questions answered
  const submitAnswers = useCallback(
    (allAnswers: TQuizAnswer[]) => {
      if (!user) return;

      setStatus(QuizStatus.PROCESSING);

      const totalTime = allAnswers.reduce((sum, a) => sum + a.timeSpent, 0);

      submitMutation.mutate(
        {
          userId: user.id,
          answers: allAnswers,
          totalTime,
          completedAt: new Date().toISOString(),
        },
        {
          onSuccess: (data) => {
            setTaskId(data.taskId);
          },
          onError: (err) => {
            setError(err.message);
            setStatus(QuizStatus.ERROR);
          },
        }
      );
    },
    [user, submitMutation]
  );

  // Handle answer selection
  const handleAnswer = useCallback(
    (selectedAnswer: string, question: TQuizQuestion) => {
      if (timerRef.current) clearInterval(timerRef.current);

      const timeSpent = Math.round(
        (Date.now() - questionStartTimeRef.current) / 1000
      );

      const answer: TQuizAnswer = {
        questionId: question.id,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: selectedAnswer === question.correctAnswer,
        timeSpent,
      };

      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);

      if (
        questionsQuery.data &&
        currentQuestionIndex < questionsQuery.data.length - 1
      ) {
        setCurrentQuestionIndex((prev) => prev + 1);
        questionStartTimeRef.current = Date.now();
      } else {
        submitAnswers(newAnswers);
      }
    },
    [answers, currentQuestionIndex, questionsQuery.data, submitAnswers]
  );

  // Handle time expiry
  useEffect(() => {
    if (timeLeft === 0 && status === QuizStatus.IN_PROGRESS && questionsQuery.data) {
      const question = questionsQuery.data[currentQuestionIndex];
      if (question) {
        handleAnswer("", question);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Handle result polling completion
  useEffect(() => {
    if (resultQuery.data?.status === "completed") {
      setStatus(QuizStatus.COMPLETED);
      clearProgress();

      // Save to history
      if (user && resultQuery.data) {
        const historyKey = `${QUIZ_HISTORY_KEY}_${user.id}`;
        const existing = JSON.parse(
          localStorage.getItem(historyKey) || "[]"
        );
        const historyItem = {
          taskId: resultQuery.data.taskId,
          score: resultQuery.data.score,
          totalQuestions: resultQuery.data.totalQuestions,
          percentage: resultQuery.data.percentage,
          passed: resultQuery.data.passed,
          completedAt: resultQuery.data.completedAt,
        };
        localStorage.setItem(
          historyKey,
          JSON.stringify([...existing, historyItem])
        );
      }
    }
  }, [resultQuery.data, user]);

  // Restart quiz
  const restart = useCallback(() => {
    clearProgress();
    setStatus(QuizStatus.IDLE);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTaskId(null);
    setError(null);
    setTimeLeft(TIMER_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Start quiz
  const startQuiz = useCallback(() => {
    clearProgress();
    setStatus(QuizStatus.LOADING);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTaskId(null);
    setError(null);
    setHasRestoredProgress(false);
  }, []);

  return {
    status,
    currentQuestionIndex,
    questions: questionsQuery.data ?? [],
    currentQuestion: questionsQuery.data?.[currentQuestionIndex] ?? null,
    answers,
    timeLeft,
    error,
    result: resultQuery.data ?? null,
    isLoadingQuestions: questionsQuery.isLoading,
    isSubmitting: submitMutation.isPending,
    startQuiz,
    handleAnswer,
    restart,
    totalQuestions: questionsQuery.data?.length ?? 5,
  };
}
