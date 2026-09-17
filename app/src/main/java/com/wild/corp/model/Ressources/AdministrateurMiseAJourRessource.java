package com.wild.corp.model.Ressources;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

/** Modification d'un compte sans jamais exposer son mot de passe courant. */
public record AdministrateurMiseAJourRessource(
        @NotBlank @Email @Size(max = 254) String username,
        @Size(min = 12, max = 128) String password,
        boolean enabled,
        boolean superadmin,
        Set<Integer> evenementIds
) {
}
