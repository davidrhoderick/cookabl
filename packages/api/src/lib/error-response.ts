import { HttpError } from "./http-error";

export interface ErrorPayload {
  error: string;
}

export const toErrorResponse = (error: unknown): { status: number; payload: ErrorPayload } => {
  if (error instanceof HttpError) {
    return {
      status: error.status,
      payload: { error: error.message },
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      payload: { error: error.message || "Internal server error" },
    };
  }

  return {
    status: 500,
    payload: { error: "Internal server error" },
  };
};
