package com.wild.corp.model.Ressources;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReinitialisationMotDePasseRessource(
        @NotBlank String token,
        @NotBlank @Size(min = 12, max = 128) String password
) {
}
