package com.wild.corp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication(scanBasePackages={"com.wild.corp"})// same as @Configuration @EnableAutoConfiguration @ComponentScan
public class BenevoleWebApp {

	public static void main(String[] args) {
		SpringApplication springApplication = new SpringApplication(BenevoleWebApp.class);
		springApplication.run(args);
	}

}