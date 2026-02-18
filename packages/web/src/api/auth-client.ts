import { AuthUser } from "../types";

interface AuthResponse {
  user: AuthUser;
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  const payload = await response.json().catch(() => undefined);
  if (!response.ok) {
    const message = payload && typeof payload.error === "string" ? payload.error : "Request failed";
    throw new Error(message);
  }

  return payload as T;
};

export const authClient = {
  me: (): Promise<AuthResponse> => request<AuthResponse>("/auth/me"),
  register: (input: { email: string; password: string; name: string }): Promise<AuthResponse> =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  login: (input: { email: string; password: string }): Promise<AuthResponse> =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  logout: (): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>("/auth/logout", {
      method: "POST",
    }),
  refresh: (): Promise<AuthResponse> =>
    request<AuthResponse>("/auth/refresh", {
      method: "POST",
    }),
  invite: (input: { email: string; groupId: string }): Promise<{ token: string }> =>
    request<{ token: string }>("/auth/invite", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  acceptInvitation: (input: {
    token: string;
    name: string;
    password: string;
  }): Promise<AuthResponse> =>
    request<AuthResponse>("/auth/accept-invitation", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
