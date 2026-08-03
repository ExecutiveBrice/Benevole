package com.wild.corp.service;

import com.wild.corp.model.Croisement;
import com.wild.corp.repositories.CroisementRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CroisementServiceTest {

    private final CroisementRepository repository = mock(CroisementRepository.class);
    private final CroisementService service = new CroisementService(repository);

    @Test
    void findByIdReturnsTheRepositoryResult() {
        Croisement croisement = new Croisement();
        when(repository.findById(7)).thenReturn(Optional.of(croisement));

        assertThat(service.findById(7)).isSameAs(croisement);
    }

    @Test
    void findByIdRaisesNotFoundForAnUnknownSlot() {
        when(repository.findById(404)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(404))
                .isInstanceOf(CroisementService.NotFoundException.class);
    }

    @Test
    void persistDelegatesToTheRepository() {
        Croisement croisement = new Croisement();

        service.persist(croisement);

        verify(repository).save(croisement);
    }
}
