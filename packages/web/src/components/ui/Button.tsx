import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "solid" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  variant?: ButtonVariant;
}

export const Button = ({ children, className = "", variant = "solid", ...props }: ButtonProps) => {
  const variantClasses =
    variant === "solid"
      ? "bg-[var(--accent)] text-[var(--bg)]"
      : "border border-[var(--line)] text-[var(--text)]";

  return (
    <button
      className={`rounded-xl px-3 py-2 text-sm font-medium transition hover:opacity-90 ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
