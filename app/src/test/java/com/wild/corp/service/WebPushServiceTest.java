package com.wild.corp.service;

import com.wild.corp.model.PushSubscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.junit.jupiter.api.Test;
import java.security.*;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;
import nl.martijndwars.webpush.Utils;
import static org.junit.jupiter.api.Assertions.*;

class WebPushServiceTest {
    static KeyPair keyPair() throws Exception {
        Security.addProvider(new BouncyCastleProvider());
        KeyPairGenerator generator = KeyPairGenerator.getInstance("ECDH", "BC");
        generator.initialize(new ECGenParameterSpec("secp256r1"));
        return generator.generateKeyPair();
    }

    @Test void prepareUnPushChiffreAvecVapidSansAppelExterne() throws Exception {
        KeyPair server = keyPair(); KeyPair device = keyPair();
        String publicKey = Base64.getUrlEncoder().withoutPadding().encodeToString(Utils.encode((org.bouncycastle.jce.interfaces.ECPublicKey) server.getPublic()));
        String privateKey = Base64.getUrlEncoder().withoutPadding().encodeToString(Utils.encode((org.bouncycastle.jce.interfaces.ECPrivateKey) server.getPrivate()));
        WebPushService service = new WebPushService(publicKey, privateKey, "mailto:organisateur@example.test");
        PushSubscription subscription = new PushSubscription();
        subscription.setEndpoint("https://fcm.googleapis.com/fcm/send/test");
        subscription.setP256dh(Base64.getUrlEncoder().withoutPadding().encodeToString(Utils.encode((org.bouncycastle.jce.interfaces.ECPublicKey) device.getPublic())));
        subscription.setAuth(Base64.getUrlEncoder().withoutPadding().encodeToString(new byte[16]));
        NotificationService.validateSubscription(new NotificationService.SubscriptionRequest(subscription.getEndpoint(),
                new NotificationService.Keys(subscription.getP256dh(), subscription.getAuth())));
        var request = service.prepareRequest(subscription, "{\"title\":\"Confirmation\"}");
        assertEquals("POST", request.method());
        assertEquals("aes128gcm", request.headers().firstValue("Content-Encoding").orElseThrow());
        assertTrue(request.headers().firstValue("Authorization").orElseThrow().startsWith("vapid "));
        assertEquals("86400", request.headers().firstValue("TTL").orElseThrow());
        assertTrue(request.bodyPublisher().orElseThrow().contentLength() > 22);
        assertEquals(publicKey, service.getPublicKey());
    }

    @Test void configurationAbsenteDesactiveLePushEtConfigurationPartielleEchoue() {
        assertFalse(new WebPushService("", "", "").isConfigured());
        assertThrows(IllegalArgumentException.class, () -> new WebPushService("bad", "", ""));
        assertThrows(IllegalArgumentException.class, () -> new WebPushService("bad", "bad", "mailto:contact@example.test"));
    }
}
