package com.wild.corp.service;


import com.wild.corp.configuration.Constante;
import com.wild.corp.model.Email;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.util.Objects;


@Component
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private Environment environment;

    public void sendSimpleMessage(Email mail) {
        MimeMessage message = emailSender.createMimeMessage();

        MimeMessageHelper helper = null;
        try {
            helper = new MimeMessageHelper(message, true);
            helper.setFrom(Objects.requireNonNull(environment.getProperty("spring.mail.username")));
            helper.setTo(mail.getTo());
            helper.setSubject(mail.getSubject());
            helper.setText(mail.getText(),true);


        } catch (MessagingException e) {
            e.printStackTrace();
        }

        try {
            emailSender.send(message);
        } catch (MailException e) {
            log.error("send mail " + e);
        }
    }


}
