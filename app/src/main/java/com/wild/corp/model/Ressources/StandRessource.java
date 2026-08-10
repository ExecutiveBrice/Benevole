package com.wild.corp.model.Ressources;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class StandRessource {

    private Integer id;

    private String nom;

    private Integer ordre;

    private Integer type;

    private String soustitre;

    private List<CroisementRessource> croisements;

}
