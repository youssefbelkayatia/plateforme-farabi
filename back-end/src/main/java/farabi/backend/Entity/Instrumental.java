package farabi.backend.Entity;
import jakarta.persistence.*;

@Entity
@Table(name = "instrumentals")
public class Instrumental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    private String compositeur;

    private int annee;

    // Stockage direct de la partition (PDF) dans la base de données
    @Lob
    @Column(name = "fichier_partition", columnDefinition = "LONGBLOB")
    private byte[] fichierPartition;

    // Stockage direct de l'audio (MP3) dans la base de données
    @Lob
    @Column(name = "audio", columnDefinition = "LONGBLOB")
    private byte[] audio;

    private MakamType makam;
    private String rythme;
    
    // Métadonnées des fichiers
    @Column(name = "partition_nom")
    private String partitionNom;
    
    @Column(name = "audio_nom")
    private String audioNom;
    
    @Column(name = "partition_type")
    private String partitionType;
    
    @Column(name = "audio_type")
    private String audioType;

    // Constructeurs
    public Instrumental() {
    }

    public Instrumental(Long id, String titre, String compositeur, int annee, byte[] fichierPartition, byte[] audio, MakamType makam, String rythme) {
        this.id = id;
        this.titre = titre;
        this.compositeur = compositeur;
        this.annee = annee;
        this.fichierPartition = fichierPartition;
        this.audio = audio;
        this.makam = makam;
        this.rythme = rythme;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getCompositeur() {
        return compositeur;
    }

    public void setCompositeur(String compositeur) {
        this.compositeur = compositeur;
    }

    public int getAnnee() {
        return annee;
    }

    public void setAnnee(int annee) {
        this.annee = annee;
    }

    public byte[] getFichierPartition() {
        return fichierPartition;
    }

    public void setFichierPartition(byte[] fichierPartition) {
        this.fichierPartition = fichierPartition;
    }

    public byte[] getAudio() {
        return audio;
    }

    public void setAudio(byte[] audio) {
        this.audio = audio;
    }

    public MakamType getMakam() {
        return makam;
    }

    public void setMakam(MakamType makam) {
        this.makam = makam;
    }

    public String getRythme() {
        return rythme;
    }

    public void setRythme(String rythme) {
        this.rythme = rythme;
    }

    public String getPartitionNom() {
        return partitionNom;
    }

    public void setPartitionNom(String partitionNom) {
        this.partitionNom = partitionNom;
    }

    public String getAudioNom() {
        return audioNom;
    }

    public void setAudioNom(String audioNom) {
        this.audioNom = audioNom;
    }

    public String getPartitionType() {
        return partitionType;
    }

    public void setPartitionType(String partitionType) {
        this.partitionType = partitionType;
    }

    public String getAudioType() {
        return audioType;
    }

    public void setAudioType(String audioType) {
        this.audioType = audioType;
    }
}
