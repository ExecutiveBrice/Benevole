package com.wild.corp.service;


import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import com.mailjet.client.MailjetRequest;
import com.mailjet.client.MailjetResponse;
import com.mailjet.client.errors.MailjetException;
import com.mailjet.client.resource.Emailv31;
import com.wild.corp.model.Email;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;

import org.springframework.stereotype.Component;


@Component
@Slf4j
public class EmailService {



    public void sendSimpleMessage(Email mail){

        MailjetClient client;
        MailjetRequest request;
        MailjetResponse response;
        final ClientOptions clientOptions = ClientOptions
                .builder()
                .apiKey(System.getenv("MJ_APIKEY_PUBLIC") )
                .apiSecretKey(System.getenv("MJ_APIKEY_PRIVATE") )
                .build();

        try {

            JSONObject email = new JSONObject()
                    .put(Emailv31.Message.FROM, new JSONObject()
                            .put("Email", System.getenv("MJ_MAIL")))
                    .put(Emailv31.Message.TO, new JSONArray()
                            .put(new JSONObject().put(Emailv31.Message.EMAIL, mail.getTo()))
                    )
                    .put(Emailv31.Message.SUBJECT, mail.getSubject())
                    .put(Emailv31.Message.HTMLPART, mail.getText());



            client = new MailjetClient(clientOptions);
            request = new MailjetRequest(Emailv31.resource)
                    .property(Emailv31.MESSAGES, new JSONArray()
                            .put(email));

            response = client.post(request);
            log.info(response.getRawResponseContent());
        } catch (MailjetException e) {
            log.error("create mail MessagingException " + e);
        }

    }



}
