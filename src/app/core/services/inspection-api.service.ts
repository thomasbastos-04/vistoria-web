import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CreateInspectionRequest,
  CreatedInspection,
  CreateTemplateRequest,
  InspectionSummary,
  InspectionTemplate,
  PublicInspection
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class InspectionApiService {
  private readonly http = inject(HttpClient);

  listTemplates() {
    return this.http.get<InspectionTemplate[]>('/api/templates');
  }

  createTemplate(request: CreateTemplateRequest) {
    return this.http.post<{ id: string }>('/api/templates', request);
  }

  listInspections() {
    return this.http.get<InspectionSummary[]>('/api/inspections');
  }

  createInspection(request: CreateInspectionRequest) {
    return this.http.post<CreatedInspection>('/api/inspections', request);
  }

  sendInspection(inspectionId: string, publicToken: string) {
    return this.http.post<void>(`/api/inspections/${inspectionId}/send`, { publicToken });
  }

  getPublicInspection(publicToken: string) {
    return this.http.get<PublicInspection>(`/api/public/inspections/${publicToken}`);
  }

  uploadPhoto(publicToken: string, requirementId: string, photo: File) {
    const body = new FormData();
    body.append('photo', photo);
    return this.http.post<void>(
      `/api/public/inspections/${publicToken}/photos/${requirementId}`,
      body
    );
  }

  completeInspection(publicToken: string, notes: string) {
    return this.http.post<void>(
      `/api/public/inspections/${publicToken}/complete`,
      { notes: notes || null }
    );
  }
}
