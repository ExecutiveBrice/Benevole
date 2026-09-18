package com.wild.corp.service;

import com.wild.corp.model.Administrateur;
import com.wild.corp.model.Evenement;
import com.wild.corp.model.PasswordResetToken;
import com.wild.corp.model.Ressources.AdministrateurCreationRessource;
import com.wild.corp.model.Ressources.AdministrateurMiseAJourRessource;
import com.wild.corp.model.Ressources.AdministrateurRessource;
import com.wild.corp.model.Ressources.DemandeReinitialisationMotDePasseRessource;
import com.wild.corp.model.Ressources.ReinitialisationMotDePasseRessource;
import com.wild.corp.repositories.AdministrateurRepository;
import com.wild.corp.repositories.EvenementRepository;
import com.wild.corp.repositories.PasswordResetTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Service
@Transactional
public class AdministrateurService implements UserDetailsService {

    private final AdministrateurRepository administrateurRepository;
    private final EvenementRepository evenementRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final String frontendUrl;
    private final SecureRandom secureRandom = new SecureRandom();

    public AdministrateurService(AdministrateurRepository administrateurRepository,
                                 EvenementRepository evenementRepository,
                                 PasswordResetTokenRepository passwordResetTokenRepository,
                                 PasswordEncoder passwordEncoder,
                                 EmailService emailService,
                                 @Value("${app.frontend-url}") String frontendUrl) {
        this.administrateurRepository = administrateurRepository;
        this.evenementRepository = evenementRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl.endsWith("/") ? frontendUrl : frontendUrl + "/";
    }

    /** Adaptateur entre l'entité métier et Spring Security. */
    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Administrateur administrateur = administrateurRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Administrateur introuvable"));
        return User.withUsername(administrateur.getUsername())
                .password(administrateur.getPasswordHash())
                .roles("ADMIN")
                .disabled(!administrateur.isEnabled())
                .build();
    }

    public AdministrateurRessource creer(AdministrateurCreationRessource request) {
        String username = request.username().trim().toLowerCase();
        if (administrateurRepository.findByUsernameIgnoreCase(username).isPresent()) {
            throw new IllegalArgumentException("Cet identifiant est déjà utilisé");
        }

        Administrateur administrateur = new Administrateur();
        administrateur.setUsername(username);
        // Le mot de passe est choisi par le nouvel administrateur via le lien d'invitation.
        // Un secret aléatoire rend toute connexion impossible avant cette étape.
        administrateur.setPasswordHash(passwordEncoder.encode(genererSecretAleatoire()));
        administrateur.setEnabled(true);
        administrateur.setSuperadmin(request.superadmin());
        administrateur.setEvenements(eventsFor(request.evenementIds(), request.superadmin()));
        Administrateur administrateurCree = administrateurRepository.save(administrateur);
        creerEtEnvoyerJetonInvitation(administrateurCree);
        return toRessource(administrateurCree);
    }

    public AdministrateurRessource mettreAJour(Integer id, AdministrateurMiseAJourRessource request) {
        Administrateur administrateur = administrateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Administrateur introuvable"));
        String username = request.username().trim().toLowerCase();
        administrateurRepository.findByUsernameIgnoreCase(username)
                .filter(existant -> !existant.getId().equals(id))
                .ifPresent(existant -> { throw new IllegalArgumentException("Cet identifiant est déjà utilisé"); });

        boolean retireDernierSuperadministrateur = administrateur.isEnabled() && administrateur.isSuperadmin()
                && (!request.enabled() || !request.superadmin());
        if (retireDernierSuperadministrateur && nombreSuperadministrateursActifs() <= 1) {
            throw new IllegalArgumentException("Il doit rester au moins un super-administrateur actif");
        }

        administrateur.setUsername(username);
        administrateur.setEnabled(request.enabled());
        administrateur.setSuperadmin(request.superadmin());
        if (request.password() != null && !request.password().isBlank()) {
            administrateur.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        administrateur.setEvenements(eventsFor(request.evenementIds(), request.superadmin()));
        return toRessource(administrateurRepository.save(administrateur));
    }

    public AdministrateurRessource moi(String username) {
        return toRessource(getByUsername(username));
    }

    /** Vérifie les identifiants sans les conserver dans le navigateur. */
    @Transactional(Transactional.TxType.SUPPORTS)
    public String authentifier(String username, String password) {
        return administrateurRepository.findByUsernameIgnoreCase(username.trim())
                .filter(Administrateur::isEnabled)
                .filter(administrateur -> passwordEncoder.matches(password, administrateur.getPasswordHash()))
                .map(Administrateur::getUsername)
                .orElse(null);
    }

    public List<AdministrateurRessource> lister() {
        return administrateurRepository.findAll().stream().map(this::toRessource).toList();
    }

    /** Réponse identique qu'un compte existe ou non pour ne pas révéler les adresses enregistrées. */
    public void demanderReinitialisation(DemandeReinitialisationMotDePasseRessource request) {
        String username = request.email().trim().toLowerCase();
        administrateurRepository.findByUsernameIgnoreCase(username)
                .ifPresent(this::creerEtEnvoyerJetonReinitialisation);
    }

    public boolean reinitialiserMotDePasse(ReinitialisationMotDePasseRessource request) {
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHashAndUsedAtIsNull(hash(request.token()))
                .orElse(null);
        if (token == null || !token.getExpiresAt().isAfter(Instant.now())) {
            return false;
        }
        token.getAdministrateur().setPasswordHash(passwordEncoder.encode(request.password()));
        token.setUsedAt(Instant.now());
        return true;
    }

    public List<Evenement> evenementsDe(String username) {
        return administrateurRepository.findEvenementsByUsername(username);
    }

    /** Associe automatiquement un événement à l'administrateur qui le crée. */
    public void associerEvenement(String username, Integer evenementId) {
        Administrateur administrateur = getByUsername(username);
        // Un super-administrateur peut gérer tous les évènements sans affectation dédiée.
        if (administrateur.isSuperadmin()) {
            return;
        }
        Evenement evenement = evenementRepository.findById(evenementId)
                .orElseThrow(() -> new IllegalArgumentException("Événement introuvable"));
        administrateur.getEvenements().add(evenement);
    }

    public void verifierAccesEvenement(String username, Integer evenementId) {
        if (getByUsername(username).isSuperadmin()) {
            return;
        }
        boolean autorise = administrateurRepository.findEvenementsByUsername(username).stream()
                .anyMatch(evenement -> evenement.getId().equals(evenementId));
        if (!autorise) {
            throw new AccessDeniedException("Vous n'êtes pas administrateur de cet événement");
        }
    }

    /**
     * La gestion transversale est réservée aux super-administrateurs.
     */
    public void verifierAccesGlobal(String username) {
        if (!getByUsername(username).isSuperadmin()) {
            throw new AccessDeniedException("Vous n'êtes pas super-administrateur");
        }
    }

    private Administrateur getByUsername(String username) {
        return administrateurRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Administrateur introuvable"));
    }

    private Set<Evenement> eventsFor(Set<Integer> evenementIds, boolean superadmin) {
        if (evenementIds == null || evenementIds.isEmpty()) {
            if (superadmin) {
                return new HashSet<>();
            }
            throw new IllegalArgumentException("Sélectionnez au moins un événement ou activez le rôle super-administrateur");
        }
        List<Evenement> evenements = evenementRepository.findAllById(evenementIds);
        if (evenements.size() != evenementIds.size()) {
            throw new IllegalArgumentException("Un ou plusieurs événements sont introuvables");
        }
        return new HashSet<>(evenements);
    }

    private AdministrateurRessource toRessource(Administrateur administrateur) {
        Set<Integer> evenementIds = administrateur.getEvenements().stream()
                .map(Evenement::getId)
                .collect(java.util.stream.Collectors.toSet());
        return new AdministrateurRessource(administrateur.getId(), administrateur.getUsername(),
                administrateur.isEnabled(), administrateur.isSuperadmin(), evenementIds);
    }

    private long nombreSuperadministrateursActifs() {
        return administrateurRepository.findAll().stream()
                .filter(Administrateur::isEnabled)
                .filter(Administrateur::isSuperadmin)
                .count();
    }

    private void creerEtEnvoyerJetonReinitialisation(Administrateur administrateur) {
        String tokenBrut = creerJetonReinitialisation(administrateur);
        emailService.sendPasswordResetMessage(administrateur.getUsername(),
                frontendUrl + "#/mot-de-passe?token=" + tokenBrut);
    }

    private void creerEtEnvoyerJetonInvitation(Administrateur administrateur) {
        String tokenBrut = creerJetonReinitialisation(administrateur);
        emailService.sendAdministratorInvitationMessage(administrateur.getUsername(),
                frontendUrl + "#/mot-de-passe?token=" + tokenBrut);
    }

    private String creerJetonReinitialisation(Administrateur administrateur) {
        passwordResetTokenRepository.deleteByAdministrateur(administrateur);
        String tokenBrut = genererSecretAleatoire();

        PasswordResetToken token = new PasswordResetToken();
        token.setAdministrateur(administrateur);
        token.setTokenHash(hash(tokenBrut));
        token.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
        passwordResetTokenRepository.save(token);
        return tokenBrut;
    }

    private String genererSecretAleatoire() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponible", exception);
        }
    }

    /**
     * Le bootstrap est volontairement conditionnel : aucun identifiant ou mot
     * de passe par défaut ne doit rendre l'application accessible.
     */
    @Bean
    ApplicationRunner bootstrapAdministrateur(
            @Value("${app.bootstrap-admin.username:}") String username,
            @Value("${app.bootstrap-admin.password:}") String password) {
        return args -> {
            // Compatibilité avec les données existantes : auparavant, un compte sans
            // évènement associé représentait un administrateur global.
            administrateurRepository.migrerAdministrateursGlobauxHistoriques();
            if (username.isBlank() && password.isBlank()) {
                return;
            }
            if (username.isBlank() || password.isBlank()) {
                throw new IllegalStateException("Les variables APP_BOOTSTRAP_ADMIN_USERNAME et APP_BOOTSTRAP_ADMIN_PASSWORD doivent être renseignées ensemble");
            }
            if (password.length() < 12) {
                throw new IllegalStateException("APP_BOOTSTRAP_ADMIN_PASSWORD doit contenir au moins 12 caractères");
            }
            Administrateur existingAdministrateur = administrateurRepository.findByUsernameIgnoreCase(username.trim()).orElse(null);
            if (existingAdministrateur == null) {
                Administrateur administrateur = new Administrateur();
                administrateur.setUsername(username.trim().toLowerCase());
                administrateur.setPasswordHash(passwordEncoder.encode(password));
                administrateur.setSuperadmin(true);
                administrateurRepository.save(administrateur);
            }
        };
    }
}
