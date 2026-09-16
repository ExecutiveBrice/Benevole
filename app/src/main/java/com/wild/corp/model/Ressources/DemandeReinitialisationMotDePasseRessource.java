package com.wild.corp.model.Ressources;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record DemandeReinitialisationMotDePasseRessource(@NotBlank @Email String email) {
}
