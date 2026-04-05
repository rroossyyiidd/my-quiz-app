import type {
  TOpenTDBResponse,
  TQuizQuestion,
  TQuizSubmission,
  TQuizSubmitResponse,
  TQuizResult,
} from "./type";

function decodeHtml(html: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function fetchQuizQuestions(): Promise<TQuizQuestion[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch quiz questions");
  }

  const data: TOpenTDBResponse = await response.json();

  if (data.response_code !== 0) {
    throw new Error("No questions available. Please try again later.");
  }

  return data.results.map((q, index) => ({
    id: index,
    question: decodeHtml(q.question),
    options: shuffleArray([
      ...q.incorrect_answers.map(decodeHtml),
      decodeHtml(q.correct_answer),
    ]),
    correctAnswer: decodeHtml(q.correct_answer),
    category: q.category,
    difficulty: q.difficulty,
  }));
}

export async function submitQuizResult(
  submission: TQuizSubmission
): Promise<TQuizSubmitResponse> {
  const response = await fetch("/api/placement-test/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    throw new Error("Failed to submit quiz results");
  }

  const json = await response.json();
  return json.data;
}

export async function getQuizResult(taskId: string): Promise<TQuizResult> {
  const response = await fetch(`/api/placement-test/result/${taskId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch quiz results");
  }

  const data = await response.json();
  return data.data;
}
