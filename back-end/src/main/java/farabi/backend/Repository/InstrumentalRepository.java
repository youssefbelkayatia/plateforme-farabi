package farabi.backend.Repository;

import farabi.backend.Entity.Instrumental;
import farabi.backend.Entity.MakamType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InstrumentalRepository extends JpaRepository<Instrumental, Long> {
    List<Instrumental> findByTitreContainingIgnoreCase(String titre);
    List<Instrumental> findByCompositeurContainingIgnoreCase(String compositeur);
    List<Instrumental> findByAnnee(int annee);
    List<Instrumental> findByMakam(MakamType makam);
    List<Instrumental> findByRythme(String rythme);
} 