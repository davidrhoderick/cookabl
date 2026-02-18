import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm transition ${
    isActive
      ? "bg-[var(--accent)] text-[var(--bg)]"
      : "text-[var(--muted)] hover:text-[var(--text)]"
  }`;

export const AppShell = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10 pt-4 md:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
        <Link to="/recipes" className="text-xl font-semibold tracking-tight">
          Cookabl
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-2">
          <NavLink to="/recipes" className={navClass}>
            Recipes
          </NavLink>
          <NavLink to="/groups" className={navClass}>
            Groups
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 text-sm">
          <button
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="rounded-full border border-[var(--line)] px-3 py-1.5"
            onClick={toggleTheme}
            type="button"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
          <span className="text-[var(--muted)]">{user?.name}</span>
          <button
            aria-label="Log out of your account"
            className="rounded-full border border-[var(--line)] px-3 py-1.5"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
