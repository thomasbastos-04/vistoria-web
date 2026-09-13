import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { InspectionSummary } from '../../core/models/api.models';
import { InspectionApiService } from '../../core/services/inspection-api.service';
import { statusLabel } from '../../shared/inspection-status';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage {
  private readonly api = inject(InspectionApiService);

  readonly loading = signal(true);
  readonly inspections = signal<InspectionSummary[]>([]);
  readonly templateCount = signal(0);
  readonly completedCount = computed(() => this.inspections().filter(item => item.status === 4).length);
  readonly pendingCount = computed(() => this.inspections().filter(item => [1, 2, 3].includes(item.status)).length);
  readonly statusLabel = statusLabel;

  constructor() {
    forkJoin({
      inspections: this.api.listInspections(),
      templates: this.api.listTemplates()
    }).subscribe({
      next: result => {
        this.inspections.set(result.inspections);
        this.templateCount.set(result.templates.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
