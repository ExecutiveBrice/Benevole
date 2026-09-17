import { Component, Input } from '@angular/core';
import { Evenement } from '../../models';

@Component({
  selector: 'app-event-card',
  standalone: true,
  templateUrl: './eventCard.component.html',
  styleUrl: './eventCard.component.scss'
})
export class EventCardComponent {
  @Input({ required: true }) evenement!: Evenement;
  @Input({ required: true }) title!: string;
}
