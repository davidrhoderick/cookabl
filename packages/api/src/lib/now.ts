export const nowIso = (): string => new Date().toISOString();

export const plusDaysIso = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};
