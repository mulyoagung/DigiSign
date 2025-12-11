import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export const GET = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const documents = await prisma.document.findMany({
        where: {
            userId: req.auth.user?.id,
        },
        orderBy: {
            signedAt: 'desc',
        },
    })

    return NextResponse.json(documents)
})

export const POST = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        const fileName = formData.get("fileName") as string
        const signerName = formData.get("signerName") as string
        const letterNumber = formData.get("letterNumber") as string
        const subject = formData.get("subject") as string

        const id = formData.get("id") as string

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), "uploads")
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // Ignore if exists
        }

        // Create unique filename
        const uniqueFileName = `${Date.now()}-${fileName}`
        const filePath = path.join(uploadDir, uniqueFileName)

        await writeFile(filePath, buffer)

        const document = await prisma.document.create({
            data: {
                id: id || undefined, // Use provided ID if available, otherwise let Prisma generate (though we expect it from client)
                userId: req.auth.user?.id as string,
                fileName: fileName,
                filePath: uniqueFileName, // Store relative path or filename
                signerName: signerName,
                letterNumber: letterNumber || null,
                subject: subject || null,
            },
        })

        return NextResponse.json(document)
    } catch (error) {
        console.error("Error saving document", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
})
