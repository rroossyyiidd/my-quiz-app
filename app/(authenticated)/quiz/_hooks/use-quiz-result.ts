import { useQuery } from "@tanstack/react-query";
import { getQuizResult } from "@/api/quiz";

export function useQuizResult(taskId: string | null) {
  return useQuery({
    queryKey: ["quiz-result", taskId],
    queryFn: () => getQuizResult(taskId!),
    enabled: !!taskId,
    refetchInterval: (query) => {
      // Poll every 1s while still processing
      const data = query.state.data;
      if (data && data.status === "completed") {
        return false;
      }
      return 1000;
    },
    retry: 3,
  });
}
