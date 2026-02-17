import { PropsWithChildren } from "react";

export const Card = ({ children }: PropsWithChildren) => {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 md:p-5">
      {children}
    </div>
  );
};
