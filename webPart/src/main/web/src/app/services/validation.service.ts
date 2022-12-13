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

  async testCommun(organumber: number): Promise<boolean> {
    localStorage.setItem('isGestion', JSON.stringify(false))

    if (!organumber || isNaN(organumber) || organumber < 1) {
      return false
    }

    return await this.evenementService.isOpen(organumber).toPromise();
  }

  async testGestion(organumber: number, password: string): Promise<boolean> {
    localStorage.removeItem('isGestion');
    localStorage.removeItem('isValidAccessForEvent');

    if (isNaN(organumber)) {
      return false;
    } else {
      if (organumber != 0) {
        const authorisation = await this.evenementService.isAuthorize(organumber, password).toPromise();
        if (!authorisation) {
          return false;
        } else {
          localStorage.setItem('isValidAccessForEvent', JSON.stringify(organumber));
          localStorage.setItem('isGestion', JSON.stringify(true))
          return true;
        }

      } else {

        if (password != "super") {
          return false;
        }
        localStorage.setItem('isValidAccessForEvent', JSON.stringify(organumber));
        return true;
      }
    }
  }
}
