import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { User } from '../shared/interfaces/user.interface';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { TechniqueService } from './technique.service';

const CURRENT_USER_KEY = 'current_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private techniqueService: TechniqueService
  ) {}

  signUp(userData: User) {
    return this.http.post(`${environment.apiUrl}/auth/register`, userData);
  }

  logIn(credentials: { email: string; password: string }) {
    return this.http.post<{ access_token: string; user: Pick<User, 'name' | 'email'> }>(
      `${environment.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        console.log(response)
        this.tokenService.setToken(response.access_token);

        // Persist a safe subset for UI display.
        const safeUser = {
          name: response.user?.name ?? '',
          email: response.user?.email ?? '',
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
      })
    );
  }

  logOut() {
    this.tokenService.clearToken();
    this.techniqueService.resetTechniquesState();
    localStorage.removeItem(CURRENT_USER_KEY);
    this.router.navigate(['/log-in']);
    Swal.fire({
      title: "Sesión cerrada",
      text: "Has cerrado sesión correctamente.",
      icon: "info",
      confirmButtonText: "Aceptar"
    });
  }

  getCurrentUserName(): string | null {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { name?: string };
      return parsed?.name?.trim() ? parsed.name.trim() : null;
    } catch {
      return null;
    }
  }

  getCurrentUserEmail(): string | null {
    const payload = this.tokenService.decodeToken();
    return payload?.email ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.tokenService.getToken() && !this.tokenService.isTokenExpired();
  }

  getCurrentUserId(): number | null {
    const payload = this.tokenService.decodeToken();
    return payload?.sub ?? null; // 
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }
}
