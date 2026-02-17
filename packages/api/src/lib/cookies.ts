const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export const parseCookies = (cookieHeader: string | null): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(";")
    .map((entry) => entry.trim().split("="))
    .reduce<Record<string, string>>((acc, [key, value]) => {
      if (key) {
        acc[key] = decodeURIComponent(value ?? "");
      }
      return acc;
    }, {});
};

export const createSessionCookie = (name: string, value: string): string => {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_WEEK_SECONDS}; Secure`;
};

export const clearSessionCookie = (name: string): string => {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;
};
