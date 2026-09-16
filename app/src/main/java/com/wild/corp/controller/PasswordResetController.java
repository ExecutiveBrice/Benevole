package com.wild.corp.controller;

import com.wild.corp.model.Ressources.DemandeReinitialisationMotDePasseRessource;
import com.wild.corp.model.Ressources.ReinitialisationMotDePasseRessource;
import com.wild.corp.service.AdministrateurService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/mot-de-passe")
public class PasswordResetController {

    private final AdministrateurService administrateurService;

    public PasswordResetController(AdministrateurService administrateurService) {
        this.administrateurService = administrateurService;
    }

    @PostMapping("/reinitialisation")
    public ResponseEntity<Void> demander(@Valid @RequestBody DemandeReinitialisationMotDePasseRessource request) {
        administrateurService.demanderReinitialisation(request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/confirmation")
    public ResponseEntity<Void> confirmer(@Valid @RequestBody ReinitialisationMotDePasseRessource request) {
        return administrateurService.reinitialiserMotDePasse(request)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.badRequest().build();
    }
}
