package com.wild.corp.model.Ressources;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CroisementRessource {

    private Integer id;

    private Integer limite;

    private Boolean besoin;

}
