import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, switchMap } from 'rxjs';
import { CreatedInspection, InspectionSummary, InspectionTemplate } from '../../core/models/api.models';
import { InspectionApiService } from '../../core/services/inspection-api.service';
import { getErrorMessage } from '../../shared/http-error.util';
import { statusLabel } from '../../shared/inspection-status';

@Component({
  selector: 'app-inspections-page',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './inspections.page.html',
  styleUrl: './inspections.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InspectionsPage {
  private readonly api = inject(InspectionApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly inspections = signal<InspectionSummary[]>([]);
  readonly templates = signal<InspectionTemplate[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly modalOpen = signal(false);
  readonly errorMessage = signal('');
  readonly createdInspection = signal<CreatedInspection | null>(null);
  readonly statusLabel = statusLabel;
  readonly form = this.formBuilder.nonNullable.group({
    templateId: ['', Validators.required], recipientName: ['', Validators.required],
    recipientEmail: ['', [Validators.required, Validators.email]], assetIdentification: ['', Validators.required],
    linkValidDays: [7, [Validators.required, Validators.min(1), Validators.max(30)]], sendNow: [true]
  });

  constructor() { this.loadData(); }

  openModal(): void { this.form.reset({ templateId: '', recipientName: '', recipientEmail: '', assetIdentification: '', linkValidDays: 7, sendNow: true }); this.errorMessage.set(''); this.createdInspection.set(null); this.modalOpen.set(true); }

  create(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { sendNow, ...request } = this.form.getRawValue();
    this.saving.set(true); this.errorMessage.set('');
    this.api.createInspection(request).pipe(
      switchMap(created => { this.createdInspection.set(created); return sendNow ? this.api.sendInspection(created.id, created.publicToken) : [undefined]; }),
      finalize(() => this.saving.set(false))
    ).subscribe({ next: () => this.loadData(), error: error => this.errorMessage.set(getErrorMessage(error)) });
  }

  copyLink(): void { const url = this.createdInspection()?.publicUrl; if (url) void navigator.clipboard.writeText(url); }
  closeModal(): void { this.modalOpen.set(false); this.createdInspection.set(null); }

  private loadData(): void {
    this.loading.set(true);
    this.api.listInspections().subscribe({ next: items => { this.inspections.set(items); this.loading.set(false); }, error: () => this.loading.set(false) });
    this.api.listTemplates().subscribe({ next: items => this.templates.set(items) });
  }
}
