import { useMutation } from "@tanstack/react-query";
import { submitQuizResult } from "@/api/quiz";
import type { TQuizSubmission } from "@/api/quiz/type";

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: (submission: TQuizSubmission) => submitQuizResult(submission),
  });
}
