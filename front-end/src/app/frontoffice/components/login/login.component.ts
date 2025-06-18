import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService, AuthRequest, UserStatus } from '../../../services/auth.service';

import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData: AuthRequest = {
    email: '',
    password: ''
  };

  rememberMe = false;
  isLoading = false;
  errorMessage = '';
  statusMessage = '';
  returnUrl: string = '/home';
  isIOSSafari = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    
    // Check for error parameters
    const error = this.route.snapshot.queryParams['error'];
    if (error === 'session_expired') {
      this.errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
    } else if (error === 'access_denied') {
      this.errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    }
    
   
    
    // Already logged in? Redirect based on role and status
    if (this.authService.isAuthenticated()) {
      this.checkUserStatusAndRedirect();
    }
    
    // Check if we're on a mobile device
    this.checkMobileDevice();
  }
  
 
  
  private checkMobileDevice(): void {
    // Simple check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      console.log('Mobile device detected');
      
      // Check specifically for iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isIOS && isSafari) {
        console.log('iOS Safari detected - showing special instructions');
        this.isIOSSafari = true;
      }
    }
  }

  onSubmit() {
    // Clear previous messages
    this.errorMessage = '';
    this.statusMessage = '';

    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Check user status and redirect accordingly
          if (response.status === UserStatus.ACCEPTE) {
            // User is accepted, redirect based on role
            if (response.role === 'ADMIN') {
              this.router.navigate(['/espace-admin']);
            } else if (response.role === 'MEMBRE') {
              this.router.navigate(['/repertoire']);
            } else {
              this.router.navigate([this.returnUrl]);
            }
          } else if (response.status === UserStatus.EN_ATTANTE) {
            // User is pending approval - show status message instead of error
            this.statusMessage = 'Votre compte est en attente d\'approbation par un administrateur. Vous serez notifié par email lorsque votre compte sera activé.';
            console.log('Status message set:', this.statusMessage);
          } else if (response.status === UserStatus.REJETE) {
            // User is rejected - show status message instead of error
            this.statusMessage = 'Votre demande d\'inscription a été rejetée. Veuillez contacter l\'administration pour plus d\'informations.';
            console.log('Status message set:', this.statusMessage);
            // Logout the user since they are rejected
            this.authService.logout().subscribe();
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          
          if (error.status === 401) {
            this.errorMessage = 'Email ou mot de passe incorrect.';
          } else if (error.status === 0) {
            // Network error - likely CORS or server down
            this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet ou réessayez plus tard.';
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
          }
          
          // Log additional info for debugging
          console.log('Device info:', {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            vendor: navigator.vendor
          });
        }
      });
  }

  private checkUserStatusAndRedirect() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Check user status
    if (currentUser.status === UserStatus.ACCEPTE) {
      // User is accepted, redirect based on role
      if (currentUser.role === 'ADMIN') {
        this.router.navigate(['/espace-admin']);
      } else if (currentUser.role === 'MEMBRE') {
        this.router.navigate(['/repertoire']);
      } else {
        this.router.navigate([this.returnUrl]);
      }
    } else if (currentUser.status === UserStatus.EN_ATTANTE) {
      // User is pending approval
      this.statusMessage = 'Votre compte est en attente d\'approbation par un administrateur. Vous serez notifié par email lorsque votre compte sera activé.';
    } else if (currentUser.status === UserStatus.REJETE) {
      // User is rejected
      this.statusMessage = 'Votre demande d\'inscription a été rejetée. Veuillez contacter l\'administration pour plus d\'informations.';
      // Logout the user since they are rejected
      this.authService.logout().subscribe();
    }
  }
}
