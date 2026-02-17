import { Env } from "../env";
import { HttpError } from "../lib/http-error";

type QueryValue = string | number | null;

export const queryAll = async <T>(
  env: Env,
  sql: string,
  params: QueryValue[] = [],
): Promise<T[]> => {
  try {
    const result = await env.DB.prepare(sql)
      .bind(...params)
      .all<T>();
    return result.results ?? [];
  } catch (error) {
    console.error("DB queryAll failed", { sql, error });
    throw new HttpError(500, "Database query failed");
  }
};

export const queryOne = async <T>(
  env: Env,
  sql: string,
  params: QueryValue[] = [],
): Promise<T | null> => {
  try {
    const result = await env.DB.prepare(sql)
      .bind(...params)
      .first<T>();
    return result;
  } catch (error) {
    console.error("DB queryOne failed", { sql, error });
    throw new HttpError(500, "Database query failed");
  }
};

export const execute = async (
  env: Env,
  sql: string,
  params: QueryValue[] = [],
): Promise<void> => {
  try {
    await env.DB.prepare(sql)
      .bind(...params)
      .run();
  } catch (error) {
    console.error("DB execute failed", { sql, error });
    throw new HttpError(500, "Database write failed");
  }
};
