import { Link } from "react-router-dom";
import { PropsWithChildren } from "react";

interface AuthPanelProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  footerText?: string;
  footerLinkText?: string;
  footerHref?: string;
}

export const AuthPanel = ({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerHref,
}: AuthPanelProps) => {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <div className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <h1 className="mb-1 text-2xl font-semibold">{title}</h1>
        <p className="mb-6 text-sm text-[var(--muted)]" role="doc-subtitle">
          {subtitle}
        </p>
        {children}
        {footerText && footerLinkText && footerHref && (
          <p className="mt-5 text-sm text-[var(--muted)]">
            {footerText}{" "}
            <Link className="underline" to={footerHref}>
              {footerLinkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
