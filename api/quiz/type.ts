export type TOpenTDBQuestion = {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

export type TOpenTDBResponse = {
  response_code: number;
  results: TOpenTDBQuestion[];
};

export type TQuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: string;
};

export type TQuizAnswer = {
  questionId: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
};

export type TQuizSubmission = {
  userId: string;
  answers: TQuizAnswer[];
  totalTime: number;
  completedAt: string;
};

export type TQuizResult = {
  taskId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
  answers: TQuizAnswer[];
  completedAt: string;
  status: "processing" | "completed";
};

export type TQuizSubmitResponse = {
  taskId: string;
  status: "processing";
};

export type TQuizHistoryItem = {
  taskId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
};
