import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, ],
  templateUrl: './passwordReset.component.html',
  styleUrl: './passwordReset.component.scss'
})
export class PasswordResetComponent implements OnInit {
  token = '';
  submitted = false;
  error = false;
  form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(12)]),
    confirmation: new FormControl('', [Validators.required])
  });

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? this.tokenFromHash();
  }

  /**
   * Secours pour les navigateurs qui ne remettent pas la query-string située
   * après le # dans ActivatedRoute avec HashLocationStrategy.
   */
  private tokenFromHash(): string {
    const queryIndex = window.location.hash.indexOf('?');
    if (queryIndex < 0) {
      return '';
    }
    return new URLSearchParams(window.location.hash.slice(queryIndex + 1)).get('token') ?? '';
  }

  save(): void {
    if (this.form.invalid || !this.token || this.form.controls.password.value !== this.form.controls.confirmation.value) {
      this.error = true;
      return;
    }
    this.error = false;
    this.authService.resetPassword(this.token, this.form.controls.password.value!).subscribe({
      next: () => this.submitted = true,
      error: () => this.error = true
    });
  }

  login(): void {
    this.router.navigate(['/evenements/management']);
  }
}
