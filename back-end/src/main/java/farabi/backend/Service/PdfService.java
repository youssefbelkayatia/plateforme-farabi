package farabi.backend.Service;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfService {

    /**
     * Combine plusieurs images en un seul fichier PDF
     * @param imageFiles Liste des fichiers images à combiner
     * @return Tableau d'octets représentant le fichier PDF
     * @throws IOException En cas d'erreur de lecture des images
     * @throws DocumentException En cas d'erreur lors de la création du PDF
     */
    public byte[] combineImagesToPdf(List<MultipartFile> imageFiles) throws IOException, DocumentException {
        // Vérifier que la liste d'images n'est pas vide
        if (imageFiles == null || imageFiles.isEmpty()) {
            throw new IllegalArgumentException("La liste d'images ne peut pas être vide");
        }
        
        // Créer un document PDF
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, outputStream);
        
        document.open();
        
        // Parcourir chaque image et l'ajouter au document PDF
        for (MultipartFile imageFile : imageFiles) {
            if (imageFile.isEmpty()) {
                continue;
            }
            
            // Convertir le fichier en objet Image iText
            Image image = Image.getInstance(imageFile.getBytes());
            
            // Redimensionner l'image pour qu'elle tienne sur une page A4
            float pageWidth = document.getPageSize().getWidth() - document.leftMargin() - document.rightMargin();
            float pageHeight = document.getPageSize().getHeight() - document.topMargin() - document.bottomMargin();
            
            // Calculer le ratio pour redimensionner l'image
            float widthRatio = pageWidth / image.getWidth();
            float heightRatio = pageHeight / image.getHeight();
            float ratio = Math.min(widthRatio, heightRatio);
            
            // Appliquer le redimensionnement
            image.scalePercent(ratio * 100);
            
            // Centrer l'image sur la page
            image.setAlignment(Image.MIDDLE);
            
            // Ajouter l'image au document
            document.add(image);
            
            // Ajouter une nouvelle page pour l'image suivante (sauf pour la dernière)
            if (imageFiles.indexOf(imageFile) < imageFiles.size() - 1) {
                document.newPage();
            }
        }
        
        document.close();
        
        return outputStream.toByteArray();
    }
    
    /**
     * Combine plusieurs images en un seul fichier PDF avec un nom de fichier spécifié
     * @param imageFiles Liste des fichiers images à combiner
     * @param fileName Nom du fichier PDF à générer
     * @return Objet contenant le fichier PDF et son nom
     * @throws IOException En cas d'erreur de lecture des images
     * @throws DocumentException En cas d'erreur lors de la création du PDF
     */
    public PdfResult combineImagesToPdfWithName(List<MultipartFile> imageFiles, String fileName) throws IOException, DocumentException {
        byte[] pdfBytes = combineImagesToPdf(imageFiles);
        
        if (fileName == null || fileName.isEmpty()) {
            fileName = "combined_images.pdf";
        } else if (!fileName.toLowerCase().endsWith(".pdf")) {
            fileName += ".pdf";
        }
        
        return new PdfResult(pdfBytes, fileName);
    }
    
    /**
     * Classe pour encapsuler le résultat de la génération de PDF
     */
    public static class PdfResult {
        private final byte[] pdfBytes;
        private final String fileName;
        
        public PdfResult(byte[] pdfBytes, String fileName) {
            this.pdfBytes = pdfBytes;
            this.fileName = fileName;
        }
        
        public byte[] getPdfBytes() {
            return pdfBytes;
        }
        
        public String getFileName() {
            return fileName;
        }
    }
} 