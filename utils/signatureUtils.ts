import QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const generateQRCode = async (text: string): Promise<string> => {
    try {
        return await QRCode.toDataURL(text);
    } catch (err) {
        console.error('Error generating QR code', err);
        throw err;
    }
};

export interface SignatureOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    letterNumber?: string;
    subject?: string;
}

export const embedSignature = async (
    pdfBytes: Uint8Array,
    qrCodeDataUrl: string,
    signerName: string,
    reason?: string,
    options: SignatureOptions = {}
) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width } = firstPage.getSize();

    const qrImageBytes = await fetch(qrCodeDataUrl).then((res) => res.arrayBuffer());
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    // Increase scale for better scannability (0.5 -> 0.75 or 1.0 depending on original size)
    // Let's make it a fixed visible size, e.g., 100x100 units
    // Use provided size or default to 100
    const qrW = options.width || 100;
    const qrH = options.height || 100;
    const qrDims = qrImage.scaleToFit(qrW, qrH);

    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Determine Position
    // Default to bottom right if not specified
    let qrX, qrY;

    if (options.x !== undefined && options.y !== undefined) {
        // Coordinates passed are from top-left (web standard)
        // PDF uses bottom-left (0,0)
        // We need to flip the Y axis
        // options.y is distance from top
        // pdf_y = height - options.y - qr_height
        qrX = options.x;
        qrY = firstPage.getHeight() - options.y - qrDims.height;
    } else {
        qrX = width - qrDims.width - 20;
        qrY = 20;
    }

    firstPage.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrDims.width,
        height: qrDims.height,
    });

    // Draw Text next to QR Code
    const fontSize = 9;
    // Simplified text as requested
    const text = `Dokumen ini ditandatangani secara elektronik`;

    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let textX = qrX - textWidth - 10;
    if (textX < 0) {
        textX = qrX + qrDims.width + 10;
    }

    firstPage.drawText(text, {
        x: textX,
        y: qrY + (qrDims.height / 2) - (fontSize / 2) + 2, // Center vertically relative to QR
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
    });

    return await pdfDoc.save();
};
