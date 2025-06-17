package farabi.backend.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chansons")
public class Chanson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;
    
    private String compositeur;
    private String parolier;
    
    @Column(nullable = false)
    private String chanteur;
    
    private ChansonType type;
    private int annee;
    
    // Stockage direct des paroles (image) dans la base de données
    @Lob
    @Column(name = "paroles", columnDefinition = "LONGBLOB")
    private byte[] paroles;
    
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

    public String getRythme() {
        return rythme;
    }

    public void setRythme(String rythme) {
        this.rythme = rythme;
    }

    public MakamType getMakam() {
        return makam;
    }

    public void setMakam(MakamType makam) {
        this.makam = makam;
    }

    public void setType(ChansonType type) {
        this.type = type;
    }

    
    
    // Constructeurs
    public Chanson() {
    }
    
    public Chanson(Long id, String titre, String compositeur, String parolier, String chanteur, String type, int annee, byte[] paroles, byte[] fichierPartition, byte[] audio, String rythme, MakamType makam) {
        this.id = id;
        this.titre = titre;
        this.compositeur = compositeur;
        this.parolier = parolier;
        this.chanteur = chanteur;
        this.type = ChansonType.valueOf(type);
        this.annee = annee;
        this.paroles = paroles;
        this.fichierPartition = fichierPartition;
        this.audio = audio;
        this.rythme = rythme;
        this.makam = makam;
    }
    
    // Getters et Setters
    public Long getIdDemande() {
        return id;
    }

    public void setId(Long idDemande) {
        this.id = idDemande;
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

    public String getParolier() {
        return parolier;
    }

    public void setParolier(String parolier) {
        this.parolier = parolier;
    }

    public String getChanteur() {
        return chanteur;
    }

    public void setChanteur(String chanteur) {
        this.chanteur = chanteur;
    }

    public ChansonType getType() {
        return type;
    }

    public void setType(String type) {
        this.type = ChansonType.valueOf(type);
    }

    public int getAnnee() {
        return annee;
    }

    public void setAnnee(int annee) {
        this.annee = annee;
    }

    public byte[] getParoles() {
        return paroles;
    }

    public void setParoles(byte[] paroles) {
        this.paroles = paroles;
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
}
