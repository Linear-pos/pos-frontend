import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./desktop/src/db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./desktop/src/data/app.db", 
  },
});
