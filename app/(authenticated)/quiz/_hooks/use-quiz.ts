"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QuizStatus } from "@/common/enums/quiz";
import type { TQuizAnswer, TQuizQuestion } from "@/api/quiz/type";
import { useQuizQuestions } from "./use-quiz-questions";
import { useSubmitQuiz } from "./use-submit-quiz";
import { useQuizResult } from "./use-quiz-result";
import { useAuth } from "@/libs/auth-context";

const TIMER_SECONDS = 60;
const QUIZ_HISTORY_KEY = process.env.NEXT_PUBLIC_QUIZ_HISTORY_KEY || "quiz_app_history";

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

  // Start the quiz
  const startQuiz = useCallback(() => {
    setStatus(QuizStatus.LOADING);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTaskId(null);
    setError(null);
  }, []);

  // Handle questions fetched
  useEffect(() => {
    if (questionsQuery.data && status === QuizStatus.LOADING) {
      setStatus(QuizStatus.IN_PROGRESS);
      setTimeLeft(TIMER_SECONDS);
      questionStartTimeRef.current = Date.now();
    }
    if (questionsQuery.error && status === QuizStatus.LOADING) {
      setError(questionsQuery.error.message);
      setStatus(QuizStatus.ERROR);
    }
  }, [questionsQuery.data, questionsQuery.error, status]);

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
        // Next question
        setCurrentQuestionIndex((prev) => prev + 1);
        setTimeLeft(TIMER_SECONDS);
        questionStartTimeRef.current = Date.now();
      } else {
        // All done — submit
        submitAnswers(newAnswers);
      }
    },
    [answers, currentQuestionIndex, questionsQuery.data, submitAnswers]
  );

  // Handle result polling completion
  useEffect(() => {
    if (resultQuery.data?.status === "completed") {
      setStatus(QuizStatus.COMPLETED);

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
    setStatus(QuizStatus.IDLE);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTaskId(null);
    setError(null);
    setTimeLeft(TIMER_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
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
