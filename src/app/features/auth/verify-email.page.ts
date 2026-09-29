import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { getErrorMessage } from '../../shared/http-error.util';

const CODE_VALIDITY_SECONDS = 15 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

@Component({
  selector: 'app-verify-email-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-email.page.html',
  styleUrl: './auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyEmailPage implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private timerId: ReturnType<typeof setInterval> | undefined;

  readonly loading = signal(false);
  readonly resending = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly secondsRemaining = signal(CODE_VALIDITY_SECONDS);
  readonly resendSecondsRemaining = signal(0);
  readonly attempts = signal(0);
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.form.controls.email.setValue(email);
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  onCodeInput(): void {
    const control = this.form.controls.code;
    const sanitizedCode = control.value.replace(/\D/g, '').slice(0, 6);
    if (sanitizedCode !== control.value) {
      control.setValue(sanitizedCode);
    }
  }

  submit(): void {
    if (this.attempts() >= MAX_ATTEMPTS) {
      this.errorMessage.set('Você atingiu o limite de tentativas. Solicite um novo código para continuar.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.attempts.update(value => value + 1);
    this.authService.verifyEmail(this.form.getRawValue()).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => {
        this.successMessage.set('E-mail verificado com sucesso. Redirecionando...');
        setTimeout(() => void this.router.navigate(['/dashboard']), 700);
      },
      error: error => this.errorMessage.set(this.getVerificationError(error))
    });
  }

  resendCode(): void {
    if (this.resendSecondsRemaining() > 0 || this.resending()) {
      return;
    }

    const email = this.form.controls.email.value;
    if (!email || this.form.controls.email.invalid) {
      this.form.controls.email.markAsTouched();
      this.errorMessage.set('Informe um e-mail válido para reenviar o código.');
      return;
    }

    this.resending.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.authService.resendVerificationCode(email).pipe(
      finalize(() => this.resending.set(false))
    ).subscribe({
      next: () => {
        this.secondsRemaining.set(CODE_VALIDITY_SECONDS);
        this.attempts.set(0);
        this.form.controls.code.reset('');
        this.resendSecondsRemaining.set(RESEND_COOLDOWN_SECONDS);
        this.successMessage.set(`Novo código enviado para ${email}. Verifique também sua caixa de spam.`);
      },
      error: error => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.errorMessage.set('O reenvio ainda não está disponível. Tente recuperar o acesso ou entre em contato com o suporte.');
          return;
        }
        this.errorMessage.set(getErrorMessage(error));
      }
    });
  }

  formattedTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  }

  private tick(): void {
    this.secondsRemaining.update(value => Math.max(0, value - 1));
    this.resendSecondsRemaining.update(value => Math.max(0, value - 1));
  }

  private getVerificationError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return 'Código inválido ou expirado. Solicite um novo código.';
      }
      if (error.status === 404) {
        return 'Usuário não encontrado.';
      }
    }

    return `${getErrorMessage(error)} Tente novamente em instantes.`;
  }
}
