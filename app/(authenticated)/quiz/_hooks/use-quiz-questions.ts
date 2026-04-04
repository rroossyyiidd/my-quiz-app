import { useQuery } from "@tanstack/react-query";
import { fetchQuizQuestions } from "@/api/quiz";

export function useQuizQuestions(enabled: boolean = false) {
  return useQuery({
    queryKey: ["quiz-questions"],
    queryFn: fetchQuizQuestions,
    enabled,
    retry: 2,
    staleTime: 0,
    gcTime: 0,
  });
}
