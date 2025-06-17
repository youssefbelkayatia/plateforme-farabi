package farabi.backend.Repository;

import farabi.backend.Entity.Chanson;
import farabi.backend.Entity.ChansonType;
import farabi.backend.Entity.MakamType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChansonRepository extends JpaRepository<Chanson, Long> {
    List<Chanson> findByChanteur(String chanteur);
    List<Chanson> findByType(ChansonType type);
    List<Chanson> findByTitreContainingIgnoreCase(String titre);
    List<Chanson> findByAnnee(int annee);
    List<Chanson> findByCompositeurContainingIgnoreCase(String compositeur);
    List<Chanson> findByParolierContainingIgnoreCase(String parolier);
    List<Chanson> findByMakam(MakamType makam);
    List<Chanson> findByRythme(String rythme);
} 