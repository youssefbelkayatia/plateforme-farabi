import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RegisterRequest } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerData = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  acceptTerms = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    // Reset error message
    this.errorMessage = '';
    
    // Validate form
    if (!this.registerData.prenom || !this.registerData.nom || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
      return;
    }
    
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }
    
    if (!this.acceptTerms) {
      this.errorMessage = 'Vous devez accepter les conditions d\'utilisation.';
      return;
    }
    
    if (this.registerData.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    
    this.isLoading = true;
    
    // Create RegisterRequest object
    const registerRequest: RegisterRequest = {
      nom: this.registerData.nom,
      prenom: this.registerData.prenom,
      email: this.registerData.email,
      password: this.registerData.password,
      role: 'MEMBRE' // Set default role to MEMBRE
    };
    
    // Call auth service to register
    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Navigate to login page after successful registration
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'inscription.';
      }
    });
  }
}
