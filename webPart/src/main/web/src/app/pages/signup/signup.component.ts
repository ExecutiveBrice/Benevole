import { Component, OnInit } from '@angular/core';
import {User} from "../../models";
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  user = new User(null,null,null);

  constructor(
    private router: Router,
    private UserService: UserService
  ) { }

  ngOnInit() {
  }

  signup() {
    if (this.user.email === null || this.user.password == null || this.user.name === null) {
      return alert('Need to fill in all fields');
    }
    this.UserService.signup(this.user)
      .subscribe(user => {
        this.router.navigate(['/login']);
      }, error => {
        console.log(error);
        if (error.status === 401) {
          alert('Email is already taken. Login or try another');
        } else {
          alert('Error signing up. Try again');
        }
      });
  }

}
