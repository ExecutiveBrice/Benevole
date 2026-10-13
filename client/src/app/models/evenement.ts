
export class Evenement {
  id!: number;
  contact!: string;
  eventName!: string;
  dateEvenement?: string | null;
  adresse?: string;
  indicationsDebut?: string;
  indicationsFin?: string;
  contactEmail!: string;
  contactTel!: string;
  startDate!: Date;
  endDate!: Date;
  sitepersourl!: string;

  messageAccueil!: string;
  afficherMessageAccueil!: boolean;
  messagePlanning!: string;
  afficherMessagePlanning!: boolean;
  messageInfo!: string;
  afficherMessageInfo!: boolean;

  afficherBenevoles!: boolean;

  validation!: string;
  retour!: string;
  signature!: string;
  rappel!: string;
  lock!: boolean;
  needtel!: boolean;
  basique!: boolean;
  notification!: boolean;
  recapitulatifQuotidien: boolean = false;
  couleurFond!: string;
  couleurBandeau!: string;
  couleurText!: string;
  couleurTitre!: string;
  couleurTexteTitre!: string;
  couleurBloc!: string;
  couleurCard!: string;

  titleFont!: string;
  pageTitleFont!: string;
  bodyFont!: string;

  affiche!: string;
}
