import { Croisement } from "./croisement";




export class Stand {
  id:number;
  nom: string;
  description:string;
  bulle:string;
  limite:number;
  Croisements: Croisement[];
  croisements: Croisement[];
}