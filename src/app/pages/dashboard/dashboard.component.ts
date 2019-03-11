import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { ProduitService } from '../../services';
import { Reservation, Produit } from '../../models';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnChanges {
  produits: Produit[];

  constructor(public produitService: ProduitService,
    public sanitizer: DomSanitizer) {
    this.getProduits()
  }

  ngOnChanges() {

  }

  getProduits(): void {
    this.produitService.getAll().subscribe(data => {
      console.log(data)

      this.produits = data['produits'] as Produit[]
      localStorage.setItem('produits', JSON.stringify(data['produits']));
    }),
    error => {
        console.log('😢 Oh no!', error);
    };
  }

}
