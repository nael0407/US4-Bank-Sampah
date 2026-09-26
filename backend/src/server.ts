import { app } from "./app";
import { config } from "./lib/config";
import { connectDatabase } from "./lib/db";

async function start() {
  await connectDatabase();
  app.listen(config.PORT, () => {
    console.log(`Server berjalan di http://localhost:${config.PORT}`);
  });
}

start().catch((error) => {
  console.error("Gagal menjalankan server:", error);
  process.exit(1);
});
