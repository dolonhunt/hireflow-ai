export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-primary-strong">Loading...</p>
        <p className="mt-2 text-sm text-text-soft">Preparing your workspace</p>
      </div>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-3 text-sm text-text-soft">Loading...</p>
      </div>
    </div>
  );
}