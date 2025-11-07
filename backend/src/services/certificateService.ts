import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

export interface CertificateData {
  certificateId: string;
  creatorAddress: string;
  prompt?: string;
  contentHash: string;
  ipfsCID: string;
  ipfsUrl?: string;
  modelUsed: string;
  timestamp: Date;
}

/**
 * Generate a certificate PDF with artwork data
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Check if template exists
      const templatePath = path.join(__dirname, '../../assets/certificate-template.png');
      
      if (fs.existsSync(templatePath)) {
        // Use Canva template as background
        doc.image(templatePath, 0, 0, { 
          width: 595.28,  // A4 width in points
          height: 841.89  // A4 height in points
        });
      } else {
        // Fallback: Create simple design if template doesn't exist
        doc.rect(0, 0, 595.28, 841.89).fill('#1e293b');
        
        // Header
        doc.fontSize(36)
          .fillColor('#6366f1')
          .text('PROOF-OF-ART', 50, 80, { align: 'center', width: 495.28 });

        doc.fontSize(22)
          .fillColor('#94a3b8')
          .text('Certificate of Authenticity', 50, 140, { align: 'center', width: 495.28 });

        // Decorative border
        doc.rect(50, 200, 495.28, 541.89)
          .lineWidth(3)
          .strokeColor('#6366f1')
          .stroke();
      }

      // Now overlay dynamic data on top of the template
      // All content is centered to match the template design
      const centerX = 50;
      const pageWidth = 495.28;
      let currentY = 240; // Start below the header
      const lineHeight = 24;
      const sectionSpacing = 8;

      // CREATOR
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000000')
        .text(`CREATOR: ${data.creatorAddress.substring(0, 12)}...`, centerX, currentY, {
          width: pageWidth,
          align: 'center'
        });
      currentY += lineHeight;

      // PROMPT
      const displayPrompt = data.prompt 
        ? (data.prompt.length > 40 ? `"${data.prompt.substring(0, 37)}..."` : `"${data.prompt}"`)
        : '"[Not Available]"';
      
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000000')
        .text(`PROMPT: ${displayPrompt}`, centerX, currentY, {
          width: pageWidth,
          align: 'center'
        });
      currentY += lineHeight + sectionSpacing; // Extra space after PROMPT

      // CONTENT HASH
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000000')
        .text(`CONTENT HASH: ${data.contentHash.substring(0, 12)}...`, centerX, currentY, {
          width: pageWidth,
          align: 'center'
        });
      currentY += lineHeight;

      // IPFS CID
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000000')
        .text(`IPFS CID: ${data.ipfsCID.substring(0, 12)}...`, centerX, currentY, {
          width: pageWidth,
          align: 'center'
        });
      currentY += lineHeight;

      // TRANSACTION
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000000')
        .text('TRANSACTION: 0X789...', centerX, currentY, {
          width: pageWidth,
          align: 'center'
        });
      currentY += lineHeight;

      // CERTIFICATE ID
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000000')
        .text(`CERTIFICATE ID: #${data.certificateId}`, centerX, currentY, {
          width: pageWidth,
          align: 'center'
        });
      currentY += lineHeight;

      // CREATED
      const formattedDate = new Date(data.timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
      const formattedTime = new Date(data.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#000000')
        .text(`CREATED: ${formattedDate} ${formattedTime}`, centerX, currentY, {
          width: pageWidth,
          align: 'center'
        });
      currentY += lineHeight + 25; // Extra space before QR code section

      // Generate QR Code for verification
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${data.contentHash}`;
      const qrCodeBuffer = await QRCode.toBuffer(verifyUrl, {
        width: 120,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FEF3C7' // Light yellow background
        }
      });

      // "[QR CODE]" text above QR (centered)
      doc.font('Helvetica')
        .fontSize(8)
        .fillColor('#000000')
        .text('[QR CODE]', centerX, currentY, { 
          width: pageWidth,
          align: 'center' 
        });
      currentY += 10;
      
      // "SCAN TO VERIFY" text
      doc.font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#000000')
        .text('SCAN TO VERIFY', centerX, currentY, { 
          width: pageWidth,
          align: 'center' 
        });
      currentY += 12;

      // Place QR code (centered)
      const qrSize = 120;
      const qrX = (595.28 - qrSize) / 2; // Center horizontally on page
      doc.image(qrCodeBuffer, qrX, currentY, { 
        width: qrSize, 
        height: qrSize 
      });


      // Finish the PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Service class for certificate operations
 */
export class CertificateService {
  /**
   * Generate certificate for an artwork
   */
  async generateCertificate(data: CertificateData): Promise<Buffer> {
    return generateCertificatePDF(data);
  }
}

export const certificateService = new CertificateService();

