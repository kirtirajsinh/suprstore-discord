import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

// Declare global variable for prisma

let PrismaVar;
if (process.env.NODE_ENV === "production") {
  PrismaVar = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  PrismaVar = global.cachedPrisma;
}

export const prisma = PrismaVar;
