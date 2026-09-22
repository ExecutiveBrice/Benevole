package com.wild.corp.controller;

import com.wild.corp.model.DemandeCreationEvenement;
import com.wild.corp.model.Evenement;
import com.wild.corp.model.Ressources.DemandeCreationEvenementRessource;
import com.wild.corp.service.AdministrateurService;
import com.wild.corp.service.DemandeCreationEvenementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/demandes-evenements")
@RequiredArgsConstructor
public class DemandeCreationEvenementController {
    private final DemandeCreationEvenementService demandeService;
    private final AdministrateurService administrateurService;

    @PostMapping
    public ResponseEntity<DemandeCreationEvenement> creer(@Valid @RequestBody DemandeCreationEvenementRessource demande) {
        return ResponseEntity.status(HttpStatus.CREATED).body(demandeService.creer(demande));
    }

    @GetMapping
    public List<DemandeCreationEvenement> getAll(Authentication authentication) {
        administrateurService.verifierAccesGlobal(authentication.getName());
        return demandeService.findAll();
    }

    @PostMapping("/{id}/valider")
    public Evenement valider(@PathVariable Integer id, Authentication authentication) {
        administrateurService.verifierAccesGlobal(authentication.getName());
        Evenement evenement = demandeService.valider(id);
        administrateurService.associerEvenement(authentication.getName(), evenement.getId());
        return evenement;
    }
}
