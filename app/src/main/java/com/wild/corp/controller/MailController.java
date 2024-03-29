package com.wild.corp.controller;



import com.wild.corp.model.Email;
import com.wild.corp.model.Stand;
import com.wild.corp.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/email")
public class MailController {

    @Autowired
    private EmailService emailService;



    @RequestMapping(value = "/", method = RequestMethod.POST)
    public ResponseEntity<Stand> send(@RequestBody Email mail) {

        emailService.sendSimpleMessage(mail);

        return new ResponseEntity<>(HttpStatus.OK);
    }



}
