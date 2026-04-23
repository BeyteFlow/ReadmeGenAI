import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const GITHUB_CLIENT_ID = requireEnv("GITHUB_CLIENT_ID");
const GITHUB_CLIENT_SECRET = requireEnv("GITHUB_CLIENT_SECRET");

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHubProvider({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      authorization: {
        params: { scope: "repo read:user" },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session }) {
      return session;
    },
  },
};
