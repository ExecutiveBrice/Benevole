
export class Evenement {
  id!: number;
  contact!: string;
  eventName!: string;
  contactEmail!: string;
  contactTel!: string;
  startDate!: Date;
  endDate!: Date;
  password!: string;

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
  copie!: boolean;

  couleurFond!: string;
  couleurBandeau!: string;
  couleurText!: string;
  couleurTitre!: string;
  couleurBloc!: string;
  couleurCard!: string;

  titleFont!: string;

  affiche!: string;
}
