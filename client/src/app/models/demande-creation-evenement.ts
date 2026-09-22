export interface DemandeCreationEvenement {
  id: number;
  eventName: string;
  contact: string;
  contactEmail: string;
  contactTel: string;
  endDate?: string;
  sitepersourl: string;
  dateDemande: string;
}

export interface DemandeCreationEvenementFormulaire {
  eventName: string;
  contact: string;
  contactEmail: string;
  contactTel: string;
  endDate: string | null;
  sitepersourl: string;
}
