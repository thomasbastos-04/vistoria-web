import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { InspectionTemplate } from '../../core/models/api.models';
import { InspectionApiService } from '../../core/services/inspection-api.service';
import { getErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-templates-page',
  imports: [ReactiveFormsModule],
  templateUrl: './templates.page.html',
  styleUrl: './templates.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesPage {
  private readonly api = inject(InspectionApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly templates = signal<InspectionTemplate[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly modalOpen = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required], category: ['Veicular', Validators.required], description: [''],
    photoRequirements: this.formBuilder.array([this.createRequirement(1)])
  });

  get requirements(): FormArray { return this.form.controls.photoRequirements; }

  constructor() { this.load(); }

  addRequirement(): void { this.requirements.push(this.createRequirement(this.requirements.length + 1)); }
  removeRequirement(index: number): void { if (this.requirements.length > 1) this.requirements.removeAt(index); }
  openModal(): void { this.form.reset({ name: '', category: 'Veicular', description: '' }); this.requirements.clear(); this.addRequirement(); this.errorMessage.set(''); this.modalOpen.set(true); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    this.saving.set(true); this.errorMessage.set('');
    this.api.createTemplate({ ...value, description: value.description || undefined }).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => { this.modalOpen.set(false); this.load(); },
      error: error => this.errorMessage.set(getErrorMessage(error))
    });
  }

  private load(): void { this.loading.set(true); this.api.listTemplates().subscribe({ next: items => { this.templates.set(items); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  private createRequirement(sortOrder: number) { return this.formBuilder.nonNullable.group({ code: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]], label: ['', Validators.required], required: [true], sortOrder: [sortOrder] }); }
}
