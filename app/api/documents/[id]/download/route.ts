import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export const GET = auth(async (req, { params }) => {
    if (!req.auth) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { id } = (await params) as { id: string }

    const document = await prisma.document.findUnique({
        where: {
            id: id,
        },
    })

    if (!document) {
        return NextResponse.json({ message: "Document not found" }, { status: 404 })
    }

    if (document.userId !== req.auth.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    try {
        const filePath = path.join(process.cwd(), "uploads", document.filePath)
        const fileBuffer = await readFile(filePath)

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Disposition": `attachment; filename="${document.fileName}"`,
                "Content-Type": "application/pdf",
            },
        })
    } catch (error) {
        console.error("Error reading file", error)
        return NextResponse.json({ message: "File not found on server" }, { status: 404 })
    }
})
