import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // DB 연동 전까지 임시 주석 처리
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@test.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // MOCK USER FOR MVP TESTING (DB 연결 전)
        if (credentials.email === "admin@test.com" && credentials.password === "1234") {
          return { id: "1", name: "관리자", email: "admin@test.com", role: "ADMIN" }
        }
        if (credentials.email === "student@test.com" && credentials.password === "1234") {
          return { id: "2", name: "김학생", email: "student@test.com", role: "STUDENT" }
        }
        
        /* 
        // 실제 DB 연동 시 주석 해제
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (user && credentials.password === "1234") {
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        }
        */
        
        return null
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  secret: "super-secret-key-for-mvp-testing", // 로컬 테스트용 명시적 secret 추가
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
}
