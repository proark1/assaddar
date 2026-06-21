import postgres from "postgres";
import { databaseUrl } from "./config";

let client: ReturnType<typeof postgres> | null = null;

export function getSql() {
  if (!client) {
    const url = databaseUrl();
    if (!url) {
      throw new Error("DATABASE_URL is required when PORTAL_DATA_BACKEND=postgres.");
    }
    client = postgres(url, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      ssl: "require",
    });
  }
  return client;
}
