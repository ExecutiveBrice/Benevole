package com.wild.corp.configuration;

import com.wild.corp.service.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpStatus;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtService jwtService) {
        // Le filtre doit s'exécuter uniquement dans la chaîne Spring Security,
        // après la création du contexte de sécurité de la requête.
        this.jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtService);
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/auth/connexion").permitAll()
                        // Gestion des comptes et propriétés sensibles.
                        .requestMatchers("/administrateurs/**", "/config/getProps").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/auth/mot-de-passe/**").permitAll()
                        // Création/modification des paramètres des événements.
                        .requestMatchers(HttpMethod.POST, "/evenement/**", "/creneau/**", "/stand/**", "/croisement/**", "/files/**", "/email/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/evenement/**", "/benevole/**", "/creneau/**", "/stand/**", "/croisement/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/evenement/**", "/benevole/**", "/creneau/**", "/stand/**", "/croisement/**").hasRole("ADMIN")
                        // Les lectures et l'inscription des bénévoles restent publiques.
                        .anyRequest().permitAll())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
