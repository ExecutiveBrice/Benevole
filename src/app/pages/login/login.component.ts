import { Component, OnInit } from '@angular/core';
import {UserService} from "../../services/user.service";
import {User} from "../../models";
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user = new User(null,null);

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  login() {
    this.userService.login(this.user)
      .subscribe(user => {
        localStorage.setItem('token', user['token']);
        localStorage.setItem('userId', user['userId']);
        console.log('Login Successful');
        this.userService.sourceUtilisateur(this.user);
        this.router.navigate(['/dashboard']);
      }, error => {
        console.log(error);
        alert('Error logging in. Try again');
      });
  }



}
