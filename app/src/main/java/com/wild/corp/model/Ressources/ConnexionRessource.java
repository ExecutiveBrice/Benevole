package com.wild.corp.model.Ressources;

import jakarta.validation.constraints.NotBlank;

/** Identifiants transmis uniquement pour obtenir un jeton de session. */
public record ConnexionRessource(
        @NotBlank String username,
        @NotBlank String password
) {
}
