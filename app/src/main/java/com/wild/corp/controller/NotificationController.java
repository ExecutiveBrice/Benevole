package com.wild.corp.controller;

import com.wild.corp.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notifications;
    private final WebPushService webPush;
    private final BenevoleService benevoles;
    private final AccesParametrageService access;

    public NotificationController(NotificationService notifications, WebPushService webPush,
                                  BenevoleService benevoles, AccesParametrageService access) {
        this.notifications = notifications;
        this.webPush = webPush;
        this.benevoles = benevoles;
        this.access = access;
    }

    @GetMapping("/config")
    public Map<String, Object> config() {
        return Map.of("enabled", webPush.isConfigured(), "publicKey", webPush.getPublicKey());
    }

    @PostMapping("/identity")
    public NotificationService.Identity identify(@RequestHeader("X-Notification-Token") String token) {
        return notifications.identify(token);
    }

    @PostMapping("/subscriptions")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void subscribe(@RequestHeader("X-Notification-Token") String token,
                          @RequestBody NotificationService.SubscriptionRequest request) {
        notifications.subscribe(token, request);
    }

    public record Endpoint(String endpoint) {}

    @PostMapping("/subscriptions/status")
    public Map<String, Boolean> status(@RequestHeader("X-Notification-Token") String token, @RequestBody Endpoint request) {
        return Map.of("active", notifications.status(token, request.endpoint()));
    }

    @DeleteMapping("/subscriptions")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unsubscribe(@RequestHeader("X-Notification-Token") String token, @RequestBody Endpoint request) {
        notifications.unsubscribe(token, request.endpoint());
    }

    @PostMapping("/invitations")
    public Map<String, String> invitation(@RequestParam Integer benevoleId, Authentication authentication) {
        var benevole = benevoles.findById(benevoleId);
        if (benevole == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        access.evenement(authentication.getName(), benevole.getEvenement().getId());
        return Map.of("url", notifications.invitation(benevole));
    }
}
