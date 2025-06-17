package farabi.backend.Service;

import farabi.backend.Entity.Instrumental;
import farabi.backend.Entity.MakamType;
import farabi.backend.Repository.InstrumentalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class InstrumentalService {

    private final InstrumentalRepository instrumentalRepository;

    @Autowired
    public InstrumentalService(InstrumentalRepository instrumentalRepository) {
        this.instrumentalRepository = instrumentalRepository;
    }

    public List<Instrumental> getAllInstrumentals() {
        return instrumentalRepository.findAll();
    }

    public Optional<Instrumental> getInstrumentalById(Long id) {
        return instrumentalRepository.findById(id);
    }

    public Instrumental saveInstrumental(Instrumental instrumental) {
        return instrumentalRepository.save(instrumental);
    }

    public void deleteInstrumental(Long id) {
        instrumentalRepository.deleteById(id);
    }

    public List<Instrumental> searchInstrumentalsByTitre(String titre) {
        return instrumentalRepository.findByTitreContainingIgnoreCase(titre);
    }

    public List<Instrumental> findInstrumentalsByCompositeur(String compositeur) {
        return instrumentalRepository.findByCompositeurContainingIgnoreCase(compositeur);
    }

    public List<Instrumental> findInstrumentalsByAnnee(int annee) {
        return instrumentalRepository.findByAnnee(annee);
    }

    public List<Instrumental> findInstrumentalsByMakam(MakamType makam) {
        return instrumentalRepository.findByMakam(makam);
    }
    
    public List<Instrumental> findInstrumentalsByMakamString(String makamStr) {
        try {
            MakamType makam = MakamType.valueOf(makamStr);
            return instrumentalRepository.findByMakam(makam);
        } catch (IllegalArgumentException e) {
            return List.of(); // Retourne une liste vide si le makam n'est pas valide
        }
    }
    
    public List<Instrumental> findInstrumentalsByRythme(String rythme) {
        return instrumentalRepository.findByRythme(rythme);
    }

    // Méthodes pour gérer les fichiers
    public Instrumental savePartition(Long instrumentalId, MultipartFile file) throws IOException {
        Optional<Instrumental> optionalInstrumental = instrumentalRepository.findById(instrumentalId);
        if (optionalInstrumental.isPresent() && !file.isEmpty()) {
            Instrumental instrumental = optionalInstrumental.get();
            instrumental.setFichierPartition(file.getBytes());
            instrumental.setPartitionNom(file.getOriginalFilename());
            instrumental.setPartitionType(file.getContentType());
            return instrumentalRepository.save(instrumental);
        }
        return null;
    }

    public Instrumental saveAudio(Long instrumentalId, MultipartFile file) throws IOException {
        Optional<Instrumental> optionalInstrumental = instrumentalRepository.findById(instrumentalId);
        if (optionalInstrumental.isPresent() && !file.isEmpty()) {
            Instrumental instrumental = optionalInstrumental.get();
            instrumental.setAudio(file.getBytes());
            instrumental.setAudioNom(file.getOriginalFilename());
            instrumental.setAudioType(file.getContentType());
            return instrumentalRepository.save(instrumental);
        }
        return null;
    }

    // Méthode pour créer un instrumental avec tous les fichiers en une seule opération
    public Instrumental createInstrumentalWithFiles(
            Instrumental instrumental,
            MultipartFile partitionFile,
            MultipartFile audioFile) throws IOException {
        
        // Vérifier que les fichiers obligatoires sont présents
        if (partitionFile == null || partitionFile.isEmpty()) {
            throw new IllegalArgumentException("Le fichier partition est obligatoire");
        }
        
        // Ajouter les fichiers à l'instrumental
        instrumental.setFichierPartition(partitionFile.getBytes());
        instrumental.setPartitionNom(partitionFile.getOriginalFilename());
        instrumental.setPartitionType(partitionFile.getContentType());
        
        // Ajouter le fichier audio s'il est présent
        if (audioFile != null && !audioFile.isEmpty()) {
            instrumental.setAudio(audioFile.getBytes());
            instrumental.setAudioNom(audioFile.getOriginalFilename());
            instrumental.setAudioType(audioFile.getContentType());
        }
        
        return instrumentalRepository.save(instrumental);
    }
    
    // Méthode pour mettre à jour un instrumental avec de nouveaux fichiers
    public Instrumental updateInstrumentalWithFiles(
            Long id,
            Instrumental instrumentalDetails,
            MultipartFile partitionFile,
            MultipartFile audioFile) throws IOException {
        
        Optional<Instrumental> optionalInstrumental = instrumentalRepository.findById(id);
        if (!optionalInstrumental.isPresent()) {
            return null;
        }
        
        Instrumental existingInstrumental = optionalInstrumental.get();
        
        // Mettre à jour les informations de base
        existingInstrumental.setTitre(instrumentalDetails.getTitre());
        existingInstrumental.setCompositeur(instrumentalDetails.getCompositeur());
        existingInstrumental.setAnnee(instrumentalDetails.getAnnee());
        
        // Gérer le makam avec sécurité
        if (instrumentalDetails.getMakam() != null) {
            existingInstrumental.setMakam(instrumentalDetails.getMakam());
        }
        
        existingInstrumental.setRythme(instrumentalDetails.getRythme());
        
        // Mettre à jour les fichiers si fournis
        if (partitionFile != null && !partitionFile.isEmpty()) {
            existingInstrumental.setFichierPartition(partitionFile.getBytes());
            existingInstrumental.setPartitionNom(partitionFile.getOriginalFilename());
            existingInstrumental.setPartitionType(partitionFile.getContentType());
        }
        
        if (audioFile != null && !audioFile.isEmpty()) {
            existingInstrumental.setAudio(audioFile.getBytes());
            existingInstrumental.setAudioNom(audioFile.getOriginalFilename());
            existingInstrumental.setAudioType(audioFile.getContentType());
        }
        
        return instrumentalRepository.save(existingInstrumental);
    }
} 