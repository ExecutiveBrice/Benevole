package com.wild.corp.model.Ressources;

import java.util.Set;

/** Vue publique d'un administrateur : aucun secret n'est retourné. */
public record AdministrateurRessource(Integer id, String username, boolean enabled, boolean global,
                                      Set<Integer> evenementIds) {
}
