// src/db/db.ts
import { createClient } from "@libsql/client";
import "dotenv/config"; // 這行非常重要，它會載入 .env 檔案

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "", // 如果沒讀到，給個空字串避免直接報錯
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

export default client;