import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class PartitionService {

  constructor() {}

  /**
   * Combines multiple image files into a single PDF document using client-side processing
   * @param images Array of image files to combine
   * @param title Optional title for the PDF document
   * @returns Observable with the resulting PDF as a Blob
   */
  combineImagesToPDF(images: File[], title?: string): Observable<Blob> {
    return from(this.createPDFFromImages(images, title));
  }

  /**
   * Creates a PDF from an array of image files
   * @param imageFiles Array of image files
   * @param title Optional title for the PDF document
   * @returns Promise resolving to a PDF Blob
   */
  private async createPDFFromImages(imageFiles: File[], title?: string): Promise<Blob> {
    // Sort files by name to maintain order
    const sortedFiles = [...imageFiles].sort((a, b) => a.name.localeCompare(b.name));
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add metadata
    pdfDoc.setTitle(title || 'Partition');
    pdfDoc.setAuthor('Club Farabi');
    pdfDoc.setCreator('Club Farabi Partition System');
    
    // Add title page if title is provided
    if (title) {
      const titlePage = pdfDoc.addPage(PageSizes.A4);
      const { width, height } = titlePage.getSize();
      
      try {
        // Use Helvetica for Latin text (more widely supported)
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 24;
        const textWidth = font.widthOfTextAtSize(title, fontSize);
        
        titlePage.drawText(title, {
          x: (width - textWidth) / 2,
          y: height - 150,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        
        // Add date
        const dateText = new Date().toLocaleDateString();
        const dateTextWidth = font.widthOfTextAtSize(dateText, 12);
        
        titlePage.drawText(dateText, {
          x: (width - dateTextWidth) / 2,
          y: height - 180,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
        
        // Add Club Farabi text - only Latin characters
        const clubText = 'Club Farabi';
        const clubTextWidth = font.widthOfTextAtSize(clubText, 14);
        
        titlePage.drawText(clubText, {
          x: (width - clubTextWidth) / 2,
          y: 50,
          size: 14,
          font,
          color: rgb(0, 0, 0),
        });
      } catch (error) {
        console.warn('Error adding text to title page:', error);
      }
    }
    
    // Add each image as a new page
    for (const imageFile of sortedFiles) {
      try {
        // Convert File to ArrayBuffer
        const imageBytes = await this.fileToArrayBuffer(imageFile);
        
        // Determine image type and embed it
        let imagePage;
        let image;
        
        if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (imageFile.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          console.warn(`Unsupported image type: ${imageFile.type}, skipping...`);
          continue;
        }
        
        // Calculate dimensions to fit the image properly on an A4 page
        const a4Width = PageSizes.A4[0];
        const a4Height = PageSizes.A4[1];
        const margin = 50; // 50 points margin
        
        const availableWidth = a4Width - (margin * 2);
        const availableHeight = a4Height - (margin * 2);
        
        // Calculate scale to fit image within available space
        const scaleWidth = availableWidth / image.width;
        const scaleHeight = availableHeight / image.height;
        const scale = Math.min(scaleWidth, scaleHeight);
        
        // Calculate dimensions and position for centered image
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;
        const x = (a4Width - scaledWidth) / 2;
        const y = (a4Height - scaledHeight) / 2;
        
        // Create page and draw image
        imagePage = pdfDoc.addPage(PageSizes.A4);
        imagePage.drawImage(image, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
        
        // Add page number
        try {
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const pageNumber = (pdfDoc.getPageCount() - (title ? 1 : 0)).toString();
          const textWidth = font.widthOfTextAtSize(pageNumber, 10);
          
          imagePage.drawText(pageNumber, {
            x: a4Width - textWidth - margin / 2,
            y: margin / 2,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        } catch (error) {
          console.warn('Error adding page number:', error);
        }
      } catch (error) {
        console.error(`Error processing image ${imageFile.name}:`, error);
      }
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convert to Blob
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }
  
  /**
   * Converts a File object to ArrayBuffer
   * @param file The file to convert
   * @returns Promise resolving to ArrayBuffer
   */
  private fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  
  /**
   * Renames the generated PDF file
   * @param blob PDF blob
   * @param filename Desired filename
   * @returns File object with the specified name
   */
  renamePdfBlob(blob: Blob, filename: string): File {
    const name = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    return new File([blob], name, { type: 'application/pdf' });
  }
} 