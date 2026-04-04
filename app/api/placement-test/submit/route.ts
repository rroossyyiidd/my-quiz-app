import { NextRequest } from "next/server";
import type { TQuizSubmission, TQuizResult } from "@/api/quiz/type";
import { getResultsStore } from "../_store";

export async function POST(request: NextRequest) {
  try {
    const submission: TQuizSubmission = await request.json();
    const store = getResultsStore();

    const taskId = crypto.randomUUID();
    const correctAnswers = submission.answers.filter((a) => a.isCorrect).length;
    const totalQuestions = submission.answers.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const result: TQuizResult = {
      taskId,
      userId: submission.userId,
      score: correctAnswers * 20,
      totalQuestions,
      correctAnswers,
      percentage,
      passed: percentage >= 60,
      answers: submission.answers,
      completedAt: submission.completedAt,
      status: "processing",
    };

    store.set(taskId, result);

    // Simulate async processing — mark as completed after 3s
    setTimeout(() => {
      const stored = store.get(taskId);
      if (stored) {
        stored.status = "completed";
        store.set(taskId, stored);
      }
    }, 3000);

    return Response.json({
      success: true,
      data: { taskId, status: "processing" },
    });
  } catch {
    return Response.json(
      { success: false, message: "Failed to process submission" },
      { status: 500 }
    );
  }
}
