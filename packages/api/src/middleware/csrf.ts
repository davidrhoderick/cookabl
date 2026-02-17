import { HttpError } from "../lib/http-error";

export const assertCsrf = (request: Request, appUrl?: string): void => {
  if (!appUrl) {
    return;
  }

  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    throw new HttpError(403, "Missing origin header");
  }

  if (!origin.startsWith(appUrl)) {
    throw new HttpError(403, "Invalid origin");
  }
};
