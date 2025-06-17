package farabi.backend.Service;

import farabi.backend.Entity.Chanson;
import farabi.backend.Entity.ChansonType;
import farabi.backend.Entity.MakamType;
import farabi.backend.Repository.ChansonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class ChansonService {

    private final ChansonRepository chansonRepository;

    @Autowired
    public ChansonService(ChansonRepository chansonRepository) {
        this.chansonRepository = chansonRepository;
    }

    public List<Chanson> getAllChansons() {
        return chansonRepository.findAll();
    }

    public Optional<Chanson> getChansonById(Long id) {
        return chansonRepository.findById(id);
    }

    public Chanson saveChanson(Chanson chanson) {
        return chansonRepository.save(chanson);
    }

    public void deleteChanson(Long id) {
        chansonRepository.deleteById(id);
    }

    public List<Chanson> findChansonsByChanteur(String chanteur) {
        return chansonRepository.findByChanteur(chanteur);
    }

    public List<Chanson> findChansonsByType(ChansonType type) {
        return chansonRepository.findByType(type);
    }
    
    public List<Chanson> findChansonsByTypeString(String typeStr) {
        try {
            ChansonType type = ChansonType.valueOf(typeStr);
            return chansonRepository.findByType(type);
        } catch (IllegalArgumentException e) {
            return List.of(); // Retourne une liste vide si le type n'est pas valide
        }
    }

    public List<Chanson> searchChansonsByTitre(String titre) {
        return chansonRepository.findByTitreContainingIgnoreCase(titre);
    }

    public List<Chanson> findChansonsByAnnee(int annee) {
        return chansonRepository.findByAnnee(annee);
    }

    public List<Chanson> findChansonsByCompositeur(String compositeur) {
        return chansonRepository.findByCompositeurContainingIgnoreCase(compositeur);
    }

    public List<Chanson> findChansonsByParolier(String parolier) {
        return chansonRepository.findByParolierContainingIgnoreCase(parolier);
    }
    
    public List<Chanson> findChansonsByMakam(MakamType makam) {
        return chansonRepository.findByMakam(makam);
    }
    
    public List<Chanson> findChansonsByMakamString(String makamStr) {
        try {
            MakamType makam = MakamType.valueOf(makamStr);
            return chansonRepository.findByMakam(makam);
        } catch (IllegalArgumentException e) {
            return List.of(); // Retourne une liste vide si le makam n'est pas valide
        }
    }
    
    public List<Chanson> findChansonsByRythme(String rythme) {
        return chansonRepository.findByRythme(rythme);
    }

    // Méthodes pour gérer les fichiers
    public Chanson saveParoles(Long chansonId, MultipartFile file) throws IOException {
        Optional<Chanson> optionalChanson = chansonRepository.findById(chansonId);
        if (optionalChanson.isPresent() && !file.isEmpty()) {
            Chanson chanson = optionalChanson.get();
            chanson.setParoles(file.getBytes());
            return chansonRepository.save(chanson);
        }
        return null;
    }

    public Chanson savePartition(Long chansonId, MultipartFile file) throws IOException {
        Optional<Chanson> optionalChanson = chansonRepository.findById(chansonId);
        if (optionalChanson.isPresent() && !file.isEmpty()) {
            Chanson chanson = optionalChanson.get();
            chanson.setFichierPartition(file.getBytes());
           
            return chansonRepository.save(chanson);
        }
        return null;
    }

    public Chanson saveAudio(Long chansonId, MultipartFile file) throws IOException {
        Optional<Chanson> optionalChanson = chansonRepository.findById(chansonId);
        if (optionalChanson.isPresent() && !file.isEmpty()) {
            Chanson chanson = optionalChanson.get();
            chanson.setAudio(file.getBytes());
        
            return chansonRepository.save(chanson);
        }
        return null;
    }

    // Méthode pour créer une chanson avec tous les fichiers en une seule opération
    public Chanson createChansonWithFiles(
            Chanson chanson,
            MultipartFile parolesFile,
            MultipartFile partitionFile,
            MultipartFile audioFile) throws IOException {
        
        // Vérifier que les fichiers obligatoires sont présents
        if (parolesFile == null || parolesFile.isEmpty() || 
            partitionFile == null || partitionFile.isEmpty()) {
            throw new IllegalArgumentException("Les fichiers paroles et partition sont obligatoires");
        }
        
        // Ajouter les fichiers à la chanson
        chanson.setParoles(parolesFile.getBytes());
        chanson.setFichierPartition(partitionFile.getBytes());
        
        // Ajouter le fichier audio s'il est présent
        if (audioFile != null && !audioFile.isEmpty()) {
            chanson.setAudio(audioFile.getBytes());
        }
        
        return chansonRepository.save(chanson);
    }
    
    // Méthode pour mettre à jour une chanson avec de nouveaux fichiers
    public Chanson updateChansonWithFiles(
            Long id,
            Chanson chansonDetails,
            MultipartFile parolesFile,
            MultipartFile partitionFile,
            MultipartFile audioFile) throws IOException {
        
        Optional<Chanson> optionalChanson = chansonRepository.findById(id);
        if (!optionalChanson.isPresent()) {
            return null;
        }
        
        Chanson existingChanson = optionalChanson.get();
        
        // Mettre à jour les informations de base
        existingChanson.setTitre(chansonDetails.getTitre());
        existingChanson.setCompositeur(chansonDetails.getCompositeur());
        existingChanson.setParolier(chansonDetails.getParolier());
        existingChanson.setChanteur(chansonDetails.getChanteur());
        
        // Gérer le type avec sécurité
        if (chansonDetails.getType() != null) {
            existingChanson.setType(chansonDetails.getType());
        }
        
        existingChanson.setAnnee(chansonDetails.getAnnee());
        
        // Gérer le makam avec sécurité
        if (chansonDetails.getMakam() != null) {
            existingChanson.setMakam(chansonDetails.getMakam());
        }
        
        existingChanson.setRythme(chansonDetails.getRythme());
        
        // Mettre à jour les fichiers si fournis
        if (parolesFile != null && !parolesFile.isEmpty()) {
            existingChanson.setParoles(parolesFile.getBytes());
           
        }
        
        if (partitionFile != null && !partitionFile.isEmpty()) {
            existingChanson.setFichierPartition(partitionFile.getBytes());
            
        }
        
        if (audioFile != null && !audioFile.isEmpty()) {
            existingChanson.setAudio(audioFile.getBytes());
            
        }
        
        return chansonRepository.save(existingChanson);
    }
} 