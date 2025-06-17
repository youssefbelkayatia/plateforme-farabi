import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private router: Router) {}
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  isLoading = false;
  errorMessage = '';

  onSubmit() {
  this.router.navigate(['/espace-admin']);
    // if (!this.loginData.email || !this.loginData.password) {
    //   this.errorMessage = 'Veuillez remplir tous les champs.';
    //   return;
    // }

    // this.isLoading = true;
    // this.errorMessage = '';

    // // Simulate API call
    // setTimeout(() => {
    //   // In a real app, this would be an API call to authenticate
    //   console.log('Login attempt with:', this.loginData);
      
    //   // For demo purposes, let's pretend authentication was successful
    //   this.isLoading = false;
      
    //   // Uncomment to simulate an error
    //   // this.errorMessage = 'Email ou mot de passe incorrect.';
      
    //   // Redirect would happen here in a real app
    //   // this.router.navigate(['/dashboard']);
    // }, 1500);
  }
}
