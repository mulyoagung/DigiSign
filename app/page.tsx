'use client';

import React, { useState, useEffect } from 'react';
import FileUploader from '@/components/FileUploader';
import SignerForm from '@/components/SignerForm';
import { generateQRCode, embedSignature } from '@/utils/signatureUtils';
import { Download, RefreshCw, CheckCircle } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setOriginalPdfUrl(null);
      setSignedPdfUrl(null);
    }
  }, [file]);

  const handleGenerateSignature = async (data: { name: string; reason: string; letterNumber: string; subject: string; x?: number; y?: number }) => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);

      // Generate Verification URL
      const signatureData = {
        name: data.name,
        letterNumber: data.letterNumber,
        subject: data.subject,
        date: new Date().toISOString(),
        reason: data.reason,
        status: 'Valid'
      };

      // In a real app, we would save this to a database and just pass the ID.
      // For this demo, we encode the data in the URL.
      const encodedData = encodeURIComponent(JSON.stringify(signatureData));
      const verificationUrl = `${window.location.origin}/verify?data=${encodedData}`;

      const qrCodeDataUrl = await generateQRCode(verificationUrl);

      // Embed Signature
      const signedPdfBytes = await embedSignature(pdfBytes, qrCodeDataUrl, data.name, data.reason, {
        x: data.x,
        y: data.y,
        letterNumber: data.letterNumber,
        subject: data.subject
      });

      // Create Blob URL for the signed PDF
      const blob = new Blob([signedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSignedPdfUrl(url);
    } catch (error) {
      console.error('Error signing PDF:', error);
      alert('Failed to sign PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSignedPdfUrl(null);
    setOriginalPdfUrl(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              DigiSign
            </span>
          </div>
          <div className="text-sm text-gray-500">Secure Digital Signatures</div>
        </div>
      </header>

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Left Sidebar: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">1. Upload Document</h2>
              <FileUploader onFileSelect={setFile} selectedFile={file} />
            </div>

            {file && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">2. Signer Details</h2>
                <SignerForm onGenerate={handleGenerateSignature} isProcessing={isProcessing} />
              </div>
            )}

            {signedPdfUrl && (
              <div className="bg-green-50 rounded-2xl shadow-sm border border-green-100 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-semibold text-green-800">Ready to Download</h2>
                </div>
                <p className="text-green-700 mb-4 text-sm">
                  Your document has been successfully signed and verified.
                </p>
                <div className="flex space-x-3">
                  <a
                    href={signedPdfUrl}
                    download={`signed_${file?.name}`}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download PDF</span>
                  </a>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Start Over"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Area: Preview */}
          <div className="lg:col-span-8 bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-[800px] lg:h-auto min-h-[600px]">
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-medium text-gray-700">Document Preview</h3>
              {signedPdfUrl ? (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                  Signed Version
                </span>
              ) : file ? (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                  Original Version
                </span>
              ) : null}
            </div>
            <div className="flex-grow bg-gray-200 flex items-center justify-center relative">
              {signedPdfUrl ? (
                <iframe
                  src={`${signedPdfUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full"
                  title="Signed PDF Preview"
                />
              ) : originalPdfUrl ? (
                <iframe
                  src={`${originalPdfUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full"
                  title="Original PDF Preview"
                />
              ) : (
                <div className="text-center text-gray-400 p-8">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-lg font-medium">No document selected</p>
                  <p className="text-sm mt-1">Upload a PDF to view it here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
