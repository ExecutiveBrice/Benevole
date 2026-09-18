import { Component, inject, Input, OnInit } from '@angular/core';
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
