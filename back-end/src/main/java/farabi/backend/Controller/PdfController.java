package farabi.backend.Controller;

import com.itextpdf.text.DocumentException;
import farabi.backend.Service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://192.168.1.172:4200"
}, allowCredentials = "true")
public class PdfController {

    private final PdfService pdfService;

    @Autowired
    public PdfController(PdfService pdfService) {
        this.pdfService = pdfService;
    }

    /**
     * Endpoint pour combiner plusieurs images en un seul fichier PDF
     * @param images Liste des fichiers images à combiner
     * @param fileName Nom du fichier PDF à générer (optionnel)
     * @return Le fichier PDF généré
     */
    @PostMapping(value = "/combine-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> combineImagesToPdf(
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam(value = "fileName", required = false) String fileName) {
        
        try {
            // Vérifier que les images ont été fournies
            if (images == null || images.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Aucune image n'a été fournie");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Vérifier que tous les fichiers sont des images
            for (MultipartFile file : images) {
                if (file.isEmpty() || !file.getContentType().startsWith("image/")) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Tous les fichiers doivent être des images valides");
                    return ResponseEntity.badRequest().body(error);
                }
            }
            
            // Générer le PDF
            PdfService.PdfResult result = pdfService.combineImagesToPdfWithName(images, fileName);
            
            // Configurer les en-têtes de la réponse
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", result.getFileName());
            
            // Retourner le PDF
            return new ResponseEntity<>(result.getPdfBytes(), headers, HttpStatus.OK);
            
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors de la lecture des images: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (DocumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors de la création du PDF: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Une erreur est survenue: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
} 