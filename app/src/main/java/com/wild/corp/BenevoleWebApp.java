package com.wild.corp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages={"com.wild.corp"})// same as @Configuration @EnableAutoConfiguration @ComponentScan
public class BenevoleWebApp {

public static void main(String[] args) {
		SpringApplication springApplication = new SpringApplication(BenevoleWebApp.class);
		springApplication.run(args);
	}


}