package farabi.backend.Controller;

import farabi.backend.Entity.Chanson;
import farabi.backend.Entity.ChansonType;
import farabi.backend.Entity.MakamType;
import farabi.backend.Service.ChansonService;
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
@RequestMapping("/api/chansons")
@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://192.168.1.172:4200"
        }, allowCredentials = "true"
        )

public class ChansonController {

    private final ChansonService chansonService;

    @Autowired
    public ChansonController(ChansonService chansonService) {
        this.chansonService = chansonService;
    }

    @GetMapping
    @Operation(summary = "Récupérer toutes les chansons", description = "Récupère la liste de toutes les chansons sans leurs fichiers")
    public ResponseEntity<List<Chanson>> getAllChansons() {
        return ResponseEntity.ok(chansonService.getAllChansons());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une chanson par ID", description = "Récupère une chanson par son ID")
    public ResponseEntity<Chanson> getChansonById(@PathVariable Long id) {
        Optional<Chanson> chanson = chansonService.getChansonById(id);
        return chanson.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Créer une chanson avec fichiers", description = "Crée une nouvelle chanson avec les fichiers obligatoires (paroles, partition) et audio optionnel")
    public ResponseEntity<?> createChansonWithFiles(
            @RequestParam("titre") String titre,
            @RequestParam(value = "chanteur", required = false) String chanteur,
            @RequestParam(value = "compositeur", required = false) String compositeur,
            @RequestParam(value = "parolier", required = false) String parolier,
            @RequestParam(value = "type", required = false) String typeStr,
            @RequestParam(value = "annee", required = false) Integer annee,
            @RequestParam(value = "paroles", required = false) MultipartFile parolesFile,
            @RequestParam(value = "partition", required = false) MultipartFile partitionFile,
            @RequestParam(value = "audio", required = false) MultipartFile audioFile,
            @RequestParam(value = "rythme", required = false) String rythme,
            @RequestParam(value = "makam", required = false) String makamStr) throws IOException {
        
        try {
            // Vérifier que les fichiers obligatoires sont présents
            if (parolesFile == null || parolesFile.isEmpty() || partitionFile == null || partitionFile.isEmpty()) {
                Map<String, String> errors = new HashMap<>();
                if (parolesFile == null || parolesFile.isEmpty()) errors.put("paroles", "Le fichier des paroles est obligatoire");
                if (partitionFile == null || partitionFile.isEmpty()) errors.put("partition", "Le fichier de partition est obligatoire");
                
                return ResponseEntity.badRequest().body(errors);
            }
            
            Chanson chanson = new Chanson();
            chanson.setTitre(titre);
            if (chanteur != null && !chanteur.isEmpty()) {
                chanson.setChanteur(chanteur);
            }
            chanson.setCompositeur(compositeur);
            chanson.setParolier(parolier);
            
            // Gérer le type enum
            if (typeStr != null && !typeStr.isEmpty()) {
                try {
                    ChansonType type = ChansonType.valueOf(typeStr);
                    chanson.setType(type);
                } catch (IllegalArgumentException e) {
                    Map<String, String> errors = new HashMap<>();
                    errors.put("type", "Type de chanson invalide: " + typeStr);
                    return ResponseEntity.badRequest().body(errors);
                }
            }
            
            chanson.setAnnee(annee != null ? annee : 0);
            chanson.setRythme(rythme);
            
            // Gérer le makam enum
            if (makamStr != null && !makamStr.isEmpty()) {
                try {
                    MakamType makam = MakamType.valueOf(makamStr);
                    chanson.setMakam(makam);
                } catch (IllegalArgumentException e) {
                    Map<String, String> errors = new HashMap<>();
                    errors.put("makam", "Type de makam invalide: " + makamStr);
                    return ResponseEntity.badRequest().body(errors);
                }
            }
            
            Chanson savedChanson = chansonService.createChansonWithFiles(chanson, parolesFile, partitionFile, audioFile);
            return new ResponseEntity<>(savedChanson, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Mettre à jour une chanson avec fichiers", description = "Met à jour une chanson existante avec de nouveaux fichiers optionnels")
    public ResponseEntity<?> updateChansonWithFiles(
            @PathVariable Long id,
            @RequestParam("titre") String titre,
            @RequestParam("chanteur") String chanteur,
            @RequestParam(value = "compositeur", required = false) String compositeur,
            @RequestParam(value = "parolier", required = false) String parolier,
            @RequestParam(value = "type", required = false) String typeStr,
            @RequestParam(value = "annee", required = false) Integer annee,
            @RequestParam(value = "paroles", required = false) MultipartFile parolesFile,
            @RequestParam(value = "partition", required = false) MultipartFile partitionFile,
            @RequestParam(value = "audio", required = false) MultipartFile audioFile,
            @RequestParam(value = "rythme", required = false) String rythme,
            @RequestParam(value = "makam", required = false) String makamStr) throws IOException {
        
        try {
            Chanson chansonDetails = new Chanson();
            chansonDetails.setTitre(titre);
            chansonDetails.setChanteur(chanteur);
            chansonDetails.setCompositeur(compositeur);
            chansonDetails.setParolier(parolier);
            
            // Gérer le type enum
            if (typeStr != null && !typeStr.isEmpty()) {
                try {
                    ChansonType type = ChansonType.valueOf(typeStr);
                    chansonDetails.setType(type);
                } catch (IllegalArgumentException e) {
                    Map<String, String> errors = new HashMap<>();
                    errors.put("type", "Type de chanson invalide: " + typeStr);
                    return ResponseEntity.badRequest().body(errors);
                }
            }
            
            chansonDetails.setAnnee(annee != null ? annee : 0);
            chansonDetails.setRythme(rythme);
            
            // Gérer le makam enum
            if (makamStr != null && !makamStr.isEmpty()) {
                try {
                    MakamType makam = MakamType.valueOf(makamStr);
                    chansonDetails.setMakam(makam);
                } catch (IllegalArgumentException e) {
                    Map<String, String> errors = new HashMap<>();
                    errors.put("makam", "Type de makam invalide: " + makamStr);
                    return ResponseEntity.badRequest().body(errors);
                }
            }
            
            Chanson updatedChanson = chansonService.updateChansonWithFiles(id, chansonDetails, parolesFile, partitionFile, audioFile);
            
            if (updatedChanson != null) {
                return ResponseEntity.ok(updatedChanson);
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
    @Operation(summary = "Supprimer une chanson", description = "Supprime une chanson par son ID")
    public ResponseEntity<Void> deleteChanson(@PathVariable Long id) {
        Optional<Chanson> chanson = chansonService.getChansonById(id);
        if (chanson.isPresent()) {
            chansonService.deleteChanson(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/type/{type}")
    @Operation(summary = "Rechercher par type", description = "Recherche des chansons par type")
    public ResponseEntity<List<Chanson>> getChansonsByType(@PathVariable String type) {
        try {
            ChansonType chansonType = ChansonType.valueOf(type);
            return ResponseEntity.ok(chansonService.findChansonsByType(chansonType));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(List.of()); // Retourne une liste vide si le type n'est pas valide
        }
    }
    
    @GetMapping("/makam/{makam}")
    @Operation(summary = "Rechercher par makam", description = "Recherche des chansons par makam")
    public ResponseEntity<List<Chanson>> getChansonsByMakam(@PathVariable String makam) {
        try {
            MakamType makamType = MakamType.valueOf(makam);
            return ResponseEntity.ok(chansonService.findChansonsByMakam(makamType));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(List.of()); // Retourne une liste vide si le makam n'est pas valide
        }
    }
    
    @GetMapping("/rythme/{rythme}")
    @Operation(summary = "Rechercher par rythme", description = "Recherche des chansons par rythme")
    public ResponseEntity<List<Chanson>> getChansonsByRythme(@PathVariable String rythme) {
        return ResponseEntity.ok(chansonService.findChansonsByRythme(rythme));
    }
    
    @GetMapping("/chanteur/{chanteur}")
    @Operation(summary = "Rechercher par chanteur", description = "Recherche des chansons par nom de chanteur")
    public ResponseEntity<List<Chanson>> getChansonsByChanteur(@PathVariable String chanteur) {
        return ResponseEntity.ok(chansonService.findChansonsByChanteur(chanteur));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher par titre", description = "Recherche des chansons par titre (recherche partielle)")
    public ResponseEntity<List<Chanson>> searchChansonsByTitre(@RequestParam String titre) {
        return ResponseEntity.ok(chansonService.searchChansonsByTitre(titre));
    }

    @GetMapping("/annee/{annee}")
    @Operation(summary = "Rechercher par année", description = "Recherche des chansons par année")
    public ResponseEntity<List<Chanson>> getChansonsByAnnee(@PathVariable int annee) {
        return ResponseEntity.ok(chansonService.findChansonsByAnnee(annee));
    }
} 