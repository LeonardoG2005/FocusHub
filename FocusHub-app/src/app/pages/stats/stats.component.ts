import { Component, ElementRef, inject, ViewChild, OnInit, OnDestroy} from '@angular/core';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { StatsService } from '../../services/stats.service';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-stats',
  imports: [NavComponent,CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent implements OnInit, OnDestroy {

  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;

  barChart!: Chart;
  lineChart!: Chart;
  trendChart!: Chart;

  private themeObserver!: MutationObserver;
  statsService = inject(StatsService);
  sessions: any[] = [];

  availableYears: number[] = [];
  selectedYear: number = new Date().getFullYear();

  completedToday = 0;
  pendingToday = 0;
  progressPercent = 0;
  focusTimeTodayLabel = '0m';
  mostUsedTechnique = '';

  private toLocalDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private getSessionElapsedSeconds(session: any, now: Date = new Date()): number {
    const base = typeof session?.elapsedSeconds === 'number' ? session.elapsedSeconds : 0;

    // If backend doesn't persist elapsedSeconds for completed sessions yet, fall back.
    const fallback = typeof session?.technique?.workTime === 'number' ? session.technique.workTime : 0;

    if (session?.status === 'in_progress' && session?.createdAt) {
      const startedAt = new Date(session.createdAt);
      const delta = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      return Math.max(0, base + (Number.isFinite(delta) ? delta : 0));
    }

    return Math.max(0, base || fallback);
  }

  private formatDuration(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const totalMinutes = Math.floor(safeSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }

  ngOnInit(): void {
    this.statsService.getSessionsData().subscribe(data => {
      this.sessions = data.map(session => ({
        ...session,
        expanded: false
      }));

      this.availableYears = Array.from(
        new Set(
          this.sessions
            .map((s) => (s?.createdAt ? new Date(s.createdAt).getFullYear() : null))
            .filter((y): y is number => typeof y === 'number' && Number.isFinite(y))
        )
      ).sort((a, b) => b - a);

      if (this.availableYears.length > 0 && !this.availableYears.includes(this.selectedYear)) {
        this.selectedYear = this.availableYears[0];
      }

      this.processStats();
      console.log(this.sessions)
      this.createCharts();

    });

    // Observa cambios en el atributo data-theme
  this.themeObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'data-theme'
      ) {
        this.updateChartThemes();
      }
    }
  });

  this.themeObserver.observe(document.documentElement, {
    attributes: true
  });
  }

  setSelectedYear(year: string | number): void {
    const next = typeof year === 'string' ? Number(year) : year;
    if (!Number.isFinite(next)) return;
    if (next === this.selectedYear) return;

    this.selectedYear = next;
    this.createLineChart();
    this.createTrendChart();
  }

  private getBaseDateForSelectedYear(): Date {
    const today = new Date();
    const originalMonth = today.getMonth();

    const base = new Date(today);
    base.setFullYear(this.selectedYear);

    // Handle Feb 29 -> Feb 28 when selected year is not leap.
    if (base.getMonth() !== originalMonth) {
      base.setDate(0);
    }

    return base;
  }

  private formatMonthDay(dateKey: string): string {
    // dateKey is YYYY-MM-DD
    if (typeof dateKey !== 'string' || dateKey.length < 10) return dateKey;
    return dateKey.slice(5);
  }

  ngOnDestroy(): void {
  if (this.barChart) {
    this.barChart.destroy();
  }
  if (this.lineChart) {
    this.lineChart.destroy();
  }
  if (this.trendChart) {
    this.trendChart.destroy();
  }
  if (this.themeObserver) this.themeObserver.disconnect(); // 👈
}

  private updateChartThemes(): void {
  this.createCharts();
}
  private getChartColors() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      return {
        text: '#FFFFFF',
        grid: '#444',
        bar: 'rgba(100, 181, 246, 0.7)',
        lineBorder: 'rgba(255, 138, 128, 0.8)',
        lineBg: 'rgba(255, 138, 128, 0.3)',
        trendBorder: 'rgba(129, 212, 250, 0.8)',
        trendBg: 'rgba(129, 212, 250, 0.3)',
      };
    } else {
      return {
        text: '#333333',
        grid: '#ddd',
        bar: 'rgba(54, 162, 235, 0.7)',
        lineBorder: 'rgba(255, 99, 132, 0.8)',
        lineBg: 'rgba(255, 99, 132, 0.3)',
        trendBorder: 'rgba(75, 192, 192, 0.8)',
        trendBg: 'rgba(75, 192, 192, 0.3)',
      };
    }
  }

  private getChartOptions(xLabel: string, yLabel: string): any {
    const colors = this.getChartColors();
    return {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yLabel,
            color: colors.text,
          },
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        },
        x: {
          title: {
            display: true,
            text: xLabel,
            color: colors.text,
          },
          ticks: { color: colors.text },
          grid: { color: colors.grid }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: colors.text
          }
        },
        title: {
          color: colors.text
        }
      }
    };
  }

  private createCharts(): void {
    this.createBarChart();
    this.createLineChart();
    this.createTrendChart();
  }

  private createBarChart(): void {
    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Datos de técnica y horas totales (sumar por técnica)
    const techniqueTimes: Record<string, number> = {};
    const now = new Date();
    for (const session of this.sessions) {
      if (!session?.technique?.name) continue;
      if (!['completed', 'paused', 'in_progress'].includes(session.status)) continue;

      const name = session.technique.name;
      const elapsedSeconds = this.getSessionElapsedSeconds(session, now);
      techniqueTimes[name] = (techniqueTimes[name] || 0) + elapsedSeconds / 3600;
    }

    if (this.barChart) {
      this.barChart.destroy();
    }

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(techniqueTimes),
        datasets: [{
          label: 'Horas de concentración',
          data: Object.values(techniqueTimes).map((v) => +v.toFixed(2)),
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }]
      },
      options: this.getChartOptions('Técnica', 'Horas')
    });
  }

  private createLineChart(): void {
    const ctx = this.lineChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Tareas completadas por día (últimos 7 días)
    const baseDate = this.getBaseDateForSelectedYear();
    const tasksPerDay: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const key = this.toLocalDateKey(d);
      tasksPerDay[key] = 0;
    }

    for (const session of this.sessions) {
      for (const fst of session.focusSessionTasks) {
        const date = this.toLocalDateKey(new Date(fst.task.createdAt));
        if (date in tasksPerDay && fst.task.status === 'completed') {
          tasksPerDay[date]++;
        }
      }
    }

    if (this.lineChart) {
      this.lineChart.destroy();
    }

    const dateKeys = Object.keys(tasksPerDay);
    const labels = dateKeys.map((k) => this.formatMonthDay(k));

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Tareas completadas',
          data: Object.values(tasksPerDay),
          borderColor: 'rgba(255, 99, 132, 0.8)',
          backgroundColor: 'rgba(255, 99, 132, 0.3)',
          fill: false,
          tension: 0.3,
          pointRadius: 5
        }]
      },
      options: this.getChartOptions('Fecha', 'Cantidad de tareas')
    });
  }

  private createTrendChart(): void {
    const ctx = this.trendChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Horas de concentración por día (últimos 7 días)
    const baseDate = this.getBaseDateForSelectedYear();
    const focusPerDay: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const key = this.toLocalDateKey(d);
      focusPerDay[key] = 0;
    }

    const now = new Date();
    for (const session of this.sessions) {
      if (!['completed', 'paused', 'in_progress'].includes(session.status)) continue;
      const date = this.toLocalDateKey(new Date(session.createdAt));
      if (!(date in focusPerDay)) continue;

      const elapsedSeconds = this.getSessionElapsedSeconds(session, now);
      focusPerDay[date] += elapsedSeconds / 3600;
    }

    if (this.trendChart) {
      this.trendChart.destroy();
    }

    const dateKeys = Object.keys(focusPerDay);
    const labels = dateKeys.map((k) => this.formatMonthDay(k));

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Horas de concentración',
          data: Object.values(focusPerDay).map((v) => +v.toFixed(2)),
          borderColor: 'rgba(75, 192, 192, 0.8)',
          backgroundColor: 'rgba(75, 192, 192, 0.3)',
          fill: false,
          tension: 0.3,
          pointRadius: 5
        }]
      },
      options: this.getChartOptions('Fecha', 'Horas')
    });
  }

  toggleSession(session: any) {
    session.expanded = !session.expanded;
  }

  getSessionDurationLabel(session: any): string {
    return this.formatDuration(this.getSessionElapsedSeconds(session));
  }

  private isSameLocalDay(dateStr: string, date: Date): boolean {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
}

private processStats(): void {
  const today = new Date(); // fecha actual local

  let completedTasks = 0;
  let pendingTasks = 0;
  let focusSeconds = 0;
  const techniqueCount: Record<string, number> = {};

  const now = new Date();

  for (const session of this.sessions) {
    // ¿Esta sesión es de hoy? (local)
    const isTodaySession = this.isSameLocalDay(session.createdAt, today);

    if (isTodaySession && ['completed', 'paused', 'in_progress'].includes(session.status)) {
      focusSeconds += this.getSessionElapsedSeconds(session, now);
    }

    // Contar técnica usada (en todas las sesiones)
    const techniqueName = session.technique.name;
    techniqueCount[techniqueName] = (techniqueCount[techniqueName] || 0) + 1;

    for (const fst of session.focusSessionTasks) {
      // ¿Esta tarea fue creada hoy (local)?
      if (this.isSameLocalDay(fst.task.createdAt, today)) {
        if (fst.task.status === 'completed') completedTasks++;
        if (fst.task.status !== 'completed') pendingTasks++;
      }
    }
  }

  const totalTasks = completedTasks + pendingTasks;

  this.completedToday = completedTasks;
  this.pendingToday = pendingTasks;
  this.progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  this.focusTimeTodayLabel = this.formatDuration(focusSeconds);

  // Técnica más usada global
  this.mostUsedTechnique = Object.entries(techniqueCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

}