package com.wild.corp.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // Gestion des comptes et propriétés sensibles.
                        .requestMatchers("/administrateurs/**", "/config/getProps").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/auth/mot-de-passe/**").permitAll()
                        // Création/modification des paramètres des événements.
                        .requestMatchers(HttpMethod.POST, "/evenement/**", "/creneau/**", "/stand/**", "/croisement/**", "/files/**", "/email/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/evenement/**", "/benevole/**", "/creneau/**", "/stand/**", "/croisement/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/evenement/**", "/benevole/**", "/creneau/**", "/stand/**", "/croisement/**").hasRole("ADMIN")
                        // Les lectures et l'inscription des bénévoles restent publiques.
                        .anyRequest().permitAll())
                .httpBasic(Customizer.withDefaults())
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
