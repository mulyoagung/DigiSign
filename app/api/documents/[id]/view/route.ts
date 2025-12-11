import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const document = await prisma.document.findUnique({
            where: {
                id: id,
            },
        })

        if (!document) {
            return NextResponse.json({ message: "Document not found" }, { status: 404 })
        }

        const filePath = path.join(process.cwd(), "uploads", document.filePath)

        try {
            const fileBuffer = await readFile(filePath)

            return new NextResponse(fileBuffer, {
                headers: {
                    "Content-Disposition": `inline; filename="${document.fileName}"`,
                    "Content-Type": "application/pdf",
                },
            })
        } catch (error) {
            console.error("Error reading file", error)
            return NextResponse.json({ message: "File not found on server" }, { status: 404 })
        }
    } catch (error) {
        console.error("Error fetching document", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
