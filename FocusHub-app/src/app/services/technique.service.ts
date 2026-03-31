import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Technique } from '../shared/interfaces/technique.interface';
import { TokenService } from './token.service';
import { Observable, forkJoin, of, tap, catchError, map } from 'rxjs';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface TechniquesUiState {
  selectedTechniqueName: string | null;
  currentMode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  pomodoroCount: number;
  lastUpdatedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class TechniqueService {


  public techniques = signal<Technique[]>([]);
  public techniquesMap = signal<Record<string, Technique>>({});
  public currentFocusSessionId = signal<number | null>(null);
  public techniquesUiState = signal<TechniquesUiState>({
    selectedTechniqueName: null,
    currentMode: 'work',
    timeLeft: 0,
    isRunning: false,
    pomodoroCount: 0,
    lastUpdatedAt: Date.now(),
  });

  private readonly baseUrl = 'http://localhost:3000/productivity/techniques';
  private readonly sessionsUrl = 'http://localhost:3000/productivity/focus-sessions';
  private readonly sessionTasksUrl = 'http://localhost:3000/productivity/focus-session-tasks';
  private readonly techniquesStateKey = 'focushub-techniques-state';
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  constructor() {
    this.hydrateTechniquesUiState();
  }

  private getUserId(): number | null {
    console.log("ID CON EL SUB: ",this.tokenService.decodeToken()?.sub);
    return this.tokenService.decodeToken()?.sub ?? null;
  }

  private hydrateTechniquesUiState(): void {
    const stored = sessionStorage.getItem(this.techniquesStateKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as TechniquesUiState;
      this.techniquesUiState.set({
        selectedTechniqueName: parsed.selectedTechniqueName ?? null,
        currentMode: parsed.currentMode ?? 'work',
        timeLeft: typeof parsed.timeLeft === 'number' ? parsed.timeLeft : 0,
        isRunning: !!parsed.isRunning,
        pomodoroCount: typeof parsed.pomodoroCount === 'number' ? parsed.pomodoroCount : 0,
        lastUpdatedAt: typeof parsed.lastUpdatedAt === 'number' ? parsed.lastUpdatedAt : Date.now(),
      });
    } catch (error) {
      console.warn('Could not parse persisted techniques UI state:', error);
      sessionStorage.removeItem(this.techniquesStateKey);
    }
  }

  private persistTechniquesUiState(): void {
    sessionStorage.setItem(this.techniquesStateKey, JSON.stringify(this.techniquesUiState()));
  }

  updateTechniquesUiState(partial: Partial<TechniquesUiState>): void {
    this.techniquesUiState.update((current) => ({
      ...current,
      ...partial,
      lastUpdatedAt: Date.now(),
    }));
    this.persistTechniquesUiState();
  }

  setSelectedTechnique(name: string): void {
    this.updateTechniquesUiState({ selectedTechniqueName: name });
  }

fetchTechniques(): Observable<Technique[]> {
  const userId = this.getUserId();
  console.log(`🔄 Fetching techniques (global + user${userId ? ` ${userId}` : ''})`);

  const global$ = this.http
    .get<Technique[]>(`${this.baseUrl}/global`, this.getHeaders())
    .pipe(catchError(() => of([])));

  const user$ = userId
    ? this.http
        .get<Technique[]>(`${this.baseUrl}?userId=${userId}`, this.getHeaders())
        .pipe(catchError(() => of([])))
    : of([]);

  return forkJoin([global$, user$]).pipe(
    map(([global, user]) => [...global, ...user]),
    tap((fetched) => {
      console.log('📦 Techniques fetched from server (merged):', fetched);

      // 1️⃣ Actualizamos el array
      this.techniques.set(fetched);

      // 2️⃣ Construimos el mapa desde cero
      const newMap: Record<string, Technique> = {};
      fetched.forEach(t => {
        newMap[t.name] = t;
      });

      this.techniquesMap.set(newMap);
    })
  );
}

  getTechnique(name: string): Technique | undefined {
    return this.techniquesMap()[name];
  }

  addTechnique(techniqueData: any): Observable<Technique> {
    console.log("Adding technique:", techniqueData);
    const userId = this.getUserId();
    if (!userId) {
      console.error('No userId found');
      return new Observable<Technique>();
    }

    return this.http.post<Technique>(`${this.baseUrl}?userId=${userId}`, techniqueData, this.getHeaders()).pipe(
      tap((newTechnique) => {
        const currentList = this.techniques();
        const currentMap = this.techniquesMap();

        // Avoid duplicates
        if (!currentList.some(t => t.name === newTechnique.name)) {
          this.techniques.set([...currentList, newTechnique]);
        }

        if (!currentMap[newTechnique.name]) {
          this.techniquesMap.set({ ...currentMap, [newTechnique.name]: newTechnique });
        }
      }),
      catchError((error) => {
        console.error('Error adding technique:', error);
        throw error;
      })
    );
  }

  updateTechnique(name: string, updated: Technique): Observable<Technique> {
    const userId = this.getUserId();
    if (!userId) {
      console.error('No userId found');
      return new Observable<Technique>();
    }

    return this.http.patch<Technique>(`${this.baseUrl}/${name}?userId=${userId}`, updated, this.getHeaders()).pipe(
      tap((updatedTechnique) => {
        const updatedList = this.techniques().map(t =>
          t.name === name ? updatedTechnique : t
        );
        this.techniques.set(updatedList);

        const currentMap = this.techniquesMap();
        this.techniquesMap.set({
          ...currentMap,
          [updatedTechnique.name]: updatedTechnique
        });
      })
    );
  }

  deleteTechnique(name: string): Observable<void> {
    const userId = this.getUserId();
    if (!userId) {
      console.error('No userId found');
      return new Observable<void>();
    }

    return this.http.delete<void>(`${this.baseUrl}/${name}?userId=${userId}`, this.getHeaders()).pipe(
      tap(() => {
        const updatedList = this.techniques().filter(t => t.name !== name);
        this.techniques.set(updatedList);

        const currentMap = { ...this.techniquesMap() };
        delete currentMap[name];
        this.techniquesMap.set(currentMap);
      })
    );
  }

  exists(name: string): boolean {
    return !!this.getTechnique(name);
  }

  private getHeaders() {
    const token = this.tokenService.getToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  private buildTechniqueMap(techniques: Technique[]): Record<string, Technique> {
    return techniques.reduce((acc, t) => {
      acc[t.name] = t;
      return acc;
    }, {} as Record<string, Technique>);
  }

  // Focus Sessions Methods
  createFocusSession(userId: number, techniqueId: number): Observable<any> {
    const sessionData = {
      userId,
      techniqueId,
      status: 'in_progress',
    };
    return this.http.post<any>(`${this.sessionsUrl}`, sessionData, this.getHeaders()).pipe(
      tap((session) => {
        this.currentFocusSessionId.set(session.id);
        console.log('✅ Focus session created:', session);
      })
    );
  }

  getActiveFocusSession(userId: number): Observable<any> {
    return this.http.get<any>(`${this.sessionsUrl}/active/${userId}`, this.getHeaders()).pipe(
      tap((session) => {
        this.currentFocusSessionId.set(session.id);
        console.log('✅ Active focus session retrieved:', session);
      }),
      catchError((error) => {
        console.warn('No active focus session found:', error);
        return of(null);
      })
    );
  }

  updateFocusSessionStatus(sessionId: number, status: 'in_progress' | 'paused' | 'completed'): Observable<any> {
    return this.http.patch<any>(`${this.sessionsUrl}/${sessionId}`, { status }, this.getHeaders()).pipe(
      tap((session) => {
        console.log(`✅ Focus session updated to ${status}:`, session);
      })
    );
  }

  addTaskToFocusSession(focusSessionId: number, taskId: number): Observable<any> {
    return this.http.post<any>(`${this.sessionTasksUrl}`, { focusSessionId, taskId }, this.getHeaders()).pipe(
      tap((focusSessionTask) => {
        console.log('✅ Task added to focus session:', focusSessionTask);
      })
    );
  }

  removeTaskFromFocusSession(focusSessionId: number, taskId: number): Observable<any> {
    return this.http.delete<any>(`${this.sessionsUrl}/${focusSessionId}/tasks/${taskId}`, this.getHeaders()).pipe(
      tap(() => {
        console.log(`✅ Task ${taskId} removed from focus session ${focusSessionId}`);
      })
    );
  }
}
