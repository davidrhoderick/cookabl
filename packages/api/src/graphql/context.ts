import { AuthUser, getCurrentUser } from "../auth/session";
import { Env } from "../env";

export interface GraphQLContext {
  env: Env;
  request: Request;
  user: AuthUser | null;
}

export const createContext = async (
  env: Env,
  request: Request,
): Promise<GraphQLContext> => {
  const user = await getCurrentUser(env, request);
  return {
    env,
    request,
    user,
  };
};
