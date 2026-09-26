import mongoose, { ClientSession } from "mongoose";
import { config } from "./config";

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
