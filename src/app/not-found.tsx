import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-black text-primary/20">404</h1>
        </div>
        
        <h2 className="text-2xl font-bold text-primary-strong mb-4">
          Page Not Found
        </h2>
        
        <p className="text-text-soft mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-strong"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border border-border bg-surface px-5 py-3 font-semibold text-primary-strong hover:bg-surface-muted"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}