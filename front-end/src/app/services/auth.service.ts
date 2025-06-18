import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  status: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

export enum UserStatus {
  ACCEPTE = 'ACCEPTE',
  EN_ATTANTE = 'EN_ATTANTE',
  REJETE = 'REJETE'
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = 'http://localhost:8888/api/auth';
  private tokenExpiryTime: number | null = null;

  constructor(private http: HttpClient) {
    // Load user from local storage when service initializes
    this.loadUserFromStorage();
  }
  
  // Load user from localStorage
  private loadUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser) as AuthResponse;
        
        // Basic validation of the stored user object
        if (user && user.token && user.role) {
          this.currentUserSubject.next(user);
          console.log('User loaded from storage:', user.role);
        } else {
          console.warn('Invalid user data in storage');
          this.performLocalLogout();
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.performLocalLogout();
    }
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    console.log('Login attempt with:', credentials.email);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          // Store user and token in local storage
          this.storeUserData(response);
        }),
        catchError(this.handleAuthError)
      );
  }

  register(user: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user)
      .pipe(
        tap(response => {
          // Store user and token in local storage
          this.storeUserData(response);
        }),
        catchError(this.handleAuthError)
      );
  }
  
  // Store user data in localStorage
  private storeUserData(response: AuthResponse): void {
    if (!response || !response.token) {
      console.error('Invalid authentication response');
      return;
    }
    
    try {
      localStorage.setItem('currentUser', JSON.stringify(response));
      this.currentUserSubject.next(response);
      console.log('User data stored successfully');
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }
  


  logout(): Observable<LogoutResponse> {
    const token = this.getToken();
    
    // If there's no token, just perform local logout
    if (!token) {
      this.performLocalLogout();
      return of({ message: 'Logged out successfully', success: true });
    }
    
    // Set up headers with the authorization token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    // Call the server to invalidate the token
    return this.http.post<LogoutResponse>(`${this.apiUrl}/logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.performLocalLogout();
        }),
        catchError(error => {
          // Even if server-side logout fails, perform local logout
          this.performLocalLogout();
          return of({ message: 'Logged out locally', success: true });
        })
      );
  }
  
  private performLocalLogout(): void {
    // Remove user from local storage
    try {
      localStorage.removeItem('currentUser');
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }
    
    this.tokenExpiryTime = null;
    this.currentUserSubject.next(null);
    console.log('User logged out locally');
  }
  

  
  // Improved error handling for authentication errors
  private handleAuthError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Une erreur s\'est produite lors de l\'authentification';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Email ou mot de passe incorrect';
          break;
        case 403:
          errorMessage = 'Accès refusé';
          break;
        case 404:
          errorMessage = 'Service d\'authentification non disponible';
          break;
        case 500:
          errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
          break;
      }
    }
    
    console.error('Auth error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  // Check if the token is expired
  isTokenExpired(): boolean {
    return false; // Simplified for now
  }

  getCurrentUser(): AuthResponse | null {
    // Check token expiry before returning the user
    if (this.isTokenExpired()) {
      console.warn('Token expired, logging out');
      this.performLocalLogout();
      return null;
    }
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!user && !!user.token;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.role === 'ADMIN';
  }

  isMembre(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.role === 'MEMBRE';
  }

  isAccepted(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.status === UserStatus.ACCEPTE;
  }

  isPending(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.status === UserStatus.EN_ATTANTE;
  }

  isRejected(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.status === UserStatus.REJETE;
  }

  getToken(): string | null {
    // Check token expiry before returning it
    if (this.isTokenExpired()) {
      console.warn('Token expired, logging out');
      this.performLocalLogout();
      return null;
    }
    const user = this.currentUserSubject.value;
    return user ? user.token : null;
  }

  getUserStatus(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.status : null;
  }
} 