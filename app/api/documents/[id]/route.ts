import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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
            select: {
                id: true,
                fileName: true,
                signerName: true,
                letterNumber: true,
                subject: true,
                signedAt: true,
                // Do not expose userId or filePath
            }
        })

        if (!document) {
            return NextResponse.json({ message: "Document not found" }, { status: 404 })
        }

        return NextResponse.json(document)
    } catch (error) {
        console.error("Error fetching document", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
