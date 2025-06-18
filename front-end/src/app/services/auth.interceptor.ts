import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token for auth endpoints
    if (request.url.includes('/api/auth/')) {
      return next.handle(request);
    }

    const token = this.authService.getToken();
    
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // JWT token is expired or invalid
          console.error('Authentication error (401):', error);
          
          // Log the current URL to help with debugging
          console.log('Current URL:', window.location.href);
          
          // Clear any existing authentication data
          this.authService.logout().subscribe();
          
          // Redirect to login page with return URL
          this.router.navigate(['/login'], { 
            queryParams: { 
              returnUrl: this.router.url,
              error: 'session_expired'
            } 
          });
        } else if (error.status === 403) {
          console.error('Authorization error (403):', error);
          // Handle forbidden errors - could be permission issues
          this.router.navigate(['/home'], { 
            queryParams: { 
              error: 'access_denied'
            } 
          });
        } else if (error.status === 0) {
          // This is typically a CORS or network connectivity issue
          console.error('Network error:', error);
          // You could show a user-friendly message here
        }
        
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
} 