package com.wild.corp.service;


import brevoApi.*;
import brevoModel.*;
import com.mailersend.sdk.MailerSend;
import com.mailersend.sdk.MailerSendResponse;
import com.mailersend.sdk.emails.Email;
import com.mailersend.sdk.exceptions.MailerSendException;
import com.wild.corp.model.Benevole;
import com.wild.corp.model.Ressources.EmailRessource;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Properties;


import brevo.ApiClient;
import brevo.Configuration;
import brevo.auth.ApiKeyAuth;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.List;


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
            //sendSimpleMessage(benevole.getPrenom() + " " + benevole.getNom(), benevole.getEmail(), email.getSubject(), corpsMessage.toString(), null);
        });
        return "ok";
    }

//
//    public void sendSimpleMessage2(String nom, String adresseMail, String sujet, String corps) {
//
//        MailerSend ms = new MailerSend();
//        ms.setToken(System.getenv("MAILSENDER_KEY"));
//        Email email = new Email();
//        email.subject = sujet;
//        email.html = corps;
//        email.addRecipient(nom, adresseMail);
//        email.setFrom("ALOD bénévoles", "benevole@" + System.getenv("DNS_NAME"));
//
//        try {
//            MailerSendResponse response = ms.emails().send(email);
//            System.out.println(response.messageId);
//        } catch (MailerSendException e) {
//            e.printStackTrace();
//        }
//
//    }


    public void sendSimpleMessage(String nom, String adresseMail, String sujet, String corps, String copieEmail) {
        Properties prop = new Properties();
        prop.put("mail.debug", "false");
        prop.put("mail.smtp.auth", "true");
        prop.put("mail.smtp.ssl.protocols", "TLSv1.2");
        prop.put("mail.smtp.host", "ssl0.ovh.net");
        prop.put("mail.smtp.starttls.enable", "true");
        prop.put("mail.smtp.ssl.trust", "ssl0.ovh.net");
        prop.put("mail.smtp.port", "587");
        prop.put("mail.smtp.socketFactory.port", "587");
        prop.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");

        String fromEmail = "benevole@alod.fr";

        Session session = Session.getInstance(prop, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(fromEmail, System.getenv("PASSWORD_OVHMAIL"));
            }
        });

        MimeMessage message = new MimeMessage(session);
        try {
            message.setFrom(new InternetAddress(fromEmail));
            message.setRecipients(
                    Message.RecipientType.TO, InternetAddress.parse(adresseMail));
            if(copieEmail != null) {
                message.addRecipients(Message.RecipientType.CC, InternetAddress.parse(copieEmail));
            }
            message.setSubject(sujet);

            MimeBodyPart mimeBodyPart = new MimeBodyPart();
            mimeBodyPart.setContent(corps, "text/html; charset=utf-8");

            Multipart multipart = new MimeMultipart();
            multipart.addBodyPart(mimeBodyPart);
            message.setContent(multipart);
            Transport.send(message);
        } catch (MessagingException e) {
            log.error("error sending message "+message);
        }
    }


}
