'use client';

import React, { useState } from 'react';

interface SignerFormProps {
    onGenerate: (data: { name: string; reason: string; letterNumber: string; subject: string; x?: number; y?: number }) => void;
    isProcessing: boolean;
}

export default function SignerForm({ onGenerate, isProcessing }: SignerFormProps) {
    const [name, setName] = useState('');
    const [reason, setReason] = useState('');
    const [letterNumber, setLetterNumber] = useState('');
    const [subject, setSubject] = useState('');
    const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom'>('bottom-right');
    const [customX, setCustomX] = useState('50');
    const [customY, setCustomY] = useState('50');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onGenerate({
                name,
                reason,
                letterNumber,
                subject,
                x: position === 'custom' ? parseInt(customX) : undefined,
                y: position === 'custom' ? parseInt(customY) : undefined,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Signer Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Full Name"
                        required
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="letterNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Surat
                    </label>
                    <input
                        type="text"
                        id="letterNumber"
                        value={letterNumber}
                        onChange={(e) => setLetterNumber(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g. 001/ABC/2024"
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Perihal
                    </label>
                    <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g. Approval of Budget"
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                        Reason (Optional)
                    </label>
                    <input
                        type="text"
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g. Verified"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        QR Position
                    </label>
                    <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                        <option value="bottom-right">Bottom Right (Default)</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                        <option value="custom">Custom Coordinates</option>
                    </select>
                </div>

                {position === 'custom' && (
                    <>
                        <div>
                            <label htmlFor="x" className="block text-sm font-medium text-gray-700 mb-1">X Coordinate</label>
                            <input
                                type="number"
                                id="x"
                                value={customX}
                                onChange={(e) => setCustomX(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="y" className="block text-sm font-medium text-gray-700 mb-1">Y Coordinate</label>
                            <input
                                type="number"
                                id="y"
                                value={customY}
                                onChange={(e) => setCustomY(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </>
                )}
            </div>

            <button
                type="submit"
                disabled={isProcessing || !name.trim()}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${isProcessing || !name.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    }`}
            >
                {isProcessing ? 'Processing...' : 'Generate Signature'}
            </button>
        </form>
    );
}
