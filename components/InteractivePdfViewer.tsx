'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Move, Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface InteractivePdfViewerProps {
    file: File | string;
    onPositionChange: (x: number, y: number, page: number, width?: number, height?: number) => void;
}

export default function InteractivePdfViewer({ file, onPositionChange }: InteractivePdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [qrSize, setQrSize] = useState<number>(100); // Default size in pixels (at scale 1)
    const containerRef = useRef<HTMLDivElement>(null);
    const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || !pdfDimensions) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Ensure within bounds
        const currentSize = qrSize * scale;
        const boundedX = Math.max(0, Math.min(x, pdfDimensions.width * scale - currentSize));
        const boundedY = Math.max(0, Math.min(y, pdfDimensions.height * scale - currentSize));

        updatePosition(boundedX, boundedY, qrSize);
    };

    const updatePosition = (x: number, y: number, size: number) => {
        setPosition({ x, y });
        setQrSize(size);

        if (pdfDimensions) {
            const relX = x / scale;
            const relY = y / scale;

            onPositionChange(relX, relY, pageNumber, size, size);
        }
    };

    // Dragging logic
    const isDragging = useRef(false);
    const isResizing = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ x: 0, y: 0, w: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!position) return;
        isDragging.current = true;
        dragOffset.current = {
            x: e.clientX - (containerRef.current?.getBoundingClientRect().left || 0) - position.x,
            y: e.clientY - (containerRef.current?.getBoundingClientRect().top || 0) - position.y
        };
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        isResizing.current = true;
        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            w: qrSize
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current || !pdfDimensions) return;

        if (isResizing.current && position) {
            const deltaX = e.clientX - resizeStart.current.x;
            // Calculate new size based on scale
            const newSize = Math.max(50, resizeStart.current.w + deltaX / scale);

            if (position.x + newSize * scale <= pdfDimensions.width * scale) {
                setQrSize(newSize);
                updatePosition(position.x, position.y, newSize);
            }
            return;
        }

        if (isDragging.current && position) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left - dragOffset.current.x;
            const y = e.clientY - rect.top - dragOffset.current.y;

            const currentSize = qrSize * scale;
            const boundedX = Math.max(0, Math.min(x, pdfDimensions.width * scale - currentSize));
            const boundedY = Math.max(0, Math.min(y, pdfDimensions.height * scale - currentSize));

            updatePosition(boundedX, boundedY, qrSize);
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        isResizing.current = false;
    };

    return (
        <div className="flex flex-col items-center w-full h-full bg-gray-200 p-4 overflow-auto">
            <div className="mb-4 flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm z-10 sticky top-0">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1 hover:bg-gray-100 rounded"><ZoomOut size={20} /></button>
                <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-1 hover:bg-gray-100 rounded"><ZoomIn size={20} /></button>
                <div className="h-4 w-px bg-gray-300 mx-2"></div>
                <span className="text-sm">Page {pageNumber} of {numPages}</span>
            </div>

            <div
                className="relative shadow-lg"
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex justify-center"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        onClick={handlePageClick}
                        onLoadSuccess={(page) => {
                            setPdfDimensions({ width: page.originalWidth, height: page.originalHeight });
                        }}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                </Document>

                {position && (
                    <div
                        className="absolute border-2 border-blue-600 bg-blue-100/50 cursor-move flex items-center justify-center group"
                        style={{
                            left: position.x,
                            top: position.y,
                            width: qrSize * scale,
                            height: qrSize * scale,
                        }}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="bg-blue-600 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 absolute -top-6 whitespace-nowrap pointer-events-none">
                            Drag to move
                        </div>
                        <div className="w-full h-full border border-dashed border-blue-400 flex items-center justify-center relative">
                            <span className="text-xs font-bold text-blue-800 opacity-50">QR</span>

                            {/* Resize Handle */}
                            <div
                                className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 cursor-se-resize flex items-center justify-center z-10"
                                onMouseDown={handleResizeMouseDown}
                            >
                                <Maximize size={10} className="text-white transform rotate-90" />
                            </div>
                        </div>
                    </div>
                )}

                {!position && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                            Click anywhere to place QR Code
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
