package com.wild.corp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;

/** Création et vérification des jetons de session HMAC-SHA256. */
@Service
public class JwtService {

    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
    private final ObjectMapper objectMapper;
    private final byte[] secret;
    private final long expirationSeconds;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-seconds}") long expirationSeconds) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("APP_JWT_SECRET doit contenir au moins 32 caractères");
        }
        if (expirationSeconds <= 0) {
            throw new IllegalStateException("APP_JWT_EXPIRATION_SECONDS doit être positif");
        }
        this.objectMapper = new ObjectMapper();
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationSeconds = expirationSeconds;
    }

    public JwtToken createToken(String username) {
        try {
            long issuedAt = Instant.now().getEpochSecond();
            long expiresAt = issuedAt + expirationSeconds;
            String header = encodeJson("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
            String payload = encodeJson(objectMapper.writeValueAsString(new Claims(username, issuedAt, expiresAt)));
            String unsignedToken = header + "." + payload;
            return new JwtToken(unsignedToken + "." + sign(unsignedToken), expiresAt);
        } catch (Exception exception) {
            throw new IllegalStateException("Impossible de créer le jeton de session", exception);
        }
    }

    /** Retourne l'identifiant du compte uniquement si le jeton est intègre et non expiré. */
    public String validate(String token) {
        try {
            String[] parts = token.split("\\.", -1);
            if (parts.length != 3 || !MessageDigest.isEqual(
                    BASE64_URL_DECODER.decode(parts[2]), BASE64_URL_DECODER.decode(sign(parts[0] + "." + parts[1])))) {
                return null;
            }
            JsonNode claims = objectMapper.readTree(BASE64_URL_DECODER.decode(parts[1]));
            JsonNode subject = claims.get("sub");
            JsonNode expiration = claims.get("exp");
            if (subject == null || subject.asText().isBlank() || expiration == null
                    || Instant.now().getEpochSecond() >= expiration.asLong()) {
                return null;
            }
            return subject.asText();
        } catch (Exception exception) {
            return null;
        }
    }

    private String encodeJson(String json) {
        return BASE64_URL_ENCODER.encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    private String sign(String unsignedToken) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return BASE64_URL_ENCODER.encodeToString(mac.doFinal(unsignedToken.getBytes(StandardCharsets.US_ASCII)));
    }

    private record Claims(String sub, long iat, long exp) {
    }

    public record JwtToken(String value, long expiresAt) {
    }
}
