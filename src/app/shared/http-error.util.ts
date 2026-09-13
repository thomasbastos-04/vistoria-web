import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../core/models/api.models';

export function getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const problem = error.error as ProblemDetails | undefined;
    return problem?.title ?? 'Não foi possível concluir a operação.';
  }

  return 'Ocorreu um erro inesperado.';
}
