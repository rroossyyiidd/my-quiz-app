import type { TQuizResult } from "@/api/quiz/type";

// Use globalThis to persist across module reloads in dev (Turbopack HMR)
const globalStore = globalThis as unknown as {
  __quizResultsStore?: Map<string, TQuizResult>;
};

if (!globalStore.__quizResultsStore) {
  globalStore.__quizResultsStore = new Map<string, TQuizResult>();
}

export function getResultsStore(): Map<string, TQuizResult> {
  return globalStore.__quizResultsStore!;
}

export function setResult(taskId: string, result: TQuizResult) {
  globalStore.__quizResultsStore!.set(taskId, result);
}
