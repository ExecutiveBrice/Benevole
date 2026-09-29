import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Benevole, Croisement, Evenement } from '../../models';
import { OrderByPipe } from "../../services/sort.pipe";
import { FileService } from '../../services';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-info',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, ],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent implements OnInit {

  @Input() evenement!: Evenement;

  affiche!: string;
  constructor(
    public fileService: FileService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }
  ngOnInit(): void {
    this.getAffiche()
  }



  getAffiche() {
    this.fileService.get(this.evenement.id, 'affiche.jpeg').subscribe({
      next: (data) => {
        this.affiche = "data:image/jpeg;base64," + data
        // L'affiche est chargée après le premier rendu de la colonne Info.
        // Marquer le composant garantit que l'image est affichée dès réception.
        this.changeDetectorRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
      }

    })
  }

}
