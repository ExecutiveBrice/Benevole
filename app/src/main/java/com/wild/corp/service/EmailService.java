package com.wild.corp.service;



import brevo.ApiClient;
import brevo.Configuration;
import brevo.auth.ApiKeyAuth;
import brevoApi.TransactionalEmailsApi;
import brevoModel.*;
import com.wild.corp.model.Benevole;
import com.wild.corp.model.Ressources.EmailRessource;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;



@Component
@Slf4j
public class EmailService {

    @Autowired
    BenevoleService benevoleService;

    public String sendGestionMessage(EmailRessource email) {

        email.getTo().forEach(benevoleId -> {
            StringBuilder corpsMessage = new StringBuilder(email.getText());

            Benevole benevole = benevoleService.findById(benevoleId);

            if (email.getRappel()) {
                corpsMessage.append("<br><br>N'oubliez pas que vous vous êtes inscrit en tant que bénévole pour:<br>");
                benevole.getCroisements().stream().forEach(croisement -> {

                    corpsMessage.append(croisement.getStand().getNom().equals("tous") ? "N'importe quel stand" : croisement.getStand().getNom());
                    corpsMessage.append(" - ");
                    corpsMessage.append(croisement.getCreneau().getPlage());
                    corpsMessage.append("<br>");
                });

            }

            corpsMessage.append("<br />");
            corpsMessage.append("Ceci est un mail automatique, veuillez utiliser le contact de cet évènement :");
            corpsMessage.append("<br />");
            corpsMessage.append(benevole.getEvenement().getContact());
            corpsMessage.append(" - ");
            corpsMessage.append(benevole.getEvenement().getContactEmail());
            corpsMessage.append("<br />");
            corpsMessage.append("<br />");
            corpsMessage.append("Vous pouvez revenir sur l'application à tous moments : <a href='https://www." + System.getenv("DNS_NAME") + "/benevoles/#/" + benevole.getEvenement().getId() + "'>https://www." + System.getenv("DNS_NAME") + "/benevoles/#/" + benevole.getEvenement().getId() + "</a>");
            corpsMessage.append("<br />");

            List<String> destinataires = new ArrayList<>();
            if(benevole.getEvenement().getNotification()){
                destinataires.add(benevole.getEmail());
            }

            if(benevole.getEvenement().getCopie()){
                destinataires.add(benevole.getEvenement().getContactEmail());
            }

            singleMessage(destinataires, corpsMessage.toString(), email.getSubject(), benevole.getPrenom(), benevole.getNom());
        });
        return "ok";
    }

    /** Envoie un lien à usage unique ; le jeton n'est jamais écrit dans les logs. */
    public void sendPasswordResetMessage(String email, String resetUrl) {
        String message = "<p>Une demande de réinitialisation de votre mot de passe a été reçue.</p>"
                + "<p><a href='" + resetUrl + "'>Choisir un nouveau mot de passe</a></p>"
                + "<p>Ce lien est valable 30 minutes et ne peut être utilisé qu'une fois.</p>"
                + "<p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>";

        log.error(message);

        singleMessage(List.of(email), message, "Réinitialisation de votre mot de passe", "", "");
    }

    public void sendAdministratorInvitationMessage(String email, String resetUrl) {
        String message = "<p>Un compte administrateur vient d'être créé pour vous.</p>"
                + "<p><a href='" + resetUrl + "'>Choisir votre mot de passe</a></p>"
                + "<p>Ce lien est valable 30 minutes et ne peut être utilisé qu'une fois.</p>";

        singleMessage(List.of(email), message, "Invitation à administrer l'application", "", "");
    }

    public void singleMessage(List<String> destinataires, String text, String sujet, String prenom, String nom) {

        Properties prop = new Properties();
        prop.put("mail.debug", "false");
        prop.put("mail.smtp.auth", "true");
        prop.put("mail.smtp.ssl.protocols", "TLSv1.2");
        prop.put("mail.smtp.host", "smtp-relay.brevo.com");
        prop.put("mail.smtp.starttls.enable", "true");
        prop.put("mail.smtp.ssl.trust", "smtp-relay.brevo.com");
        prop.put("mail.smtp.port", "587");
        prop.put("mail.smtp.socketFactory.port", "587");
        prop.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");


        String brevoApiKey = System.getenv("BREVO_APIKEY_PRIVATE");
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            // Nom utilisé par le docker-compose de cette application.
            brevoApiKey = System.getenv("MJ_APIKEY_PRIVATE");
        }
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            log.error("Aucune clé API Brevo n'est configurée : l'e-mail ne peut pas être envoyé");
            return;
        }

        ApiClient defaultClient = Configuration.getDefaultApiClient();
        // Configure API key authorization: api-key
        ApiKeyAuth apiKey = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
        apiKey.setApiKey(brevoApiKey);

        try {
            log.info("Send singlemessage to {}",destinataires );

            TransactionalEmailsApi api = new TransactionalEmailsApi();
            SendSmtpEmailSender sender = new SendSmtpEmailSender();
            sender.setEmail("adhesion@alod.fr");
            sender.setName("ALOD");
            List<SendSmtpEmailTo> toList = new ArrayList<>();
            destinataires.forEach(destinataire -> {
                SendSmtpEmailTo to = new SendSmtpEmailTo();
                to.setEmail(destinataire);
                toList.add(to);
            });

            SendSmtpEmailReplyTo replyTo = new SendSmtpEmailReplyTo();
            replyTo.setEmail("adhesion@alod.fr");
            replyTo.setName("ALOD");

            SendSmtpEmail sendSmtpEmail = new SendSmtpEmail();
            sendSmtpEmail.setSender(sender);
            sendSmtpEmail.setTo(toList);

            sendSmtpEmail.setHtmlContent(text);

            sendSmtpEmail.setSubject(sujet);
            sendSmtpEmail.setReplyTo(replyTo);

            CreateSmtpEmail response = api.sendTransacEmail(sendSmtpEmail);
            log.info(response.toString());
        } catch (Exception e) {
            log.warn("Exception occurred:- " + e.getMessage());
        }

    }
}
