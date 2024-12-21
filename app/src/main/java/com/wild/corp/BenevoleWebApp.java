package com.wild.corp;

import com.wild.corp.service.EmailService;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication(scanBasePackages={"com.wild.corp"})// same as @Configuration @EnableAutoConfiguration @ComponentScan
public class BenevoleWebApp {

	@Autowired
	private EmailService emailService;


	public static void main(String[] args) {
		SpringApplication springApplication = new SpringApplication(BenevoleWebApp.class);
		springApplication.run(args);
	}

	@PostConstruct
	public void initialize() throws MessagingException {

		//emailService.sendTestEmail();
	}


}