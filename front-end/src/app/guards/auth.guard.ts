import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService, UserStatus } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiresAdmin = route.data['requiresAdmin'] === true;
    const requiresMembre = route.data['requiresMembre'] === true;
    const requiresAcceptedStatus = route.data['requiresAcceptedStatus'] === true;
    
    // Log navigation attempt for debugging
    console.log('AuthGuard: Checking access to', state.url, {
      requiresAdmin,
      requiresMembre,
      requiresAcceptedStatus
    });
    
    // Check if the user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('AuthGuard: Not authenticated, redirecting to login');
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: state.url,
          source: 'guard'
        } 
      });
      return false;
    }
    
    // Get current user (this will also check token expiry)
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.log('AuthGuard: No current user (token may be expired), redirecting to login');
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: state.url,
          error: 'session_expired'
        } 
      });
      return false;
    }
    
    // Log user info for debugging
    console.log('AuthGuard: User info', {
      role: currentUser.role,
      status: currentUser.status
    });
    
    // Check if route requires accepted status
    if (requiresAcceptedStatus && currentUser.status !== UserStatus.ACCEPTE) {
      console.log('AuthGuard: User not accepted, redirecting to login');
      this.router.navigate(['/login'], {
        queryParams: {
          status: currentUser.status
        }
      });
      return false;
    }
    
    // Check if route requires admin role
    if (requiresAdmin && !this.authService.isAdmin()) {
      console.log('AuthGuard: Admin required but user is not admin');
      // Redirect non-admin users to the appropriate page based on their role
      if (currentUser.role === 'MEMBRE') {
        this.router.navigate(['/repertoire']);
      } else {
        this.router.navigate(['/home'], {
          queryParams: {
            error: 'access_denied'
          }
        });
      }
      return false;
    }
    
    // Check if route requires membre role
    if (requiresMembre && currentUser.role !== 'ADMIN' && currentUser.role !== 'MEMBRE') {
      console.log('AuthGuard: Membre required but user is not membre or admin');
      this.router.navigate(['/home'], {
        queryParams: {
          error: 'access_denied'
        }
      });
      return false;
    }
    
    console.log('AuthGuard: Access granted to', state.url);
    return true;
  }
} 