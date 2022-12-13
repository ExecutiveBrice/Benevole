
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})

export class ErrorComponent {
  text:string

  constructor(  
    public route: ActivatedRoute,
    public router: Router,
    public sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    console.log(this.route.pathFromRoot);
  }

}