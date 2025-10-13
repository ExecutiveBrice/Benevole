import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Benevole, Croisement, Evenement } from '../../models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { OrderByPipe } from "../../services/sort.pipe";
import { MatIconModule } from '@angular/material/icon';
import { FileService } from '../../services';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-info',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent implements OnInit {

  @Input() evenement!: Evenement;

  affiche!: string;
  constructor(
    public fileService: FileService


  ) { }
  ngOnInit(): void {
    this.getAffiche()
  }



  getAffiche() {
    this.fileService.get(this.evenement.id, 'affiche.jpeg').subscribe({
      next: (data) => {
        this.affiche = "data:image/jpeg;base64," + data
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
      }

    })
  }

}
