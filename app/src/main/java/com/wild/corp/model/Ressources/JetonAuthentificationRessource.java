package com.wild.corp.model.Ressources;

/** Jeton JWT et son instant d'expiration, en secondes Unix. */
public record JetonAuthentificationRessource(String token, long expiresAt) {
}
