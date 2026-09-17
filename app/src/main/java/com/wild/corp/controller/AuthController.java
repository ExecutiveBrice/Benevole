package com.wild.corp.controller;

import com.wild.corp.model.Ressources.ConnexionRessource;
import com.wild.corp.model.Ressources.JetonAuthentificationRessource;
import com.wild.corp.service.AdministrateurService;
import com.wild.corp.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AdministrateurService administrateurService;
    private final JwtService jwtService;

    public AuthController(AdministrateurService administrateurService, JwtService jwtService) {
        this.administrateurService = administrateurService;
        this.jwtService = jwtService;
    }

    @PostMapping("/connexion")
    public JetonAuthentificationRessource connexion(@Valid @RequestBody ConnexionRessource request) {
        String username = administrateurService.authentifier(request.username(), request.password());
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
        }
        JwtService.JwtToken token = jwtService.createToken(username);
        return new JetonAuthentificationRessource(token.value(), token.expiresAt());
    }
}
