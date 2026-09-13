import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { PublicInspection } from '../../core/models/api.models';
import { InspectionApiService } from '../../core/services/inspection-api.service';
import { getErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-public-inspection-page',
  imports: [DatePipe, FormsModule],
  templateUrl: './public-inspection.page.html',
  styleUrl: './public-inspection.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicInspectionPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(InspectionApiService);

  readonly token = this.route.snapshot.paramMap.get('token') ?? '';
  readonly inspection = signal<PublicInspection | null>(null);
  readonly loading = signal(true);
  readonly uploadingRequirementId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly completed = signal(false);
  readonly errorMessage = signal('');
  notes = '';

  constructor() {
    this.loadInspection();
  }

  selectPhoto(requirementId: string | undefined, event: Event): void {
    const input = event.target as HTMLInputElement;
    const photo = input.files?.[0];

    if (!requirementId || !photo) {
      return;
    }

    this.uploadingRequirementId.set(requirementId);
    this.errorMessage.set('');
    this.api.uploadPhoto(this.token, requirementId, photo).pipe(
      finalize(() => {
        this.uploadingRequirementId.set(null);
        input.value = '';
      })
    ).subscribe({
      next: () => this.loadInspection(false),
      error: error => this.errorMessage.set(getErrorMessage(error))
    });
  }

  complete(): void {
    if (!this.canComplete()) {
      this.errorMessage.set('Envie todas as fotos obrigatórias para continuar.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    this.api.completeInspection(this.token, this.notes).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: () => this.completed.set(true),
      error: error => this.errorMessage.set(getErrorMessage(error))
    });
  }

  canComplete(): boolean {
    return this.inspection()?.requirements
      .filter(item => item.required)
      .every(item => item.uploaded) ?? false;
  }

  completedRequirements(): number {
    return this.inspection()?.requirements.filter(item => item.uploaded).length ?? 0;
  }

  private loadInspection(showLoading = true): void {
    if (showLoading) {
      this.loading.set(true);
    }

    this.api.getPublicInspection(this.token).subscribe({
      next: inspection => {
        this.inspection.set(inspection);
        this.loading.set(false);
      },
      error: error => {
        this.errorMessage.set(getErrorMessage(error));
        this.loading.set(false);
      }
    });
  }
}
