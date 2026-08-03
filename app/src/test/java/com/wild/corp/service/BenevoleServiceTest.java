package com.wild.corp.service;

import com.wild.corp.model.Benevole;
import com.wild.corp.model.Croisement;
import com.wild.corp.model.Evenement;
import com.wild.corp.repositories.BenevoleRepository;
import com.wild.corp.repositories.EvenementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BenevoleServiceTest {

    @Mock
    private BenevoleRepository benevoleRepository;
    @Mock
    private CroisementService croisementService;
    @Mock
    private EvenementRepository evenementRepository;

    private BenevoleService service;

    @BeforeEach
    void setUp() {
        service = new BenevoleService(benevoleRepository, croisementService, evenementRepository);
    }

    @Test
    void addAssociatesTheEventAndPersistsTheVolunteer() {
        Benevole benevole = volunteer(1, "ada@example.org");
        Evenement evenement = new Evenement();
        evenement.setId(42);
        when(benevoleRepository.findByEmailAndEvenementId(benevole.getEmail(), 42)).thenReturn(null);
        when(evenementRepository.findById(42)).thenReturn(Optional.of(evenement));

        service.add(benevole, 42);

        assertThat(benevole.getEvenement()).isSameAs(evenement);
        verify(benevoleRepository).save(benevole);
    }

    @Test
    void addRejectsAnEmailAlreadyRegisteredForTheEvent() {
        Benevole benevole = volunteer(1, "ada@example.org");
        when(benevoleRepository.findByEmailAndEvenementId(benevole.getEmail(), 42))
                .thenReturn(volunteer(2, "ada@example.org"));

        assertThatThrownBy(() -> service.add(benevole, 42))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("existe déjà");
        verify(benevoleRepository, never()).save(benevole);
    }

    @Test
    void addRejectsAnUnknownEvent() {
        Benevole benevole = volunteer(1, "ada@example.org");
        when(evenementRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.add(benevole, 99))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Événement introuvable : 99");
        verify(benevoleRepository, never()).save(benevole);
    }

    @Test
    void updateOnlyCopiesEditableContactFields() {
        Benevole persisted = volunteer(1, "old@example.org");
        persisted.setPrenom("Ancien");
        Benevole update = volunteer(1, "new@example.org");
        update.setPrenom("Ada");
        update.setNom("Lovelace");
        update.setTelephone("0102030405");
        when(benevoleRepository.findById(1)).thenReturn(Optional.of(persisted));

        service.update(update);

        assertThat(persisted).extracting(Benevole::getPrenom, Benevole::getNom,
                        Benevole::getTelephone, Benevole::getEmail)
                .containsExactly("Ada", "Lovelace", "0102030405", "new@example.org");
        verify(benevoleRepository).save(persisted);
    }

    @Test
    void addToCroisementAddsVolunteerWhenCapacityIsAvailable() {
        Benevole benevole = volunteer(1, "ada@example.org");
        Croisement croisement = slot(5, 2, new ArrayList<>());
        when(benevoleRepository.findById(1)).thenReturn(Optional.of(benevole));
        when(croisementService.findById(5)).thenReturn(croisement);

        Benevole result = service.addToCroisement(1, 5, false);

        assertThat(result.getCroisements()).containsExactly(croisement);
        assertThat(result.getDateMaj()).isNotNull();
        assertThat(result.getAdviseSent()).isFalse();
        verify(benevoleRepository).save(benevole);
    }

    @Test
    void addToCroisementRejectsAFullSlot() {
        Benevole benevole = volunteer(1, "ada@example.org");
        Croisement croisement = slot(5, 1, List.of(volunteer(2, "grace@example.org")));
        when(benevoleRepository.findById(1)).thenReturn(Optional.of(benevole));
        when(croisementService.findById(5)).thenReturn(croisement);

        assertThatThrownBy(() -> service.addToCroisement(1, 5, false))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("pas de place");
        verify(benevoleRepository, never()).save(benevole);
    }

    @Test
    void addToCroisementCanForceAFullSlot() {
        Benevole benevole = volunteer(1, "ada@example.org");
        Croisement croisement = slot(5, 0, List.of());
        when(benevoleRepository.findById(1)).thenReturn(Optional.of(benevole));
        when(croisementService.findById(5)).thenReturn(croisement);

        service.addToCroisement(1, 5, true);

        assertThat(benevole.getCroisements()).contains(croisement);
        verify(benevoleRepository).save(benevole);
    }

    @Test
    void removeToCroisementRemovesTheExistingAssignment() {
        Croisement croisement = slot(5, 2, List.of());
        Benevole benevole = volunteer(1, "ada@example.org");
        benevole.getCroisements().add(croisement);
        when(benevoleRepository.findById(1)).thenReturn(Optional.of(benevole));
        when(croisementService.findById(5)).thenReturn(croisement);

        service.removeToCroisement(1, 5);

        assertThat(benevole.getCroisements()).isEmpty();
        verify(benevoleRepository).save(benevole);
    }

    @Test
    void findByIdReturnsNullWhenVolunteerDoesNotExist() {
        when(benevoleRepository.findById(404)).thenReturn(Optional.empty());

        assertThat(service.findById(404)).isNull();
    }

    private Benevole volunteer(int id, String email) {
        Benevole benevole = new Benevole();
        benevole.setId(id);
        benevole.setEmail(email);
        benevole.setCroisements(new ArrayList<>());
        return benevole;
    }

    private Croisement slot(int id, int limit, List<Benevole> benevoles) {
        Croisement croisement = new Croisement();
        croisement.setId(id);
        croisement.setLimite(limit);
        croisement.setBenevoles(benevoles);
        return croisement;
    }
}
