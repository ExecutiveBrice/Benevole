
export class Evenement {
  id: number;
  contact: string;
  eventName: string;
  contactEmail: string;
  contactTel: string;
  startDate: Date;
  endDate: Date;
  password: string;
  affiche:string | ArrayBuffer;
 
  sitepersourl: string;
  sitepersologo:string | ArrayBuffer;


  rappelDate: Date;
  validation: string;
  retour: string;
  signature: string;
  rappel: string;
  lock : boolean;
}