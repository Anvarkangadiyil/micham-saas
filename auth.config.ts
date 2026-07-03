import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
      const isPublicRoute =
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname.startsWith("/invoices/shared/") ||
        nextUrl.pathname === "/favicon.ico" ||
        nextUrl.pathname.endsWith(".jpg") ||
        nextUrl.pathname.endsWith(".png") ||
        nextUrl.pathname.endsWith(".svg") ||
        nextUrl.pathname.endsWith(".ico");

      if (isPublicRoute) {
        return true;
      }

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Empty array, will be populated in auth.ts
};
