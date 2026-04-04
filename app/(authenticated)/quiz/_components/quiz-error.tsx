"use client";

import { ErrorDisplay } from "@/app/_components/error-display";
import { Card } from "@/app/_components/card";

interface QuizErrorProps {
  message: string;
  onRetry: () => void;
}

export function QuizError({ message, onRetry }: QuizErrorProps) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <Card className="p-8 max-w-md w-full">
        <ErrorDisplay
          title="Quiz Error"
          message={message}
          onRetry={onRetry}
        />
      </Card>
    </div>
  );
}
