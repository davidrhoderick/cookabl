import { cors } from "hono/cors";
import { Hono } from "hono";
import { authRouter } from "./auth/routes";
import { AppBindings } from "./env";
import { graphQLRouter } from "./graphql/routes";

const app = new Hono<AppBindings>();

app.use("*", cors());

app.get("/", (c) => {
  return c.json({
    name: "cookabl-api",
    status: "ok",
  });
});

app.route("/auth", authRouter);
app.route("/graphql", graphQLRouter);

app.onError((error, c) => {
  console.error("Unhandled error", error);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
