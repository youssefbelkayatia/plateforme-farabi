import { ChansonType } from "./ChansonType.enum";
import { MakamType } from "./MakamType.enum";

export interface Chanson {
  idDemande?: number;
  titre: string;
  compositeur?: string;
  parolier?: string;
  chanteur: string;
  type?: ChansonType;
  annee?: number;
  paroles?: any; // byte[] in Java, can be Blob, ArrayBuffer, or base64 string in TS
  fichierPartition?: any; // byte[] in Java, can be Blob, ArrayBuffer, or base64 string in TS
  audio?: any; // byte[] in Java, can be Blob, ArrayBuffer, or base64 string in TS
  rythme?: string;
  makam?: MakamType;
}
