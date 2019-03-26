import { Creneau } from "./creneau";
import { Stand } from "./stand";
import { Benevole } from "./benevole";

export class Croisement {
  id:number;
  creneau: Creneau;
  stand: Stand;
  benevoles: Benevole[];
  selected:boolean;
}