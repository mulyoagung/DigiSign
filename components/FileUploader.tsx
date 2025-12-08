'use client';

import React, { useCallback } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
}

export default function FileUploader({ onFileSelect, selectedFile }: FileUploaderProps) {
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type === 'application/pdf') {
                    onFileSelect(file);
                } else {
                    alert('Please upload a PDF file.');
                }
            }
        },
        [onFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                onFileSelect(file);
            } else {
                alert('Please upload a PDF file.');
            }
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {!selectedFile ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50"
                >
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-700">Click or Drag PDF here</p>
                        <p className="text-sm text-gray-500 mt-2">Supported format: PDF</p>
                    </label>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <FileText className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onFileSelect(null)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            )}
        </div>
    );
}
