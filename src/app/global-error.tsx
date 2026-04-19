"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-black text-danger/20">500</h1>
        </div>
        
        <h2 className="text-2xl font-bold text-primary-strong mb-4">
          Something went wrong
        </h2>
        
        <p className="text-text-soft mb-8">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        
        {error.digest && (
          <p className="text-xs text-text-soft mb-4">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="rounded-2xl border border-border bg-surface px-5 py-3 font-semibold text-primary-strong hover:bg-surface-muted"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}