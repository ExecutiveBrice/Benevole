package com.wild.corp.service;

import com.wild.corp.model.DemandeCreationEvenement;
import com.wild.corp.model.Evenement;
import com.wild.corp.model.Ressources.DemandeCreationEvenementRessource;
import com.wild.corp.repositories.DemandeCreationEvenementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class DemandeCreationEvenementService {
    private final DemandeCreationEvenementRepository demandeRepository;
    private final EvenementService evenementService;

    public DemandeCreationEvenement creer(DemandeCreationEvenementRessource ressource) {
        DemandeCreationEvenement demande = new DemandeCreationEvenement();
        demande.setEventName(ressource.eventName().trim());
        demande.setContact(ressource.contact().trim());
        demande.setContactEmail(ressource.contactEmail().trim());
        demande.setContactTel(valeurOuVide(ressource.contactTel()));
        demande.setEndDate(ressource.endDate());
        demande.setSitepersourl(valeurOuVide(ressource.sitepersourl()));
        demande.setDateDemande(new Date());
        return demandeRepository.save(demande);
    }

    @Transactional(readOnly = true)
    public List<DemandeCreationEvenement> findAll() {
        return demandeRepository.findAll();
    }

    public Evenement valider(Integer id) {
        DemandeCreationEvenement demande = demandeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande de création introuvable"));

        Evenement evenement = new Evenement();
        evenement.setEventName(demande.getEventName());
        evenement.setContact(demande.getContact());
        evenement.setContactEmail(demande.getContactEmail());
        evenement.setContactTel(demande.getContactTel());
        evenement.setEndDate(demande.getEndDate());
        evenement.setSitepersourl(demande.getSitepersourl());
        evenementService.persist(evenement);
        demandeRepository.delete(demande);
        return evenement;
    }

    private String valeurOuVide(String valeur) {
        return valeur == null ? "" : valeur.trim();
    }
}
