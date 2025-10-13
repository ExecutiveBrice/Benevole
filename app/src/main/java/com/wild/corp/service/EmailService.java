package com.wild.corp.service;



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
            sendSimpleMessage(benevole.getEvenement().getNotification()?benevole.getEmail():"", email.getSubject(), corpsMessage.toString(), benevole.getEvenement().getCopie()?benevole.getEvenement().getContactEmail():"");
        });
        return "ok";
    }


    public void sendSimpleMessage(String adresseMail, String sujet, String corps, String copieEmail) {
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
            if(StringUtils.isEmpty(adresseMail)) {
                message.addRecipients(Message.RecipientType.TO, InternetAddress.parse(adresseMail));
            }
            if(StringUtils.isEmpty(copieEmail)) {
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
