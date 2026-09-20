import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Croisement, Evenement } from '../../models';
import { OrderByPipe } from '../../services/sort.pipe';

@Component({
  selector: 'app-selection-button',
  // Le planning met à jour les propriétés du croisement après la réponse HTTP.
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
  imports: [NgClass, OrderByPipe],
  templateUrl: './selectionButton.component.html',
  styleUrl: './selectionButton.component.scss'
})
export class SelectionButtonComponent {
  @Input({ required: true }) croisement!: Croisement;
  @Input({ required: true }) evenement!: Evenement;
  @Output() selection = new EventEmitter<Croisement>();
}
