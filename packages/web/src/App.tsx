import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

const LoginPage = lazy(() => import("./pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const AcceptInvitationPage = lazy(() => import("./pages/auth/AcceptInvitationPage").then((m) => ({ default: m.AcceptInvitationPage })));
const RecipesPage = lazy(() => import("./pages/recipes/RecipesPage").then((m) => ({ default: m.RecipesPage })));
const GroupsPage = lazy(() => import("./pages/groups/GroupsPage").then((m) => ({ default: m.GroupsPage })));
const SharedRecipePage = lazy(() => import("./pages/shared/SharedRecipePage").then((m) => ({ default: m.SharedRecipePage })));

const PageFallback = () => (
  <output aria-live="polite" className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--muted)]">
    Loading…
  </output>
);

export const App = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/accept-invitation" element={<AcceptInvitationPage />} />
        <Route path="/shared/:token" element={<SharedRecipePage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/recipes" replace />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="groups" element={<GroupsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/recipes" replace />} />
      </Routes>
    </Suspense>
  );
};
