export interface Env {
  DB: D1Database;
  RECIPE_ASSETS: R2Bucket;
  RESEND_API_KEY?: string;
  APP_URL?: string;
}

export type AppBindings = {
  Bindings: Env;
};

export const SESSION_COOKIE = "cookabl_session";
