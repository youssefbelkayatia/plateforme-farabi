import { MakamType } from "./MakamType.enum";

export interface Instrumental {
  id?: number;
  titre: string;
  compositeur?: string;
  annee?: number;
  fichierPartition?: any; // byte[] in Java, can be Blob, ArrayBuffer, or base64 string in TS
  audio?: any; // byte[] in Java, can be Blob, ArrayBuffer, or base64 string in TS
  makam?: MakamType;
  rythme?: string;
}
