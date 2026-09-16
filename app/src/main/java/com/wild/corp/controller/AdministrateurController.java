package com.wild.corp.controller;

import com.wild.corp.model.Ressources.AdministrateurCreationRessource;
import com.wild.corp.model.Ressources.AdministrateurMiseAJourRessource;
import com.wild.corp.model.Ressources.AdministrateurRessource;
import com.wild.corp.service.AdministrateurService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/administrateurs")
public class AdministrateurController {

    private final AdministrateurService administrateurService;

    public AdministrateurController(AdministrateurService administrateurService) {
        this.administrateurService = administrateurService;
    }

    @GetMapping("/moi")
    public AdministrateurRessource moi(Authentication authentication) {
        return administrateurService.moi(authentication.getName());
    }

    @GetMapping
    public List<AdministrateurRessource> lister(Authentication authentication) {
        administrateurService.verifierAccesGlobal(authentication.getName());
        return administrateurService.lister();
    }

    /** Seul un administrateur global peut créer des comptes ou leur attribuer des évènements. */
    @PostMapping
    public ResponseEntity<AdministrateurRessource> creer(Authentication authentication,
                                                          @Valid @RequestBody AdministrateurCreationRessource request) {
        administrateurService.verifierAccesGlobal(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(administrateurService.creer(request));
    }

    @PutMapping("/{id}")
    public AdministrateurRessource mettreAJour(Authentication authentication,
                                               @PathVariable("id") Integer id,
                                               @Valid @RequestBody AdministrateurMiseAJourRessource request) {
        administrateurService.verifierAccesGlobal(authentication.getName());
        return administrateurService.mettreAJour(id, request);
    }
}
