package farabi.backend.Controller;

import farabi.backend.Entity.Instrumental;
import farabi.backend.Entity.MakamType;
import farabi.backend.Service.InstrumentalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import java.util.Optional;

@RestController
@RequestMapping("/api/instrumentals")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://192.168.1.172:4200"
}, allowCredentials = "true")
@Tag(name = "Instrumental API", description = "API pour la gestion des instrumentaux")
public class InstrumentalController {

    private final InstrumentalService instrumentalService;

    @Autowired
    public InstrumentalController(InstrumentalService instrumentalService) {
        this.instrumentalService = instrumentalService;
    }

    @GetMapping
    @Operation(summary = "Récupérer tous les instrumentaux", description = "Récupère la liste de tous les instrumentaux sans leurs fichiers")
    public ResponseEntity<List<Instrumental>> getAllInstrumentals() {
        return ResponseEntity.ok(instrumentalService.getAllInstrumentals());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un instrumental par ID", description = "Récupère un instrumental par son ID")
    public ResponseEntity<Instrumental> getInstrumentalById(@PathVariable Long id) {
        Optional<Instrumental> instrumental = instrumentalService.getInstrumentalById(id);
        return instrumental.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Créer un instrumental avec fichiers", description = "Crée un nouvel instrumental avec le fichier partition obligatoire et audio optionnel")
    public ResponseEntity<?> createInstrumentalWithFiles(
            @RequestParam("titre") String titre,
            @RequestParam(value = "compositeur", required = false) String compositeur,
            @RequestParam(value = "annee", required = false) Integer annee,
            @RequestParam("partition") MultipartFile partitionFile,
            @RequestParam(value = "audio", required = false) MultipartFile audioFile,
            @RequestParam(value = "rythme", required = false) String rythme,
            @RequestParam(value = "makam", required = false) String makamStr) throws IOException {
        
        try {
            // Vérifier que le fichier partition est présent
            if (partitionFile == null || partitionFile.isEmpty()) {
                Map<String, String> errors = new HashMap<>();
                errors.put("partition", "Le fichier partition est obligatoire");
                return ResponseEntity.badRequest().body(errors);
            }
            
            Instrumental instrumental = new Instrumental();
            instrumental.setTitre(titre);
            instrumental.setCompositeur(compositeur);
            instrumental.setAnnee(annee != null ? annee : 0);
            instrumental.setRythme(rythme);
            
            // Gérer le makam enum
            if (makamStr != null && !makamStr.isEmpty()) {
                try {
                    MakamType makam = MakamType.valueOf(makamStr);
                    instrumental.setMakam(makam);
                } catch (IllegalArgumentException e) {
                    Map<String, String> errors = new HashMap<>();
                    errors.put("makam", "Type de makam invalide: " + makamStr);
                    return ResponseEntity.badRequest().body(errors);
                }
            }
            
            Instrumental savedInstrumental = instrumentalService.createInstrumentalWithFiles(instrumental, partitionFile, audioFile);
            return new ResponseEntity<>(savedInstrumental, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Mettre à jour un instrumental avec fichiers", description = "Met à jour un instrumental existant avec de nouveaux fichiers optionnels")
    public ResponseEntity<?> updateInstrumentalWithFiles(
            @PathVariable Long id,
            @RequestParam("titre") String titre,
            @RequestParam(value = "compositeur", required = false) String compositeur,
            @RequestParam(value = "annee", required = false) Integer annee,
            @RequestParam(value = "partition", required = false) MultipartFile partitionFile,
            @RequestParam(value = "audio", required = false) MultipartFile audioFile,
            @RequestParam(value = "rythme", required = false) String rythme,
            @RequestParam(value = "makam", required = false) String makamStr) throws IOException {
        
        try {
            Instrumental instrumentalDetails = new Instrumental();
            instrumentalDetails.setTitre(titre);
            instrumentalDetails.setCompositeur(compositeur);
            instrumentalDetails.setAnnee(annee != null ? annee : 0);
            instrumentalDetails.setRythme(rythme);
            
            // Gérer le makam enum
            if (makamStr != null && !makamStr.isEmpty()) {
                try {
                    MakamType makam = MakamType.valueOf(makamStr);
                    instrumentalDetails.setMakam(makam);
                } catch (IllegalArgumentException e) {
                    Map<String, String> errors = new HashMap<>();
                    errors.put("makam", "Type de makam invalide: " + makamStr);
                    return ResponseEntity.badRequest().body(errors);
                }
            }
            
            Instrumental updatedInstrumental = instrumentalService.updateInstrumentalWithFiles(id, instrumentalDetails, partitionFile, audioFile);
            
            if (updatedInstrumental != null) {
                return ResponseEntity.ok(updatedInstrumental);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un instrumental", description = "Supprime un instrumental par son ID")
    public ResponseEntity<Void> deleteInstrumental(@PathVariable Long id) {
        Optional<Instrumental> instrumental = instrumentalService.getInstrumentalById(id);
        if (instrumental.isPresent()) {
            instrumentalService.deleteInstrumental(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
  
}