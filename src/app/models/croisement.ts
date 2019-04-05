import { Creneau } from "./creneau";
import { Stand } from "./stand";
import { Benevole } from "./benevole";

export class Croisement {
  id:number;
  creneau: number;
  stand: number;
  Creneau: Creneau;
  Stand: Stand;
  Benevoles: Benevole[];
  selected:boolean;
  besoin:boolean;
  limite:number;
}