import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account, profile }) {
      // When user signs in, attach email to token
      if (account && profile) {
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass email from token into session
      if (token?.email) {
        session.user = {
          ...session.user,
          email: token.email as string,
        };
      }
      return session;
    },
  },
});
