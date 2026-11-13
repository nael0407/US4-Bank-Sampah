import dns from "node:dns";
import mongoose, { ClientSession } from "mongoose";
import { config } from "./config";

// Resolve DNS SRV query issues on Windows / local ISP DNS
dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // ignore in environments with restricted socket permissions
}

export async function connectDatabase() {
  await mongoose.connect(config.MONGODB_URI);
  console.log("Terhubung ke MongoDB");
}

export async function withTransaction<T>(work: (session: ClientSession) => Promise<T>) {
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}
