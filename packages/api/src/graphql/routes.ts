import { ApolloServer, HeaderMap } from "@apollo/server";
import { Hono } from "hono";
import { AppBindings } from "../env";
import { createContext } from "./context";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

const graphQLRouter = new Hono<AppBindings>();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

graphQLRouter.post("/", async (c) => {
  const headers = new HeaderMap();
  c.req.raw.headers.forEach((value, key) => {
    headers.set(key, value);
  });

  const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      method: "POST",
      headers,
      body: await c.req.json(),
      search: new URL(c.req.url).search,
    },
    context: () => createContext(c.env, c.req.raw),
  });

  for (const [key, value] of httpGraphQLResponse.headers) {
    c.header(key, value);
  }

  c.status((httpGraphQLResponse.status || 200) as 200);

  if (httpGraphQLResponse.body.kind === "complete") {
    return c.body(httpGraphQLResponse.body.string);
  }

  const chunks: string[] = [];
  for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
    chunks.push(chunk);
  }
  return c.body(chunks.join(""));
});

export { graphQLRouter };
