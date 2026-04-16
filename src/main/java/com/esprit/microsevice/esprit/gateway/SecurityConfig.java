package com.esprit.microsevice.esprit.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Gateway Security Configuration.
 *
 * Token authority: Keycloak only.
 * The issuer-uri is read from KEYCLOAK_ISSUER_URI env var (see application.properties).
 *
 * Public routes (no token required):
 *   - /api/auth/**          → registration & login via user-ms
 *   - /api/users, /api/users/** → user CRUD (user-ms permits all internally)
 *   - /api/rooms, /api/rooms/** → room listing (public browsing)
 *   - /api/events/public    → public event listing
 *   - /api/recommendations/**  → recommendations (public)
 *   - /eureka/**, /actuator/** → infrastructure
 *
 * Protected routes (Keycloak Bearer token required):
 *   - /api/reservations/**
 *   - /api/equipment/**
 *   - /api/events (non-public, admin CRUD)
 *   - /api/events/**  (except /api/events/public handled above)
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/eureka/**",
                    "/actuator/**",
                    "/api/auth/**",
                    "/api/users",
                    "/api/users/**",
                    "/api/events",
                    "/api/events/**",
                    "/api/recommendations/**",
                    "/api/rooms",
                    "/api/rooms/**",
                    "/api/reservations/**",
                    "/api/equipment/**",
                    "/equipements/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            // All protected routes validate against Keycloak-issued JWTs.
            // The issuer-uri is configured in application.properties:
            //   spring.security.oauth2.resourceserver.jwt.issuer-uri=${KEYCLOAK_ISSUER_URI:...}
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        return http.build();
    }

    /**
     * Permissive CORS for hybrid dev: local frontend (Vite :5173) → dockerized gateway (:8080).
     * Restrict origins in production.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
