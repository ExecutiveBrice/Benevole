package com.wild.corp.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableScheduling;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
@EnableScheduling
public class SpringFoxConfig {


    @Autowired
    private Environment environment;

    @Bean
    public Docket api() {

System.out.println(environment.getProperty("server.port"));
        return new Docket(DocumentationType.SWAGGER_2).enable("true".equalsIgnoreCase(environment.getRequiredProperty("spring.swagger.enable")))
                .select()
                .apis(RequestHandlerSelectors.any())
                .paths(PathSelectors.any())
                .build();
    }
}
