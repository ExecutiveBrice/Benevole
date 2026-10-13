package com.wild.corp.service;

import com.wild.corp.model.PushSubscription;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Encoding;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.Security;
import java.time.Duration;

@Service
@Slf4j
public class WebPushService {
    private final String publicKey;
    private final PreparingPushService service;
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NEVER).build();

    public WebPushService(@Value("${app.push.public-key:}") String publicKey,
                          @Value("${app.push.private-key:}") String privateKey,
                          @Value("${app.push.subject:}") String subject) {
        this.publicKey = publicKey;
        Security.addProvider(new BouncyCastleProvider());
        if (publicKey.isBlank() && privateKey.isBlank() && subject.isBlank()) {
            service = null;
            return;
        }
        if (publicKey.isBlank() || privateKey.isBlank() || !(subject.startsWith("mailto:") || subject.startsWith("https://"))) {
            throw new IllegalArgumentException("Configurer APP_PUSH_PUBLIC_KEY, APP_PUSH_PRIVATE_KEY et APP_PUSH_SUBJECT");
        }
        try {
            service = new PreparingPushService(publicKey, privateKey, subject);
            var signature = java.security.Signature.getInstance("SHA256withECDSA", "BC");
            byte[] probe = "benevoles-vapid".getBytes(java.nio.charset.StandardCharsets.UTF_8);
            signature.initSign(service.getPrivateKey());
            signature.update(probe);
            byte[] signed = signature.sign();
            signature.initVerify(service.getPublicKey());
            signature.update(probe);
            if (!signature.verify(signed)) throw new IllegalArgumentException("La paire VAPID ne correspond pas");
        } catch (Exception exception) {
            throw new IllegalArgumentException("Clés VAPID invalides", exception);
        }
    }

    public boolean isConfigured() { return service != null; }
    public String getPublicKey() { return isConfigured() ? publicKey : ""; }

    public int send(PushSubscription subscription, String payload) throws Exception {
        HttpRequest request = prepareRequest(subscription, payload);
        int code = client.send(request, HttpResponse.BodyHandlers.discarding()).statusCode();
        if (code >= 400) log.warn("Réponse du service Push : abonnement {}, service {}, HTTP {}",
                subscription.getId(), request.uri().getHost(), code);
        return code;
    }

    HttpRequest prepareRequest(PushSubscription subscription, String payload) throws Exception {
        if (!isConfigured()) throw new IllegalStateException("Web Push non configuré");
        // La liste des services autorisés est aussi contrôlée avant chaque envoi.
        NotificationService.validateEndpoint(subscription.getEndpoint());
        Notification notification = new Notification(subscription.getEndpoint(), subscription.getP256dh(),
                subscription.getAuth(), payload.getBytes(java.nio.charset.StandardCharsets.UTF_8), 86400);
        var encrypted = service.prepare(notification);
        var request = HttpRequest.newBuilder(URI.create(encrypted.getUrl())).timeout(Duration.ofSeconds(10));
        encrypted.getHeaders().forEach(request::header);
        return request.POST(HttpRequest.BodyPublishers.ofByteArray(encrypted.getBody())).build();
    }

    private static class PreparingPushService extends PushService {
        PreparingPushService(String publicKey, String privateKey, String subject) throws java.security.GeneralSecurityException {
            super(publicKey, privateKey, subject);
        }
        nl.martijndwars.webpush.HttpRequest prepare(Notification notification) throws Exception {
            return prepareRequest(notification, Encoding.AES128GCM);
        }
    }
}
