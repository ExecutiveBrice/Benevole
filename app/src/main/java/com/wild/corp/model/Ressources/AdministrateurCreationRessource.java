package com.wild.corp.model.Ressources;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

/** Corps d'entrée dédié pour éviter d'exposer le hash du mot de passe. */
public record AdministrateurCreationRessource(
        @NotBlank @Email @Size(max = 254) String username,
        @NotBlank @Size(min = 12, max = 128) String password,
        Set<Integer> evenementIds
) {
}
