"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/libs/auth-context";
import { LoadingSpinner } from "./_components/loading-spinner";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-dvh">
      <LoadingSpinner message="Loading..." size="lg" />
    </div>
  );
}
