import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client lazily to avoid initialization issues
const getPrismaClient = () => {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  return global.prisma;
};

export const auth = betterAuth({
  database: prismaAdapter(getPrismaClient(), {
    provider: "sqlserver",
  }),
  emailAndPassword: {
    enabled: true,
  },
//   socialProviders: {
//     github: {
//       clientId: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     },
//   },
});
