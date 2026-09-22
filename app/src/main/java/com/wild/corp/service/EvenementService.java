package com.wild.corp.service;


import com.wild.corp.configuration.Constante;
import com.wild.corp.model.Creneau;
import com.wild.corp.model.Evenement;
import com.wild.corp.model.Stand;
import com.wild.corp.repositories.EvenementRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service("EvenementService")
@Transactional
@Slf4j
public class EvenementService {

    @Autowired
    private EvenementRepository evenementRepository;

    @Autowired
    private StandService standService;

    @Autowired
    private CreneauService creneauService;

    public void persist(Evenement evenement) {
        initialiserChampsTexte(evenement);
        evenementRepository.save(evenement);
        evenement.setLock(Constante.LOCK);
        evenement.setValidation(Constante.VALIDATION);
        evenement.setSignature(Constante.SIGNATURE);


        evenementRepository.save(evenement);
        Stand firstStand = new Stand();
        firstStand.setNom("Sans Choix");
        firstStand.setOrdre(0);
        firstStand.setType(1);
        standService.addStand(firstStand, evenement.getId());


        Creneau firstCreneau = new Creneau();
        firstCreneau.setOrdre(0);
        firstCreneau.setPlage("Referent");
        creneauService.addCreneau(firstCreneau, evenement.getId());


        evenement.setCouleurBandeau("#2d2d2d");
        evenement.setCouleurBloc("#b2b2b2");
        evenement.setCouleurCard("#b2b2b2");
        evenement.setCouleurFond("#c0c0c0");
        evenement.setCouleurTitre("#808080");
        evenement.setCouleurText("#ffffff");
        evenement.setCouleurTexteTitre("#ffffff");
        evenement.setTitleFont("PermanentMarker");
        evenement.setPageTitleFont("PermanentMarker");
        evenement.setBodyFont("Arial");

    }

    /**
     * La création simplifiée ne demande que le nom de l'évènement. Certaines
     * installations existantes conservent cependant des colonnes texte NOT NULL.
     */
    private void initialiserChampsTexte(Evenement evenement) {
        evenement.setContact(valeurParDefaut(evenement.getContact()));
        evenement.setContactTel(valeurParDefaut(evenement.getContactTel()));
        evenement.setContactEmail(valeurParDefaut(evenement.getContactEmail()));
        evenement.setSitepersourl(valeurParDefaut(evenement.getSitepersourl()));
        evenement.setValidation(valeurParDefaut(evenement.getValidation()));
        evenement.setSignature(valeurParDefaut(evenement.getSignature()));
        evenement.setMessageAccueil(valeurParDefaut(evenement.getMessageAccueil()));
        evenement.setMessagePlanning(valeurParDefaut(evenement.getMessagePlanning()));
        evenement.setMessageInfo(valeurParDefaut(evenement.getMessageInfo()));
        evenement.setCouleurFond(valeurParDefaut(evenement.getCouleurFond()));
        evenement.setCouleurBandeau(valeurParDefaut(evenement.getCouleurBandeau()));
        evenement.setCouleurText(valeurParDefaut(evenement.getCouleurText()));
        evenement.setCouleurTitre(valeurParDefaut(evenement.getCouleurTitre()));
        initialiserCouleurTexteTitre(evenement);
        evenement.setCouleurBloc(valeurParDefaut(evenement.getCouleurBloc()));
        evenement.setCouleurCard(valeurParDefaut(evenement.getCouleurCard()));
        evenement.setTitleFont(valeurParDefaut(evenement.getTitleFont()));
        initialiserPoliceTitrePage(evenement);
        initialiserPoliceTexte(evenement);
        evenement.setBasique(valeurParDefaut(evenement.getBasique()));
        evenement.setNeedtel(valeurParDefaut(evenement.getNeedtel()));
        evenement.setCopie(valeurParDefaut(evenement.getCopie()));
        evenement.setNotification(valeurParDefaut(evenement.getNotification()));
    }

    private String valeurParDefaut(String valeur) {
        return valeur == null ? "" : valeur;
    }

    private Boolean valeurParDefaut(Boolean valeur) {
        return valeur == null ? Boolean.FALSE : valeur;
    }

    /**
     * Les évènements créés avant l'ajout de ce réglage n'ont pas de valeur en
     * base. On reprend alors la couleur historique du texte du bandeau afin
     * de conserver leur rendu jusqu'à ce que l'organisateur la personnalise.
     */
    private void initialiserCouleurTexteTitre(Evenement evenement) {
        if (evenement.getCouleurTexteTitre() == null || evenement.getCouleurTexteTitre().isBlank()) {
            String couleurHistorique = evenement.getCouleurText();
            evenement.setCouleurTexteTitre(
                couleurHistorique == null || couleurHistorique.isBlank() ? "#ffffff" : couleurHistorique
            );
        }
    }

    /**
     * La police utilisée jusque-là pour le titre du bandeau était également
     * utilisée dans les pages. Cette valeur garantit une transition visuelle
     * identique pour les évènements existants.
     */
    private void initialiserPoliceTitrePage(Evenement evenement) {
        if (evenement.getPageTitleFont() == null || evenement.getPageTitleFont().isBlank()) {
            String policeHistorique = evenement.getTitleFont();
            evenement.setPageTitleFont(
                policeHistorique == null || policeHistorique.isBlank() ? "PermanentMarker" : policeHistorique
            );
        }
    }

    private void initialiserPoliceTexte(Evenement evenement) {
        if (evenement.getBodyFont() == null || evenement.getBodyFont().isBlank()) {
            evenement.setBodyFont("Arial");
        }
    }


    String replaceText(String text, Evenement evenement) {
        text = text.replaceAll("<event_name>", String.valueOf(evenement.getEventName()));

        return text;
    }

    public Evenement update(Evenement evenement) {

        Evenement event = findById(evenement.getId());
        event.setStartDate(evenement.getStartDate());
        event.setEndDate(evenement.getEndDate());
        event.setEventName(evenement.getEventName());
        event.setContactTel(evenement.getContactTel());
        event.setContact(evenement.getContact());
        event.setContactEmail(evenement.getContactEmail());

        event.setAfficherMessageAccueil(evenement.isAfficherMessageAccueil());
        event.setMessageAccueil(evenement.getMessageAccueil());
        event.setAfficherMessageInfo(evenement.isAfficherMessageInfo());
        event.setMessageInfo(evenement.getMessageInfo());
        event.setAfficherMessagePlanning(evenement.isAfficherMessagePlanning());
        event.setMessagePlanning(evenement.getMessagePlanning());

        event.setAfficherBenevoles(evenement.isAfficherBenevoles());

        event.setSignature(evenement.getSignature());
        event.setValidation(evenement.getValidation());
        event.setLock(evenement.isLock());

        event.setBasique(evenement.getBasique());
        event.setCopie(evenement.getCopie());
        event.setNotification(evenement.getNotification());
        event.setNeedtel(evenement.getNeedtel());
        event.setSitepersourl(evenement.getSitepersourl());

        event.setCouleurFond(evenement.getCouleurFond());
        event.setCouleurBandeau(evenement.getCouleurBandeau());
        event.setCouleurText(evenement.getCouleurText());
        event.setCouleurTitre(evenement.getCouleurTitre());
        event.setCouleurTexteTitre(evenement.getCouleurTexteTitre());
        event.setCouleurBloc(evenement.getCouleurBloc());
        event.setCouleurCard(evenement.getCouleurCard());
        event.setTitleFont(evenement.getTitleFont());
        event.setPageTitleFont(evenement.getPageTitleFont());
        event.setBodyFont(evenement.getBodyFont());

        return evenementRepository.save(event);
    }

    public List<Evenement> findAll() {
        List<Evenement> evenements = evenementRepository.findAll();
        evenements.forEach(evenement -> {
            initialiserCouleurTexteTitre(evenement);
            initialiserPoliceTitrePage(evenement);
            initialiserPoliceTexte(evenement);
        });
        return evenements;
    }

    public Evenement findById(Integer evenementId) {
        Evenement evenement = evenementRepository.findById(evenementId).orElse(null);
        if (evenement != null) {
            initialiserCouleurTexteTitre(evenement);
            initialiserPoliceTitrePage(evenement);
            initialiserPoliceTexte(evenement);
        }
        return evenement;
    }

    public void deleteById(Integer evenementId) {
        evenementRepository.deleteById(evenementId);
    }

     public Boolean isOpen(Integer evenementId) {
        if(evenementId != null) {
            Evenement evenement = findById(evenementId);
            return evenement.isLock();
        }
        return null;
    }

    public Boolean updateOpening(Integer evenementId) {
        if (evenementId != null) {
            Evenement evenement = findById(evenementId);
            evenement.setLock(!evenement.isLock());
            return evenement.isLock();
        }
        return null;
    }



}
