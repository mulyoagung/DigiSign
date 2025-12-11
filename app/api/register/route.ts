import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        })

        if (existingUser) {
            return NextResponse.json({ message: "Email already registered" }, { status: 409 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })

        return NextResponse.json({ message: "User created successfully", userId: user.id }, { status: 201 })
    } catch (error) {
        console.error("Registration error", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
