import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      authorization: { params: { scope: 'openid profile email User.Read' } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) token.accessToken = account.access_token;
      // TODO: mapear grupos/roles vindos do Entra ID ou do backend.
      token.roles = token.roles ?? ['USER'];
      return token;
    },
    async session({ session, token }) {
      session.user.roles = (token.roles as string[]) ?? ['USER'];
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
});
