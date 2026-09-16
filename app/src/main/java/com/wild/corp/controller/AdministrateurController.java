package com.wild.corp.controller;

import com.wild.corp.model.Ressources.AdministrateurCreationRessource;
import com.wild.corp.model.Ressources.AdministrateurRessource;
import com.wild.corp.service.AdministrateurService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    /** Un administrateur authentifié peut créer un autre compte administrateur. */
    @PostMapping
    public ResponseEntity<AdministrateurRessource> creer(Authentication authentication,
                                                          @Valid @RequestBody AdministrateurCreationRessource request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(administrateurService.creer(authentication.getName(), request));
    }
}
