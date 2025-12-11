'use client';

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Download, Clock, Eye } from "lucide-react"

interface Document {
    id: string
    fileName: string
    signerName: string
    letterNumber: string | null
    subject: string | null
    signedAt: string
    filePath: string
}

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (status === "authenticated") {
            fetchDocuments()
        }
    }, [status, router])

    const fetchDocuments = async () => {
        try {
            const res = await fetch("/api/documents")
            if (res.ok) {
                const data = await res.json()
                setDocuments(data)
            }
        } catch (error) {
            console.error("Failed to fetch documents", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDownload = (doc: Document) => {
        // In a real app, this would trigger a download from the server/storage
        // For this local demo, we might need to handle it differently if files are just on disk
        // But since we can't easily serve local files outside public, we might need an API route to serve them
        // For now, let's assume the filePath is a public URL or we use an API to download
        window.open(`/api/documents/${doc.id}/download`, '_blank')
    }

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Digital Signature Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {session?.user?.name}</span>
                            <button
                                onClick={() => router.push("/")}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Sign New Document
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Signed Documents History</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">A list of all documents you have signed.</p>
                            </div>
                            <button
                                onClick={fetchDocuments}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                Refresh
                            </button>
                        </div>
                        <div className="border-t border-gray-200">
                            {documents.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by signing a new document.</p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => router.push("/")}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                                        >
                                            Sign Document
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <ul role="list" className="divide-y divide-gray-200">
                                    {documents.map((doc) => (
                                        <li key={doc.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-blue-600 truncate">{doc.fileName}</p>
                                                        <div className="ml-2 flex-shrink-0 flex">
                                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                Signed
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 sm:flex sm:justify-between">
                                                        <div className="sm:flex">
                                                            <p className="flex items-center text-sm text-gray-500 mr-6">
                                                                <span className="font-medium mr-1">Subject:</span> {doc.subject || '-'}
                                                            </p>
                                                            <p className="flex items-center text-sm text-gray-500">
                                                                <span className="font-medium mr-1">Ref:</span> {doc.letterNumber || '-'}
                                                            </p>
                                                        </div>
                                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                            <p>
                                                                Signed on <time dateTime={doc.signedAt}>{new Date(doc.signedAt).toLocaleDateString()}</time>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-5 flex-shrink-0 flex space-x-2">
                                                    <button
                                                        onClick={() => router.push(`/verify?id=${doc.id}`)}
                                                        className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(doc)}
                                                        className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
