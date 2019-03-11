import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Reservation, Produit, User } from '../../models';
import { ReservationService, ProduitService, UserService } from '../../services';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  nouveau: Boolean = false;
  modification: Boolean = false;

  @Input() utilisateur: User;

  uploadedImage: File;
  spinner_overlay = false;
  produit: Produit;
  produits: Produit[];
  reservation: Reservation = new Reservation();

  constructor(
    public produitService: ProduitService,
    public reservationService: ReservationService,
    public router: Router,
    private route: ActivatedRoute,
    private ng2ImgMax: Ng2ImgMaxService,
    public sanitizer: DomSanitizer,
    private utilisateurService: UserService) {


    console.log(JSON.parse(localStorage.getItem('produits')))
    this.produits = JSON.parse(localStorage.getItem('produits'));


    if (this.route.snapshot.paramMap.get('produit') == 'nouveau') {
      this.nouveau = true;
      this.produit = {
        description: '',
        image: '',
        nom: '',
        tarif: '',
      }
      console.log('coucou')
    }

    console.log(this.route.snapshot.paramMap.get('produit'))

    this.getProduit(this.route.snapshot.paramMap.get('produit'))


    console.log('DetailComponent')
    if (JSON.parse(localStorage.getItem('userId'))) {
        this.utilisateur = {
            name: JSON.parse(localStorage.getItem('userId')),
            email: "",
            password: ''
        };
    }
    console.log(this.utilisateur)

  }

  ngOnInit(): void {

  }


  commander(reservation :Reservation): void {
    this.spinner_overlay = true;
    reservation.produit = this.produit.nom
    reservation.etat = "nouveau"
    reservation.alerte = 1
        console.log(reservation)
    this.reservationService.add(reservation).subscribe(data => {
      console.log(data)
      this.spinner_overlay = false;
    }),
      error => {
        this.spinner_overlay = false;
        console.log('😢 Oh no!', error);
      }

  }


  saveResto(): void {
    this.spinner_overlay = true;

    console.log(this.produit)
    this.produitService.add(this.produit).subscribe(data => {
      console.log(data)
      this.spinner_overlay = false;
    }),
      error => {
        this.spinner_overlay = false;
        console.log('😢 Oh no!', error);
      }
    this.modification = false;
  }

  updateResto(): void {
    this.spinner_overlay = true;

    this.produitService.update(this.produit).subscribe(data => {
      console.log(data)
      this.spinner_overlay = false;
    }),
      error => {
        this.spinner_overlay = false;
        console.log('😢 Oh no!', error);
      }
    this.modification = false;
  }



  getProduit(name: string): void {
    this.spinner_overlay = true;
    this.produits.forEach(produit => {
      if (name == produit.nom) {
        console.log(produit)
        this.produit = produit;
      }
    });
    this.spinner_overlay = false;
  }



  onImageChange(event) {
    this.spinner_overlay = true;
    let image = event.target.files[0];

    this.ng2ImgMax.resizeImage(image, 500, 500).subscribe(
      result => {
        console.log('image converted');
        this.uploadedImage = new File([result], result.name);
        this.getImagePreview(this.uploadedImage);
        this.spinner_overlay = false;
        console.log(this.uploadedImage)
      },
      error => {
        console.log('😢 Oh no!', error);
        this.spinner_overlay = false;
      }
    );

  }

  getImagePreview(file: File) {
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result)
      this.produit.image = reader.result;
    };
  }

}
