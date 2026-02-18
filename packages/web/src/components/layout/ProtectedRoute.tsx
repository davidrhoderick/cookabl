import { Navigate } from "react-router-dom";
import { PropsWithChildren } from "react";
import { useAuth } from "../../hooks/useAuth";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <output
        aria-live="polite"
        className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]"
      >
        Loading…
      </output>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
