import { Creneau } from "./creneau";
import { Stand } from "./stand";

export class Croisement {
  id:number;
  creneau: Creneau;
  stand: Stand;
  description: string;
  image: string | ArrayBuffer;
}