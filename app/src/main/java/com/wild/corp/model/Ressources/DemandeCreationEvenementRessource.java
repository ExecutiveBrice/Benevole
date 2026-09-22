package com.wild.corp.model.Ressources;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Date;

/** Paramètres minimaux communiqués depuis le formulaire public. */
public record DemandeCreationEvenementRessource(
        @NotBlank @Size(max = 255) String eventName,
        @NotBlank @Size(max = 255) String contact,
        @NotBlank @Email @Size(max = 255) String contactEmail,
        @Size(max = 50) String contactTel,
        Date endDate,
        @Size(max = 500) String sitepersourl
) {}
