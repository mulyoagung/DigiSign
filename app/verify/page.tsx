'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

interface SignatureData {
    name: string;
    letterNumber: string;
    subject: string;
    date: string;
    reason: string;
    status: string;
}

function VerifyContent() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<SignatureData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const decodedData = JSON.parse(decodeURIComponent(dataParam));
                setData(decodedData);
            } catch (err) {
                console.error('Error parsing verification data', err);
                setError('Invalid verification data.');
            }
        } else {
            setError('No verification data found.');
        }
    }, [searchParams]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-gray-300 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-green-600 px-6 py-8 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Document Verified</h1>
                        <p className="text-green-100 text-lg">
                            This document has been digitally signed and verified.
                        </p>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Signer Name</h3>
                                    <p className="text-xl font-semibold text-gray-900">{data.name}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Date Signed</h3>
                                    <p className="text-lg text-gray-900">{new Date(data.date).toLocaleString()}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Reason</h3>
                                    <p className="text-lg text-gray-900">{data.reason || '-'}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Nomor Surat</h3>
                                    <p className="text-lg font-medium text-gray-900">{data.letterNumber || '-'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Perihal</h3>
                                    <p className="text-lg font-medium text-gray-900">{data.subject || '-'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Status</h3>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        {data.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-200">
                            <div className="bg-blue-50 rounded-xl p-6 flex items-start space-x-4">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-blue-900 mb-1">Document Preview</h4>
                                    <p className="text-blue-700 text-sm mb-4">
                                        To view the full content of the signed document, please verify the physical copy or the file you possess matches these details.
                                    </p>
                                    {/* Future: Add upload to verify hash */}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-500 border-t border-gray-200">
                        Digital Signature Verification System &copy; {new Date().getFullYear()}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-gray-300 rounded"></div>
                </div>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
