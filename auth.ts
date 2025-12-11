import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                console.log("Authorize called with:", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials");
                    return null
                }

                const email = credentials.email as string
                const password = credentials.password as string

                let user = await prisma.user.findUnique({
                    where: { email },
                })

                console.log("User found:", user ? "Yes" : "No");

                if (!user) {
                    console.log("Creating new user (auto-register)");
                    // For demo purposes, create user if not exists on login
                    const hashedPassword = await bcrypt.hash(password, 10)
                    user = await prisma.user.create({
                        data: {
                            email,
                            password: hashedPassword,
                            name: email.split('@')[0],
                        },
                    })
                } else {
                    if (!user.password) {
                        console.log("User has no password (google account?)");
                        // User might have signed in with Google before
                        return null
                    }
                    const isPasswordValid = await bcrypt.compare(password, user.password)
                    console.log("Password valid:", isPasswordValid);
                    if (!isPasswordValid) {
                        return null
                    }
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            return session
        },
    },
})
