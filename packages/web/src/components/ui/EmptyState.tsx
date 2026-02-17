interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-center">
      <p className="mb-1 font-medium">{title}</p>
      <p className="text-sm text-[var(--muted)]">{description}</p>
    </div>
  );
};
