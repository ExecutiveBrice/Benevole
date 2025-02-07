package com.wild.corp.service;


import com.mailersend.sdk.MailerSend;
import com.mailersend.sdk.MailerSendResponse;
import com.mailersend.sdk.emails.Email;
import com.mailersend.sdk.exceptions.MailerSendException;
import com.wild.corp.model.Benevole;
import com.wild.corp.model.Ressources.EmailRessource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


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
            corpsMessage.append("Il ne sert à rien d'y répondre, veuillez utiliser le contact de cet évènement :<br />");

            corpsMessage.append(benevole.getEvenement().getContact());
            corpsMessage.append(" - ");
            corpsMessage.append(benevole.getEvenement().getContactEmail());
            corpsMessage.append("<br />");

            sendSimpleMessage(benevole.getPrenom() + " " + benevole.getNom(), benevole.getEmail(), email.getSubject(), corpsMessage.toString());
        });
        return "ok";
    }


    public void sendSimpleMessage(String nom, String adresseMail, String sujet, String corps) {

        MailerSend ms = new MailerSend();
        ms.setToken(System.getenv("MAILSENDER_KEY"));
        Email email = new Email();
        email.subject = sujet;
        email.html = corps;
        email.addRecipient(nom, adresseMail);
        email.setFrom("ALOD bénévoles", "benevole@"+System.getenv("DNS_NAME"));

        try {
            MailerSendResponse response = ms.emails().send(email);
            System.out.println(response.messageId);
        } catch (MailerSendException e) {
            e.printStackTrace();
        }

    }


}
