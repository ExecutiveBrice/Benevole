package com.wild.corp.model.Ressources;

import lombok.Data;

import java.util.Set;

@Data
public class EmailRessource {

        Set<Integer> to;
        String subject;
        String text;
        Boolean rappel;

}
