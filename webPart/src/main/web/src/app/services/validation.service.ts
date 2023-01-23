import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EvenementService, ConfigService } from '.';


@Injectable()
export class ValidationService {

  constructor(
    public route: ActivatedRoute,
    public configService: ConfigService,
    public evenementService: EvenementService,
    public router: Router
  ) { }

  async testCommun(idEvenement: number): Promise<boolean> {
    localStorage.setItem('isGestion', JSON.stringify(false))

    if (!idEvenement || isNaN(idEvenement) || idEvenement < 1) {
      return false
    }

    return await this.evenementService.isOpen(idEvenement).toPromise();
  }

  async testGestion(idEvenement: number, password: string): Promise<boolean> {
    localStorage.removeItem('isGestion');
    localStorage.removeItem('isValidAccessForEvent');

    if (isNaN(idEvenement)) {
      return false;
    } else {
      if (idEvenement != 0) {
        const authorisation = await this.evenementService.isAuthorize(idEvenement, password).toPromise();
        if (!authorisation) {
          return false;
        } else {
          localStorage.setItem('isValidAccessForEvent', JSON.stringify(idEvenement));
          localStorage.setItem('isGestion', JSON.stringify(true))
          return true;
        }

      } else {

        if (password != "super") {
          return false;
        }
        localStorage.setItem('isValidAccessForEvent', JSON.stringify(idEvenement));
        return true;
      }
    }
  }
}
